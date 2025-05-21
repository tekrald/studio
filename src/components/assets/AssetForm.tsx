
"use client";
import type { FormEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];


const formSchema = z.object({
  tipo: z.enum(['digital', 'fisico'], { required_error: "Selecione o tipo de ativo." }),
  nomeAtivo: z.string().min(3, 'O nome do ativo deve ter pelo menos 3 caracteres.'),
  descricaoDetalhada: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  valorAtualEstimado: z.preprocess(
    (val) => parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'O valor estimado deve ser positivo.')
  ),
  observacoesInvestimento: z.string().optional(),
  dataAquisicao: z.date({ required_error: "A data de aquisição é obrigatória." }),
  
  // Campos Digitais Condicionais
  tipoCriptoAtivoDigital: z.string().optional(),
  quantidadeDigital: z.preprocess(
    (val) => String(val) === '' ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A quantidade deve ser positiva.').optional()
  ),
  valorPagoEpocaDigital: z.preprocess(
    (val) => String(val) === '' ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'O valor pago deve ser positivo.').optional()
  ),

  // Campos Físicos Condicionais
  tipoImovelBemFisico: z.string().optional(),
  enderecoLocalizacaoFisico: z.string().optional(),
  documentacaoFisicoFile: z.any()
    // .refine((files) => files?.length >= 1 ? files?.[0]?.size <= MAX_FILE_SIZE : true, `Tamanho máximo do arquivo é 5MB.`)
    // .refine((files) => files?.length >= 1 ? ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type) : true, "Formato de arquivo inválido.")
    .optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === 'digital') {
    if (!data.tipoCriptoAtivoDigital || data.tipoCriptoAtivoDigital.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de ativo digital é obrigatório.", path: ['tipoCriptoAtivoDigital'] });
    }
    if (data.quantidadeDigital === undefined || data.quantidadeDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Quantidade é obrigatória.", path: ['quantidadeDigital'] });
    }
     if (data.valorPagoEpocaDigital === undefined || data.valorPagoEpocaDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor pago é obrigatório.", path: ['valorPagoEpocaDigital'] });
    }
  }
  if (data.tipo === 'fisico') {
    if (!data.tipoImovelBemFisico || data.tipoImovelBemFisico.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de bem físico é obrigatório.", path: ['tipoImovelBemFisico'] });
    }
  }
});


interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<AssetFormData>;
  onClose: () => void;
}

export function AssetForm({ onSubmit, isLoading, initialData, onClose }: AssetFormProps) {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      tipo: undefined,
      nomeAtivo: '',
      descricaoDetalhada: '',
      valorAtualEstimado: 0,
      observacoesInvestimento: '',
      dataAquisicao: new Date(),
    },
  });

  const assetType = form.watch('tipo');

  const handleFormSubmit = async (values: AssetFormData) => {
    // console.log("Valores do formulário:", values);
    await onSubmit(values);
    // form.reset(); // Reset form on successful submission by parent
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="tipo">Tipo de Ativo</Label>
          <Controller
            name="tipo"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo de ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Patrimônio Digital</SelectItem>
                  <SelectItem value="fisico">Patrimônio Físico</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.tipo && <p className="text-sm text-destructive">{form.formState.errors.tipo.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="nomeAtivo">Nome do Ativo</Label>
          <Input id="nomeAtivo" {...form.register('nomeAtivo')} placeholder="Ex: Bitcoin, Casa da Praia" disabled={isLoading} />
          {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="descricaoDetalhada">Descrição Detalhada</Label>
        <Textarea id="descricaoDetalhada" {...form.register('descricaoDetalhada')} placeholder="Descreva o ativo..." disabled={isLoading} rows={3}/>
        {form.formState.errors.descricaoDetalhada && <p className="text-sm text-destructive">{form.formState.errors.descricaoDetalhada.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="valorAtualEstimado">Valor Atual Estimado (R$)</Label>
          <Input id="valorAtualEstimado" type="number" {...form.register('valorAtualEstimado')} placeholder="0,00" disabled={isLoading} step="0.01" />
          {form.formState.errors.valorAtualEstimado && <p className="text-sm text-destructive">{form.formState.errors.valorAtualEstimado.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
           <Controller
            name="dataAquisicao"
            control={form.control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isLoading}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {form.formState.errors.dataAquisicao && <p className="text-sm text-destructive">{form.formState.errors.dataAquisicao.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoesInvestimento">Observações/Detalhes de Investimento</Label>
        <Textarea id="observacoesInvestimento" {...form.register('observacoesInvestimento')} placeholder="Ex: João deu R$10.000 de entrada, Maria R$5.000..." disabled={isLoading} rows={4} />
        {form.formState.errors.observacoesInvestimento && <p className="text-sm text-destructive">{form.formState.errors.observacoesInvestimento.message}</p>}
      </div>

      {/* Campos Condicionais */}
      {assetType === 'digital' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/30">
          <h4 className="text-lg font-semibold text-primary">Detalhes do Ativo Digital</h4>
          <div className="space-y-1.5">
            <Label htmlFor="tipoCriptoAtivoDigital">Tipo de Criptomoeda/Ativo Digital</Label>
            <Input id="tipoCriptoAtivoDigital" {...form.register('tipoCriptoAtivoDigital')} placeholder="Ex: Bitcoin, Ethereum, NFT" disabled={isLoading}/>
            {form.formState.errors.tipoCriptoAtivoDigital && <p className="text-sm text-destructive">{form.formState.errors.tipoCriptoAtivoDigital.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantidadeDigital">Quantidade</Label>
              <Input id="quantidadeDigital" type="number" {...form.register('quantidadeDigital')} placeholder="Ex: 0.5" disabled={isLoading} step="any"/>
              {form.formState.errors.quantidadeDigital && <p className="text-sm text-destructive">{form.formState.errors.quantidadeDigital.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valorPagoEpocaDigital">Valor Pago na Época (Total ou por Unidade)</Label>
              <Input id="valorPagoEpocaDigital" type="number" {...form.register('valorPagoEpocaDigital')} placeholder="R$ 0,00" disabled={isLoading} step="0.01"/>
              {form.formState.errors.valorPagoEpocaDigital && <p className="text-sm text-destructive">{form.formState.errors.valorPagoEpocaDigital.message}</p>}
            </div>
          </div>
        </div>
      )}

      {assetType === 'fisico' && (
         <div className="space-y-4 p-4 border rounded-md bg-muted/30">
          <h4 className="text-lg font-semibold text-primary">Detalhes do Ativo Físico</h4>
          <div className="space-y-1.5">
            <Label htmlFor="tipoImovelBemFisico">Tipo de Imóvel/Bem</Label>
            <Input id="tipoImovelBemFisico" {...form.register('tipoImovelBemFisico')} placeholder="Ex: Casa, Apartamento, Carro, Jóia" disabled={isLoading}/>
            {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enderecoLocalizacaoFisico">Endereço/Localização (Opcional para imóveis)</Label>
            <Input id="enderecoLocalizacaoFisico" {...form.register('enderecoLocalizacaoFisico')} placeholder="Ex: Rua Exemplo, 123, Cidade - UF" disabled={isLoading}/>
            {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="documentacaoFisicoFile">Documentação (Opcional)</Label>
            <Input id="documentacaoFisicoFile" type="file" {...form.register('documentacaoFisicoFile')} disabled={isLoading} 
                   className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-muted-foreground">Max 5MB. Tipos: JPG, PNG, PDF.</p>
            {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading || !assetType}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Ativo
        </Button>
      </div>
    </form>
  );
}
