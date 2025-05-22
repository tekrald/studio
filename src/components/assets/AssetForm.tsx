
"use client";
import { useState, type FormEvent, useEffect } from 'react';
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
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset';
import { useAuth } from '@/components/auth-provider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const formSchema = z.object({
  tipo: z.enum(['digital', 'fisico'], { required_error: "Selecione o tipo de ativo." }),
  nomeAtivo: z.string().min(1, 'O nome do ativo é obrigatório.'),
  dataAquisicao: z.date({ required_error: "A data de aquisição é obrigatória." }),
  quemComprou: z.string().optional(), // Novo campo
  valorAtualEstimado: z.preprocess(
    (val) => parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'O valor estimado deve ser positivo.')
  ),
  descricaoDetalhada: z.string().min(1, 'A descrição é obrigatória.'),
  
  observacoesInvestimento: z.string().optional(),
  
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
    .optional(),
}).superRefine((data, ctx) => {
  if (data.nomeAtivo.length > 0 && data.nomeAtivo.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O nome do ativo deve ter pelo menos 3 caracteres.", path: ['nomeAtivo'] });
  }
  if (data.descricaoDetalhada.length > 0 && data.descricaoDetalhada.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A descrição detalhada deve ter pelo menos 10 caracteres.", path: ['descricaoDetalhada'] });
  }

  if (data.tipo === 'digital') {
    if (!data.tipoCriptoAtivoDigital || data.tipoCriptoAtivoDigital.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de ativo digital é obrigatório.", path: ['tipoCriptoAtivoDigital'] });
    }
    if (data.quantidadeDigital === undefined || data.quantidadeDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Quantidade é obrigatória para ativo digital.", path: ['quantidadeDigital'] });
    }
     if (data.valorPagoEpocaDigital === undefined || data.valorPagoEpocaDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor pago na época é obrigatório para ativo digital.", path: ['valorPagoEpocaDigital'] });
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

const TOTAL_STEPS = 5; // Atualizado para 5 etapas

export function AssetForm({ onSubmit, isLoading, initialData, onClose }: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      tipo: undefined,
      nomeAtivo: '',
      descricaoDetalhada: '',
      valorAtualEstimado: 0,
      observacoesInvestimento: '',
      dataAquisicao: new Date(),
      quemComprou: '', // Default to empty string, placeholder will handle "Não especificado" display
    },
    mode: "onChange", 
  });

  const assetType = form.watch('tipo');
  const [formError, setFormError] = useState<string | null>(null);

  const [partnerNames, setPartnerNames] = useState<string[]>([]);

  useEffect(() => {
    if (user?.displayName) {
      const names = user.displayName.split('&').map(name => name.trim()).filter(name => name);
      setPartnerNames(names);
    }
  }, [user]);


  const handleFormSubmit = async (values: AssetFormData) => {
    // If 'quemComprou' is our special "UNSPECIFIED_BUYER" value, convert it to empty string or undefined for backend
    const processedValues = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? "" : values.quemComprou,
    };
    await onSubmit(processedValues);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToValidate: (keyof AssetFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['tipo'];
    } else if (step === 2) {
      fieldsToValidate = ['nomeAtivo', 'dataAquisicao'];
    } else if (step === 3) {
      // 'quemComprou' is optional, but if a value is selected it should be valid.
      // The Select component handles this internally.
    } else if (step === 4) {
      fieldsToValidate = ['valorAtualEstimado', 'descricaoDetalhada'];
    } else if (step === 5) {
      if (assetType === 'digital') {
        fieldsToValidate = ['tipoCriptoAtivoDigital', 'quantidadeDigital', 'valorPagoEpocaDigital'];
      } else if (assetType === 'fisico') {
        fieldsToValidate = ['tipoImovelBemFisico']; 
      }
    }

    if (fieldsToValidate.length > 0) {
      await form.trigger(fieldsToValidate);
      const errors = form.formState.errors;
      for (const field of fieldsToValidate) {
        if (errors[field]) {
          setFormError(errors[field]?.message || "Preencha os campos obrigatórios.");
          return false;
        }
      }
    }
    
    if (step === 1 && !form.getValues('tipo')) {
        setFormError("Selecione o tipo de ativo.");
        return false;
    }
    if (step === 2 && (!form.getValues('nomeAtivo').trim() || !form.getValues('dataAquisicao'))) {
        setFormError("Nome do ativo e data de aquisição são obrigatórios.");
        return false;
    }
     if (step === 4 && (!form.getValues('descricaoDetalhada').trim() || form.getValues('valorAtualEstimado') === null || form.getValues('valorAtualEstimado') < 0 )) {
        setFormError("Descrição detalhada e valor estimado são obrigatórios.");
        return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (await validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    setFormError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <p className="text-sm text-center text-muted-foreground">Etapa {currentStep} de {TOTAL_STEPS}</p>
      
      {currentStep === 1 && ( // Tipo de Ativo
        <div className="space-y-1.5">
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
      )}

      {currentStep === 2 && ( // Identificação do Ativo
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nomeAtivo">Nome do Ativo</Label>
            <Input id="nomeAtivo" {...form.register('nomeAtivo')} placeholder="Ex: Bitcoin, Casa da Praia" disabled={isLoading} />
            {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
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
                      {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
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
        </>
      )}

      {currentStep === 3 && ( // Propriedade do Ativo
        <div className="space-y-1.5">
          <Label htmlFor="quemComprou">Quem Adquiriu o Ativo?</Label>
           <Controller
            name="quemComprou"
            control={form.control}
            render={({ field }) => (
              <Select 
                onValueChange={(value) => field.onChange(value === "UNSPECIFIED_BUYER" ? "" : value)} 
                value={field.value === "" ? "UNSPECIFIED_BUYER" : field.value}
                disabled={isLoading}
              >
                <SelectTrigger id="quemComprou">
                  <SelectValue placeholder="Selecione quem adquiriu (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNSPECIFIED_BUYER">Não especificado</SelectItem>
                  {partnerNames.length === 1 && (
                    <SelectItem value={partnerNames[0]}>{partnerNames[0]}</SelectItem>
                  )}
                  {partnerNames.length > 1 && partnerNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Se o nome do membro não aparecer, verifique o nome de exibição do casal no Perfil.
          </p>
          {form.formState.errors.quemComprou && <p className="text-sm text-destructive">{form.formState.errors.quemComprou.message}</p>}
        </div>
      )}

      {currentStep === 4 && ( // Valores e Descrição
        <>
          <div className="space-y-1.5">
            <Label htmlFor="valorAtualEstimado">Valor Atual Estimado (R$)</Label>
            <Input id="valorAtualEstimado" type="number" {...form.register('valorAtualEstimado')} placeholder="0,00" disabled={isLoading} step="0.01" />
            {form.formState.errors.valorAtualEstimado && <p className="text-sm text-destructive">{form.formState.errors.valorAtualEstimado.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricaoDetalhada">Descrição Detalhada</Label>
            <Textarea id="descricaoDetalhada" {...form.register('descricaoDetalhada')} placeholder="Descreva o ativo..." disabled={isLoading} rows={3}/>
            {form.formState.errors.descricaoDetalhada && <p className="text-sm text-destructive">{form.formState.errors.descricaoDetalhada.message}</p>}
          </div>
        </>
      )}
      
      {currentStep === 5 && ( // Detalhes Específicos e Observações
        <>
          {assetType === 'digital' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30">
              <h4 className="text-md font-semibold text-primary">Detalhes do Ativo Digital</h4>
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
                  <Label htmlFor="valorPagoEpocaDigital">Valor Pago na Época (R$)</Label>
                  <Input id="valorPagoEpocaDigital" type="number" {...form.register('valorPagoEpocaDigital')} placeholder="R$ 0,00" disabled={isLoading} step="0.01"/>
                  {form.formState.errors.valorPagoEpocaDigital && <p className="text-sm text-destructive">{form.formState.errors.valorPagoEpocaDigital.message}</p>}
                </div>
              </div>
            </div>
          )}

          {assetType === 'fisico' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30">
              <h4 className="text-md font-semibold text-primary">Detalhes do Ativo Físico</h4>
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
          
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="observacoesInvestimento">Observações/Detalhes de Investimento (Opcional)</Label>
            <Textarea id="observacoesInvestimento" {...form.register('observacoesInvestimento')} placeholder="Ex: João deu R$10.000 de entrada, Maria R$5.000..." disabled={isLoading} rows={3} />
            {form.formState.errors.observacoesInvestimento && <p className="text-sm text-destructive">{form.formState.errors.observacoesInvestimento.message}</p>}
          </div>
        </>
      )}
      
      {formError && <p className="text-sm text-destructive text-center">{formError}</p>}

      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button type="button" className="bg-primary hover:bg-primary/90" onClick={handleNextStep} disabled={isLoading || (currentStep === 1 && !assetType) }>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Ativo
          </Button>
        )}
      </div>
    </form>
  );
}


    