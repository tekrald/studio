
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset'; // AssetFormData agora representa uma transação
import { useAuth } from '@/components/auth-provider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

// O schema agora valida os dados de UMA NOVA TRANSAÇÃO ou da primeira aquisição
const formSchema = z.object({
  tipo: z.enum(['digital', 'fisico'], { required_error: "Selecione o tipo de ativo." }),
  nomeAtivo: z.string().min(1, 'O nome do ativo é obrigatório.'), // Nome do ativo principal
  dataAquisicao: z.date({ required_error: "A data de aquisição é obrigatória." }), // Data desta transação
  observacoes: z.string().optional(), // Observações desta transação
  quemComprou: z.string().optional(), // Quem comprou nesta transação
  contribuicaoParceiro1: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
  ),
  contribuicaoParceiro2: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
  ),

  quantidadeDigital: z.preprocess( // Quantidade desta transação
    (val) => String(val) === '' ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A quantidade deve ser positiva.').optional()
  ),
  valorPagoEpocaDigital: z.preprocess( // Valor pago nesta transação
    (val) => String(val) === '' ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'O valor pago deve ser positivo.').optional()
  ),

  // Campos para a primeira transação de um ativo físico
  tipoImovelBemFisico: z.string().optional(),
  enderecoLocalizacaoFisico: z.string().optional(),
  documentacaoFisicoFile: z.any().optional(),

  // Designação e liberação pertencem ao ativo principal, podem ser definidos na primeira transação
  assignedToMemberId: z.string().optional().nullable(),
  setReleaseCondition: z.boolean().optional(),
  releaseTargetAge: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseInt(String(val), 10),
    z.number().min(1, "A idade deve ser positiva.").max(120, "Idade irreal.").optional()
  ),
}).superRefine((data, ctx) => {
  if (data.nomeAtivo.length > 0 && data.nomeAtivo.length < 3) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O nome do ativo deve ter pelo menos 3 caracteres.", path: ['nomeAtivo'] });
  }
  if (data.tipo === 'digital') {
    if (data.quantidadeDigital === undefined || data.quantidadeDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Quantidade é obrigatória para esta transação digital.", path: ['quantidadeDigital'] });
    }
    if (data.valorPagoEpocaDigital === undefined || data.valorPagoEpocaDigital === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor pago nesta transação é obrigatório.", path: ['valorPagoEpocaDigital'] });
    }
  }
  if (data.tipo === 'fisico') {
    // Validação para tipoImovelBemFisico é importante se esta for a *primeira* transação de um ativo físico.
    // O AssetForm não sabe se é a primeira transação, então a validação aqui se aplica.
    if (!data.tipoImovelBemFisico || data.tipoImovelBemFisico.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de bem físico é obrigatório.", path: ['tipoImovelBemFisico'] });
    }
  }
});

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>; // Envia dados de uma nova transação
  isLoading: boolean;
  initialData?: Partial<AssetFormData>; // Pode ser usado para pré-preencher uma nova transação
  onClose: () => void;
  availableMembers: { id: string; name: string; birthDate?: Date | string }[];
  targetMemberId?: string | null;
  existingAssetToUpdate?: { name: string; type: 'digital' | 'fisico'; assignedTo?: string | null }; // Para saber se estamos adicionando a um ativo existente
}

const TOTAL_STEPS = 4; 

