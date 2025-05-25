
"use client";
import { useState, type FormEvent, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset';
import { useAuth } from '@/components/auth-provider';

const formSchema = z.object({
  tipo: z.enum(['digital', 'fisico'], { required_error: "Selecione o tipo de ativo." }),
  nomeAtivo: z.string().min(1, 'O nome do ativo é obrigatório.'),
  dataAquisicao: z.date({ required_error: "A data de aquisição é obrigatória." }),
  observacoes: z.string().optional(),
  quemComprou: z.string().optional(),
  contribuicaoParceiro1: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
  ),
  contribuicaoParceiro2: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
  ),
  quantidadeDigital: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'A quantidade deve ser positiva.').optional()
  ),
  valorPagoEpocaDigital: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
    z.number().min(0, 'O valor pago deve ser positivo.').optional()
  ),
  tipoImovelBemFisico: z.string().optional(),
  enderecoLocalizacaoFisico: z.string().optional(),
  documentacaoFisicoFile: z.any().optional(),
  assignedToMemberId: z.string().optional().nullable(),
  setReleaseCondition: z.boolean().optional(),
  releaseTargetAge: z.preprocess(
    (val) => String(val) === '' || val === undefined ? undefined : parseInt(String(val), 10),
    z.number().min(1, "A idade deve ser positiva.").max(120, "Idade irreal.").optional()
  ),
}).superRefine((data, ctx) => {
  if (data.tipo === 'digital' && (data.quantidadeDigital === undefined || data.quantidadeDigital === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Quantidade é obrigatória para esta transação digital.", path: ['quantidadeDigital'] });
  }
  if (data.tipo === 'fisico' && !data.existingAssetToUpdate) { 
    if (!data.tipoImovelBemFisico || data.tipoImovelBemFisico.trim() === '') {
      // Considerado opcional, ou preenchido automaticamente se for uma transação para ativo existente.
    }
  }
   if (data.setReleaseCondition && (data.releaseTargetAge === undefined || data.releaseTargetAge === null) && data.assignedToMemberId && data.memberHasBirthDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A idade de liberação é obrigatória se a condição estiver marcada e o membro tiver data de nascimento.', path: ['releaseTargetAge'] });
  }
}).transform(data => ({
  ...data,
  existingAssetToUpdate: undefined, 
  memberHasBirthDate: undefined
}));


interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  availableMembers: { id: string; name: string; birthDate?: Date | string }[];
  targetMemberId?: string | null;
  existingAssetToUpdate?: {
    name: string;
    type: 'digital' | 'fisico';
    assignedTo?: string | null;
    transactions?: any[]; 
  };
}

const TOTAL_STEPS = 4;

const BitcoinIcon = () => (
  <svg fill="currentColor" className="text-orange-500" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.572 8.93A5.23 5.23 0 0012.03 7.5H8.79a.773.773 0 00-.763.763v7.474c0 .421.342.763.764.763h3.239a5.23 5.23 0 004.542-1.43 3.717 3.717 0 001.016-2.627 3.717 3.717 0 00-1.016-2.627zm-5.226 4.865H9.556v-1.905h1.791v1.905zm0-3.095H9.556v-1.905h1.791v1.905zm3.095 4.642a1.548 1.548 0 01-1.547 1.548h-1.548v-1.905h1.548a1.548 1.548 0 011.547 1.547v.358zm0-3.095a1.548 1.548 0 01-1.547 1.547h-1.548v-1.905h1.548a1.548 1.548 0 011.547 1.548v.357z" />
  </svg>
);

const EthereumIcon = () => (
  <svg fill="currentColor" className="text-gray-600" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.028 2a.75.75 0 00-.73.883l.067.19.001 1.895-4.058 2.135a.75.75 0 00-.316 1.014l.05.08 4.105 6.935.01.018v5.04a.75.75 0 00.748.748l.11-.002.11-.002v-5.04l.01-.018 4.105-6.935a.75.75 0 00-.265-1.094l-4.058-2.135.001-1.895a.75.75 0 00-.621-.856l-.11-.01zM12.028 9.03L14.89 7.5l-2.862-4.833zm0 0L9.166 7.5l2.862-4.833zm-.002 1.08l2.93 5.004L12.026 13zm0 0L9.095 15.114 12.026 13z"/>
  </svg>
);

const SolanaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="stroke-current text-purple-500">
    <defs>
      <linearGradient id="solana_grad_1_form" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style={{stopColor: "rgb(0, 255, 163)", stopOpacity: 1}} /> <stop offset="100%" style={{stopColor: "rgb(220, 30, 255)", stopOpacity: 1}} /> </linearGradient>
      <linearGradient id="solana_grad_2_form" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style={{stopColor: "rgb(153, 69, 255)", stopOpacity: 1}} /> <stop offset="100%" style={{stopColor: "rgb(0, 255, 163)", stopOpacity: 1}} /> </linearGradient>
      <linearGradient id="solana_grad_3_form" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style={{stopColor: "rgb(220, 30, 255)", stopOpacity: 1}} /> <stop offset="100%" style={{stopColor: "rgb(153, 69, 255)", stopOpacity: 1}} /> </linearGradient>
    </defs>
    <path d="M 10,80 L 40,90 L 70,80 L 40,70 Z" fill="url(#solana_grad_1_form)" /> <path d="M 10,50 L 40,60 L 70,50 L 40,40 Z" fill="url(#solana_grad_2_form)" /> <path d="M 10,20 L 40,30 L 70,20 L 40,10 Z" fill="url(#solana_grad_3_form)" />
    <path d="M 30,80 L 60,90 L 90,80 L 60,70 Z" fill="url(#solana_grad_1_form)" opacity="0.5" /> <path d="M 30,50 L 60,60 L 90,50 L 60,40 Z" fill="url(#solana_grad_2_form)" opacity="0.5" /> <path d="M 30,20 L 60,30 L 90,20 L 60,10 Z" fill="url(#solana_grad_3_form)" opacity="0.5" />
  </svg>
);

const cryptoOptions = [
  { value: 'Bitcoin', label: 'Bitcoin', icon: <BitcoinIcon /> },
  { value: 'Ethereum', label: 'Ethereum', icon: <EthereumIcon /> },
  { value: 'Solana', label: 'Solana', icon: <SolanaIcon /> },
];