export function AssetForm({ 
  onSubmit, 
  isLoading, 
  initialData, 
  onClose, 
  availableMembers = [], 
  targetMemberId,
  existingAssetToUpdate 
}: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      tipo: existingAssetToUpdate?.type || initialData?.tipo || undefined,
      nomeAtivo: existingAssetToUpdate?.name || initialData?.nomeAtivo || '',
      dataAquisicao: initialData?.dataAquisicao || new Date(),
      observacoes: initialData?.observacoes || '',
      quemComprou: initialData?.quemComprou || '',
      contribuicaoParceiro1: initialData?.contribuicaoParceiro1 || undefined,
      contribuicaoParceiro2: initialData?.contribuicaoParceiro2 || undefined,
      quantidadeDigital: initialData?.quantidadeDigital || undefined,
      valorPagoEpocaDigital: initialData?.valorPagoEpocaDigital || undefined,
      tipoImovelBemFisico: initialData?.tipoImovelBemFisico || '',
      enderecoLocalizacaoFisico: initialData?.enderecoLocalizacaoFisico || '',
      assignedToMemberId: targetMemberId || existingAssetToUpdate?.assignedTo || initialData?.assignedToMemberId || "UNASSIGNED",
      setReleaseCondition: initialData?.setReleaseCondition || false,
      releaseTargetAge: initialData?.releaseTargetAge || undefined,
    },
    mode: "onChange",
  });

  const assetType = form.watch('tipo');
  const quemComprouWatch = form.watch('quemComprou');
  const assignedToMemberIdWatch = form.watch('assignedToMemberId');
  const setReleaseConditionWatch = form.watch('setReleaseCondition');
  
  const selectedMemberForRelease = availableMembers.find(m => m.id === assignedToMemberIdWatch);
  const memberHasBirthDate = !!selectedMemberForRelease?.birthDate;

  const [formError, setFormError] = useState<string | null>(null);
  const [partnerNames, setPartnerNames] = useState<string[]>([]);
  const [partnerLabels, setPartnerLabels] = useState<string[]>(["Contribuinte 1", "Contribuinte 2"]);

  useEffect(() => {
    // Se estamos adicionando a um ativo existente, desabilitar campos do ativo principal
    if (existingAssetToUpdate) {
      form.setValue('nomeAtivo', existingAssetToUpdate.name);
      form.setValue('tipo', existingAssetToUpdate.type);
      if (existingAssetToUpdate.assignedTo) {
        form.setValue('assignedToMemberId', existingAssetToUpdate.assignedTo);
      } else {
        form.setValue('assignedToMemberId', "UNASSIGNED");
      }
    } else if (targetMemberId) {
      form.setValue('assignedToMemberId', targetMemberId);
    } else {
       form.setValue('assignedToMemberId', "UNASSIGNED");
    }
  }, [targetMemberId, form, existingAssetToUpdate]);

  useEffect(() => {
    if (user?.displayName) {
      const names = user.displayName.split('&').map(name => name.trim()).filter(name => name);
      setPartnerNames(names);
      if (names.length === 1) {
        setPartnerLabels([names[0], "Outro Contribuinte"]);
      } else if (names.length > 1) {
        setPartnerLabels([names[0], names[1]]);
      }
    }
  }, [user]);

  const handleFormSubmit = async (values: AssetFormData) => {
    const processedValues: AssetFormData = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? "" : values.quemComprou,
      // assignedToMemberId já está correto (string ou null/undefined)
      // releaseCondition e releaseTargetAge são para o ativo principal, não por transação (a menos que o modelo mude)
      // Se for a primeira transação, estes podem definir as propriedades do ativo principal
    };
    await onSubmit(processedValues);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToValidate: (keyof AssetFormData)[] = [];

    if (step === 1) { // Tipo e Nome do Ativo Principal
      fieldsToValidate = ['tipo', 'nomeAtivo'];
       if (existingAssetToUpdate) { // Se atualizando, nome e tipo não são validados aqui, já estão fixos
         fieldsToValidate = [];
       }
    } else if (step === 2) { // Detalhes da Transação: Data, Observações
      fieldsToValidate = ['dataAquisicao', 'observacoes'];
    } else if (step === 3) { // Propriedade e Contribuições (da Transação)
      fieldsToValidate = ['quemComprou'];
      if (form.getValues('quemComprou') === 'Ambos') {
        fieldsToValidate.push('contribuicaoParceiro1', 'contribuicaoParceiro2');
      }
    } else if (step === 4) { // Detalhes Específicos (da Transação ou 1ª do Ativo) e Designação do Ativo Principal
      if (assetType === 'digital') {
        fieldsToValidate = ['quantidadeDigital', 'valorPagoEpocaDigital'];
      } else if (assetType === 'fisico') {
        fieldsToValidate = ['tipoImovelBemFisico', 'enderecoLocalizacaoFisico', 'documentacaoFisicoFile'];
      }
      // Designação e liberação são do ativo principal, validados aqui se for a primeira transação
      // ou se o usuário puder modificar isso ao adicionar transações (revisar essa lógica)
      if (!existingAssetToUpdate) { // Só valida designação se for novo ativo
         fieldsToValidate.push('assignedToMemberId');
         if (form.getValues('setReleaseCondition')) {
            fieldsToValidate.push('releaseTargetAge');
         }
      }
    }

    if (fieldsToValidate.length > 0) {
      await form.trigger(fieldsToValidate);
      const errors = form.formState.errors;
      let firstErrorMessage = null;
      for (const field of fieldsToValidate) {
        if (errors[field]) {
          firstErrorMessage = (errors[field] as any)?.message || "Preencha os campos obrigatórios corretamente.";
          break;
        }
      }
      if (firstErrorMessage) {
        setFormError(firstErrorMessage);
        return false;
      }
    }
     
    if (step === 1 && !form.getValues('tipo') && !existingAssetToUpdate) {
        setFormError("Selecione o tipo de ativo.");
        return false;
    }
    if (step === 1 && !form.getValues('nomeAtivo') && !existingAssetToUpdate) {
        setFormError("O nome do ativo é obrigatório.");
        return false;
    }
    if (step === 4 && form.getValues('setReleaseCondition') && !form.getValues('releaseTargetAge') && memberHasBirthDate && !existingAssetToUpdate ) {
        setFormError("Se a condição de liberação por idade estiver marcada para um membro com data de nascimento, a idade é obrigatória.");
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
      <p className="text-sm text-center text-muted-foreground">
        {existingAssetToUpdate 
          ? `Adicionando nova transação para: ${existingAssetToUpdate.name}` 
          : "Adicionar Novo Ativo"}{" "} 
        (Etapa {currentStep} de {TOTAL_STEPS})
      </p>

      {currentStep === 1 && ( // Tipo e Nome do Ativo Principal
        <>
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo de Ativo</Label>
            <Controller
              name="tipo"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || !!existingAssetToUpdate}>
                  <SelectTrigger id="tipo" >
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
          <div className="space-y-1.5">
            <Label htmlFor="nomeAtivo">Nome do Ativo</Label>
            <Input id="nomeAtivo" {...form.register('nomeAtivo')} placeholder="Ex: Bitcoin, Casa da Praia" disabled={isLoading || !!existingAssetToUpdate} />
            {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
          </div>
        </>
      )}

      {currentStep === 2 && ( // Detalhes da Transação: Data, Observações
        <>
          <div className="space-y-1.5">
            <Label htmlFor="dataAquisicao">Data de Aquisição (desta transação)</Label>
            <Controller
              name="dataAquisicao"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}
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
          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações (desta transação - Opcional)</Label>
            <Textarea id="observacoes" {...form.register('observacoes')} placeholder="Alguma observação sobre esta ação" disabled={isLoading} rows={3} />
            {form.formState.errors.observacoes && <p className="text-sm text-destructive">{form.formState.errors.observacoes.message}</p>}
          </div>
        </>
      )}

      {currentStep === 3 && ( // Propriedade e Contribuições (da Transação)
        <>
          <div className="space-y-1.5">
            <Label htmlFor="quemComprou">Quem Adquiriu/Contribuiu nesta Transação? (Opcional)</Label>
            <Controller
              name="quemComprou"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === "UNSPECIFIED_BUYER" ? "" : value)}
                  value={field.value === "" || field.value === undefined ? "UNSPECIFIED_BUYER" : field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger id="quemComprou">
                    <SelectValue placeholder="Selecione quem adquiriu" />
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

          {quemComprouWatch === 'Ambos' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/30">
              <h4 className="text-md font-semibold text-primary">Detalhes da Contribuição (Opcional)</h4>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro1">Valor Contribuído por {partnerLabels[0]} (R$)</Label>
                <Input
                  id="contribuicaoParceiro1"
                  type="number"
                  {...form.register('contribuicaoParceiro1')}
                  placeholder="0,00"
                  disabled={isLoading}
                  step="0.01"
                />
                {form.formState.errors.contribuicaoParceiro1 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro1.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro2">Valor Contribuído por {partnerLabels[1]} (R$)</Label>
                <Input
                  id="contribuicaoParceiro2"
                  type="number"
                  {...form.register('contribuicaoParceiro2')}
                  placeholder="0,00"
                  disabled={isLoading}
                  step="0.01"
                />
                {form.formState.errors.contribuicaoParceiro2 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro2.message}</p>}
              </div>
            </div>
          )}
        </>
      )}
      
      {currentStep === 4 && ( // Detalhes Específicos da Transação / Primeira Aquisição
        <>
          {assetType === 'digital' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
              <h4 className="text-md font-semibold text-primary">Detalhes da Transação Digital</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantidadeDigital">Quantidade (desta transação)</Label>
                  <Input id="quantidadeDigital" type="number" {...form.register('quantidadeDigital')} placeholder="Ex: 0.5" disabled={isLoading} step="any" />
                  {form.formState.errors.quantidadeDigital && <p className="text-sm text-destructive">{form.formState.errors.quantidadeDigital.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="valorPagoEpocaDigital">Valor pago nesta transação</Label>
                  <Input id="valorPagoEpocaDigital" type="number" {...form.register('valorPagoEpocaDigital')} placeholder="0.00" disabled={isLoading} step="any" />
                  {form.formState.errors.valorPagoEpocaDigital && <p className="text-sm text-destructive">{form.formState.errors.valorPagoEpocaDigital.message}</p>}
                </div>
              </div>
            </div>
          )}

          {assetType === 'fisico' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
              <h4 className="text-md font-semibold text-primary">Detalhes do Ativo Físico (para primeira aquisição)</h4>
              <div className="space-y-1.5">
                <Label htmlFor="tipoImovelBemFisico">Tipo de Imóvel/Bem</Label>
                <Input id="tipoImovelBemFisico" {...form.register('tipoImovelBemFisico')} placeholder="Ex: Casa, Apartamento, Carro, Jóia" disabled={isLoading || !!existingAssetToUpdate} />
                {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enderecoLocalizacaoFisico">Endereço/Localização (Opcional para imóveis)</Label>
                <Input id="enderecoLocalizacaoFisico" {...form.register('enderecoLocalizacaoFisico')} placeholder="Ex: Rua Exemplo, 123, Cidade - UF" disabled={isLoading || !!existingAssetToUpdate} />
                {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="documentacaoFisicoFile">Documentação (Opcional)</Label>
                <Input id="documentacaoFisicoFile" type="file" {...form.register('documentacaoFisicoFile')} disabled={isLoading || !!existingAssetToUpdate}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                />
                <p className="text-xs text-muted-foreground">Max 5MB. Tipos: JPG, PNG, PDF.</p>
                {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
              </div>
            </div>
          )}
          {/* Designação e Liberação são para o ativo principal. Mostrar apenas se for novo ativo */}
          {!existingAssetToUpdate && (
            <div className="space-y-4 p-4 border rounded-md bg-card">
                <h4 className="text-md font-semibold text-primary flex items-center"><UserCheck size={18} className="mr-2"/> Designação e Liberação do Ativo (Opcional)</h4>
                <div className="space-y-1.5">
                <Label htmlFor="assignedToMemberId">Designar Ativo Principal para Membro</Label>
                <Controller
                    name="assignedToMemberId"
                    control={form.control}
                    render={({ field }) => (
                    <Select
                        onValueChange={(value) => field.onChange(value === "UNASSIGNED" ? null : value)} 
                        value={field.value === null || field.value === undefined ? "UNASSIGNED" : field.value}
                        disabled={isLoading || !!targetMemberId} 
                    >
                        <SelectTrigger id="assignedToMemberId">
                        <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="UNASSIGNED">Não Designar / Manter com a União</SelectItem>
                        {availableMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                {form.formState.errors.assignedToMemberId && <p className="text-sm text-destructive">{form.formState.errors.assignedToMemberId.message}</p>}
                </div>

                {assignedToMemberIdWatch && assignedToMemberIdWatch !== "UNASSIGNED" && memberHasBirthDate && (
                <div className="space-y-3 mt-3 p-3 border-t">
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="setReleaseCondition"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    id="setReleaseCondition"
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                />
                            )}
                        />
                        <Label htmlFor="setReleaseCondition" className="font-normal flex items-center">
                        <Clock size={16} className="mr-2 text-blue-500"/> Definir Condição de Liberação por Idade para {selectedMemberForRelease?.name}?
                        </Label>
                    </div>
                    {setReleaseConditionWatch && (
                    <div className="space-y-1.5 pl-6">
                        <Label htmlFor="releaseTargetAge">Liberar aos (idade)</Label>
                        <Input
                        id="releaseTargetAge"
                        type="number"
                        {...form.register('releaseTargetAge')}
                        placeholder="Ex: 18"
                        min="1"
                        disabled={isLoading}
                        />
                        {form.formState.errors.releaseTargetAge && <p className="text-sm text-destructive">{form.formState.errors.releaseTargetAge.message}</p>}
                    </div>
                    )}
                </div>
                )}
                {assignedToMemberIdWatch && assignedToMemberIdWatch !== "UNASSIGNED" && !memberHasBirthDate && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                        Para definir condição de liberação por idade, o membro selecionado ({selectedMemberForRelease?.name || 'Membro'}) precisa ter uma data de nascimento cadastrada.
                    </p>
                )}
            </div>
          )}
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
          <Button type="button" className="bg-primary hover:bg-primary/90" onClick={handleNextStep} disabled={isLoading || (currentStep === 1 && (!assetType || !form.getValues('nomeAtivo')) && !existingAssetToUpdate )}>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingAssetToUpdate ? "Adicionar Transação" : "Salvar Ativo"}
          </Button>
        )}
      </div>
    </form>
  );
}