export function AssetForm({
  onSubmit,
  isLoading: isSubmittingForm,
  onClose,
  availableMembers = [],
  targetMemberId,
  existingAssetToUpdate
}: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: existingAssetToUpdate?.type || undefined,
      nomeAtivo: existingAssetToUpdate?.name || '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      quantidadeDigital: undefined,
      valorPagoEpocaDigital: undefined,
      tipoImovelBemFisico: existingAssetToUpdate?.type === 'fisico' && existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length > 0 ? (existingAssetToUpdate.transactions[0] as any).tipoImovelBemFisico || '' : '',
      enderecoLocalizacaoFisico: existingAssetToUpdate?.type === 'fisico' && existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length > 0 ? (existingAssetToUpdate.transactions[0] as any).enderecoLocalizacaoFisico || '' : '',
      assignedToMemberId: targetMemberId || existingAssetToUpdate?.assignedTo || "UNASSIGNED",
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    },
    mode: "onChange",
  });

  const watchedTipo = form.watch('tipo');
  const watchedNomeAtivo = form.watch('nomeAtivo');
  const watchedDataAquisicao = form.watch('dataAquisicao');
  const quemComprouWatch = form.watch('quemComprou');
  const assignedToMemberIdWatch = form.watch('assignedToMemberId');
  const setReleaseConditionWatch = form.watch('setReleaseCondition');

  const selectedMemberForRelease = availableMembers.find(m => m.id === assignedToMemberIdWatch);
  const memberHasBirthDate = !!selectedMemberForRelease?.birthDate;

  const [formError, setFormError] = useState<string | null>(null);
  const [partnerNames, setPartnerNames] = useState<string[]>([]);
  const [partnerLabels, setPartnerLabels] = useState<string[]>(["Contribuinte 1", "Contribuinte 2"]);

 useEffect(() => {
    const initialValues: Partial<AssetFormData> = {
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      quantidadeDigital: undefined,
      valorPagoEpocaDigital: undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    };

    if (existingAssetToUpdate) {
      initialValues.tipo = existingAssetToUpdate.type;
      initialValues.nomeAtivo = existingAssetToUpdate.name;
      initialValues.tipoImovelBemFisico = existingAssetToUpdate.type === 'fisico' && existingAssetToUpdate.transactions?.length ? (existingAssetToUpdate.transactions[0] as any).tipoImovelBemFisico || '' : '';
      initialValues.enderecoLocalizacaoFisico = existingAssetToUpdate.type === 'fisico' && existingAssetToUpdate.transactions?.length ? (existingAssetToUpdate.transactions[0] as any).enderecoLocalizacaoFisico || '' : '';
      initialValues.assignedToMemberId = existingAssetToUpdate.assignedTo || "UNASSIGNED";
    } else if (targetMemberId) {
      initialValues.tipo = undefined;
      initialValues.nomeAtivo = ''; 
      initialValues.assignedToMemberId = targetMemberId;
      initialValues.tipoImovelBemFisico = '';
      initialValues.enderecoLocalizacaoFisico = '';
    } else { // Novo ativo, não direcionado a membro específico inicialmente
      initialValues.tipo = undefined;
      initialValues.nomeAtivo = '';
      initialValues.assignedToMemberId = "UNASSIGNED";
      initialValues.tipoImovelBemFisico = '';
      initialValues.enderecoLocalizacaoFisico = '';
    }
    form.reset(initialValues);
    setCurrentStep(1);
  }, [targetMemberId, existingAssetToUpdate, form]);


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

  useEffect(() => {
    const fetchPrice = async () => {
      const shouldFetch = watchedTipo === 'digital' && 
                          watchedNomeAtivo && 
                          watchedDataAquisicao && 
                          isValid(new Date(watchedDataAquisicao)) && 
                          cryptoOptions.some(opt => opt.value === watchedNomeAtivo) &&
                          !existingAssetToUpdate; // Only fetch for new assets, not when adding a transaction to existing

      if (shouldFetch) {
        setIsFetchingPrice(true);
        form.setValue('valorPagoEpocaDigital', undefined);

        try {
          const dateString = format(new Date(watchedDataAquisicao), 'yyyy-MM-dd');
          const response = await fetch(`/api/crypto-price?symbol=${encodeURIComponent(watchedNomeAtivo)}&date=${dateString}`);

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao buscar preço da API:", errorData.error || response.statusText);
          } else {
            const data = await response.json();
            if (data.price !== undefined) {
              form.setValue('valorPagoEpocaDigital', data.price, { shouldValidate: true, shouldDirty: true });
            }
          }
        } catch (error) {
          console.error("Falha ao conectar à API de preço:", error);
        } finally {
          setIsFetchingPrice(false);
        }
      }
    };
    fetchPrice();
  }, [watchedTipo, watchedNomeAtivo, watchedDataAquisicao, form, existingAssetToUpdate]);


  const handleFormSubmit = async (values: AssetFormData) => {
    const processedValues: AssetFormData = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? "" : values.quemComprou,
      assignedToMemberId: values.assignedToMemberId === "UNASSIGNED" || values.assignedToMemberId === null ? undefined : values.assignedToMemberId,
    };
    await onSubmit(processedValues);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToValidate: (keyof AssetFormData)[] = [];
    let currentValues = form.getValues();

    if (step === 1) {
      fieldsToValidate = ['tipo'];
       if (!existingAssetToUpdate) { // Only validate nomeAtivo if it's a new asset
         fieldsToValidate.push('nomeAtivo');
       }
    } else if (step === 2) {
      fieldsToValidate = ['dataAquisicao', 'observacoes'];
    } else if (step === 3) {
      fieldsToValidate = ['quemComprou'];
      if (currentValues.quemComprou === 'Ambos') {
        fieldsToValidate.push('contribuicaoParceiro1', 'contribuicaoParceiro2');
      }
    } else if (step === 4) {
      if (currentValues.tipo === 'digital') {
        fieldsToValidate = ['quantidadeDigital', 'valorPagoEpocaDigital'];
      } else if (currentValues.tipo === 'fisico') {
         if(!existingAssetToUpdate || (existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length === 0) ) {
           fieldsToValidate.push('tipoImovelBemFisico');
         }
      }
      if (!existingAssetToUpdate) {
        fieldsToValidate.push('assignedToMemberId');
        if (currentValues.setReleaseCondition && memberHasBirthDate) {
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
    if (step === 1 && !currentValues.tipo) {
        setFormError("Selecione o tipo de ativo."); return false;
    }
    if (step === 1 && !existingAssetToUpdate && (!currentValues.nomeAtivo || currentValues.nomeAtivo.trim().length < 1)) {
        setFormError("O nome do ativo é obrigatório."); return false;
    }
     if (step === 4 && currentValues.tipo === 'digital' && (currentValues.quantidadeDigital === undefined || currentValues.quantidadeDigital === null) ) {
        setFormError("Quantidade é obrigatória para esta transação digital."); return false;
    }
    if (step === 4 && currentValues.setReleaseCondition && (currentValues.releaseTargetAge === undefined || currentValues.releaseTargetAge === null) && !existingAssetToUpdate && memberHasBirthDate) {
        setFormError("Se a condição de liberação por idade estiver marcada e o membro tiver data de nascimento, a idade é obrigatória."); return false;
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

  const isNextButtonDisabled = () => {
    if (isSubmittingForm || isFetchingPrice) return true;
    if (currentStep === 1) {
        if (existingAssetToUpdate) return !watchedTipo;
        if (watchedTipo === 'digital') return !watchedTipo || !watchedNomeAtivo; // For digital, watchedNomeAtivo is from select
        return !watchedTipo || !watchedNomeAtivo || watchedNomeAtivo.trim().length < 1;
    }
    return false;
  };


  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <p className="text-sm text-center text-muted-foreground">
        {existingAssetToUpdate
          ? `Adicionando nova transação para: ${existingAssetToUpdate.name}`
          : "Adicionar Novo Ativo"}{" "}
        (Etapa {currentStep} de {TOTAL_STEPS})
      </p>

      {currentStep === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo de Ativo</Label>
            <Controller
              name="tipo"
              control={form.control}
              render={({ field }) => (
                <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmittingForm || !!existingAssetToUpdate}
                >
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

          {watchedTipo === 'digital' && !existingAssetToUpdate && (
             <div className="space-y-1.5">
                <Label htmlFor="nomeAtivoDigitalSelect">Escolha a Criptomoeda</Label>
                <Controller
                    name="nomeAtivo"
                    control={form.control}
                    render={({ field }) => (
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmittingForm || !!existingAssetToUpdate}
                    >
                        <SelectTrigger id="nomeAtivoDigitalSelect">
                        <SelectValue placeholder="Selecione a criptomoeda" />
                        </SelectTrigger>
                        <SelectContent>
                        {cryptoOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                                {opt.icon}
                                <span>{opt.label}</span>
                            </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
            </div>
          )}

         {watchedTipo === 'fisico' && !existingAssetToUpdate && (
            <div className="space-y-1.5">
                <Label htmlFor="nomeAtivoFisicoInput">Nome do Ativo</Label>
                <Input
                    id="nomeAtivoFisicoInput"
                    {...form.register('nomeAtivo')}
                    placeholder={"Ex: Casa da Praia, Ações XPTO"}
                    disabled={isSubmittingForm || !!existingAssetToUpdate}
                />
                {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
            </div>
          )}

          {existingAssetToUpdate && (
             <div className="space-y-1.5">
                <Label htmlFor="nomeAtivoExistente">Nome do Ativo</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 h-10">
                    {existingAssetToUpdate.type === 'digital' && cryptoOptions.find(opt => opt.value === existingAssetToUpdate.name)?.icon}
                    <span>{existingAssetToUpdate.name}</span>
                </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && (
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
                      disabled={isSubmittingForm}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "PPP 'às' HH:mm", { locale: ptBR }) : <span>Escolha uma data e hora</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value && isValid(new Date(field.value)) ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        const currentVal = field.value && isValid(new Date(field.value)) ? new Date(field.value) : new Date();
                        const newDate = date ? new Date(date) : currentVal;
                        if (isValid(currentVal) && isValid(newDate)) {
                            newDate.setHours(currentVal.getHours());
                            newDate.setMinutes(currentVal.getMinutes());
                            field.onChange(newDate);
                        } else if (isValid(newDate)) {
                            field.onChange(newDate);
                        }
                      }}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isSubmittingForm}
                    />
                    <div className="p-2 border-t">
                      <Label htmlFor="time" className="text-sm">Hora da Aquisição</Label>
                       <Input
                        id="time"
                        type="time"
                        defaultValue={field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "HH:mm") : "00:00"}
                        onChange={(e) => {
                            const currentTime = field.value && isValid(new Date(field.value)) ? new Date(field.value) : new Date();
                            const [hours, minutes] = e.target.value.split(':');
                            if (isValid(currentTime)) {
                                currentTime.setHours(parseInt(hours,10));
                                currentTime.setMinutes(parseInt(minutes,10));
                                field.onChange(new Date(currentTime));
                            }
                        }}
                        className="w-full mt-1"
                        disabled={isSubmittingForm}
                       />
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.dataAquisicao && <p className="text-sm text-destructive">{form.formState.errors.dataAquisicao.message}</p>}
          </div>
           <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações (desta transação - Opcional)</Label>
            <Input id="observacoes" {...form.register('observacoes')} placeholder="Alguma observação sobre esta ação" disabled={isSubmittingForm} />
            {form.formState.errors.observacoes && <p className="text-sm text-destructive">{form.formState.errors.observacoes.message}</p>}
          </div>
        </>
      )}

      {currentStep === 3 && (
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
                  disabled={isSubmittingForm}
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
                  disabled={isSubmittingForm}
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
                  disabled={isSubmittingForm}
                  step="0.01"
                />
                {form.formState.errors.contribuicaoParceiro2 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro2.message}</p>}
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 4 && (
        <>
          {watchedTipo === 'digital' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
              <h4 className="text-md font-semibold text-primary">Detalhes da Transação Digital</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantidadeDigital">Quantidade (desta transação)</Label>
                  <Input id="quantidadeDigital" type="number" {...form.register('quantidadeDigital')} placeholder="Ex: 0.5" disabled={isSubmittingForm} step="any" />
                  {form.formState.errors.quantidadeDigital && <p className="text-sm text-destructive">{form.formState.errors.quantidadeDigital.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="valorPagoEpocaDigital">Valor do ativo no momento da compra</Label>
                     {isFetchingPrice && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <Input id="valorPagoEpocaDigital" type="number" {...form.register('valorPagoEpocaDigital')} placeholder="Ex: 150.75" disabled={isSubmittingForm || isFetchingPrice} step="any" />
                   <p className="text-xs text-muted-foreground">Preço populado automaticamente (simulação). Você pode ajustar.</p>
                  {form.formState.errors.valorPagoEpocaDigital && <p className="text-sm text-destructive">{form.formState.errors.valorPagoEpocaDigital.message}</p>}
                </div>
              </div>
            </div>
          )}

          {watchedTipo === 'fisico' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
               <h4 className="text-md font-semibold text-primary">Detalhes do Ativo Físico {(!existingAssetToUpdate || (existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length === 0)) ? '(para primeira aquisição)' : ''}</h4>
              <div className="space-y-1.5">
                <Label htmlFor="tipoImovelBemFisico">Tipo de Imóvel/Bem</Label>
                <Input
                    id="tipoImovelBemFisico"
                    {...form.register('tipoImovelBemFisico')}
                    placeholder="Ex: Casa, Apartamento, Carro, Jóia"
                    disabled={isSubmittingForm || (!!existingAssetToUpdate && (existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length > 0))}
                />
                {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enderecoLocalizacaoFisico">Endereço/Localização (Opcional para imóveis)</Label>
                <Input
                    id="enderecoLocalizacaoFisico"
                    {...form.register('enderecoLocalizacaoFisico')}
                    placeholder="Ex: Rua Exemplo, 123, Cidade - UF"
                    disabled={isSubmittingForm || (!!existingAssetToUpdate && (existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length > 0))}
                />
                {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="documentacaoFisicoFile">Documentação (Opcional)</Label>
                <Input
                    id="documentacaoFisicoFile"
                    type="file" {...form.register('documentacaoFisicoFile')}
                    disabled={isSubmittingForm || (!!existingAssetToUpdate && (existingAssetToUpdate.transactions && existingAssetToUpdate.transactions.length > 0))}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-xs text-muted-foreground">Max 5MB. Tipos: JPG, PNG, PDF.</p>
                {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
              </div>
            </div>
          )}
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
                        onValueChange={(value) => field.onChange(value === "UNASSIGNED" ? undefined : value)}
                        value={field.value === null || field.value === undefined ? "UNASSIGNED" : field.value}
                        disabled={isSubmittingForm || !!targetMemberId}
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
                                    disabled={isSubmittingForm}
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
                        disabled={isSubmittingForm}
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
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isSubmittingForm || isFetchingPrice}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingForm || isFetchingPrice}>
            Cancelar
          </Button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNextStep} disabled={isNextButtonDisabled()}>
            {isFetchingPrice ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmittingForm || isFetchingPrice}>
            {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingAssetToUpdate ? "Adicionar Transação" : "Salvar Ativo"}
          </Button>
        )}
      </div>
    </form>
  );
}

