
"use client";
import { useState, type FormEvent, useEffect, useMemo } from 'react';
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
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock, Coins, RefreshCw, Building, WalletCards } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset';
import type { AuthContextType } from '@/components/auth-provider';
import Image from 'next/image';

const createAssetFormSchema = (memberHasBirthDateContext?: boolean) => {
  return z.object({
    nomeAtivo: z.string().min(1, 'O nome do ativo é obrigatório.'),
    dataAquisicao: z.date({ required_error: "A data de aquisição é obrigatória." }),
    observacoes: z.string().optional(),
    quemComprou: z.string().min(1, "É necessário indicar quem adquiriu o ativo.").optional(),
    contribuicaoParceiro1: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
    ),
    contribuicaoParceiro2: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'A contribuição deve ser um valor positivo.').optional()
    ),
    tipoImovelBemFisico: z.string().min(1, "O tipo do bem físico é obrigatório."),
    enderecoLocalizacaoFisico: z.string().optional(),
    documentacaoFisicoFile: z.any().optional(),
    assignedToMemberId: z.string().optional().nullable(),
    setReleaseCondition: z.boolean().optional(),
    releaseTargetAge: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseInt(String(val), 10),
      z.number().min(1, "A idade deve ser positiva.").max(120, "Idade irreal.").optional()
    ),
  }).superRefine((data, ctx) => {
    if (data.setReleaseCondition && memberHasBirthDateContext && (data.releaseTargetAge === undefined || data.releaseTargetAge === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A idade de liberação é obrigatória se a condição estiver marcada e o membro tiver data de nascimento.',
        path: ['releaseTargetAge']
      });
    }
    if (data.quemComprou === 'Ambos' && (data.contribuicaoParceiro1 === undefined || data.contribuicaoParceiro2 === undefined)) {
      // Tornando contribuições opcionais mesmo se "Ambos" for selecionado
      // ctx.addIssue({
      //   code: z.ZodIssueCode.custom,
      //   message: 'As contribuições de ambas as partes são obrigatórias se "Ambos" for selecionado.',
      //   path: ['contribuicaoParceiro1'] // Ou um caminho mais genérico
      // });
    }
  });
};

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  availableMembers: { id: string; name: string; birthDate?: Date | string }[];
  targetMemberId?: string | null;
  user: AuthContextType['user']; 
  existingAssetToUpdate?: { name: string; type: 'digital' | 'fisico' } | null; // Para modo de adição de transação
}

const TOTAL_STEPS_PHYSICAL = 3; 

export function AssetForm({
  onSubmit,
  isLoading: isSubmittingForm,
  onClose,
  availableMembers = [],
  targetMemberId,
  user,
  existingAssetToUpdate
}: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [partnerNames, setPartnerNames] = useState<string[]>([]);
  const [partnerLabels, setPartnerLabels] = useState<string[]>(["Contribuinte 1", "Contribuinte 2"]);
  const [priceError, setPriceError] = useState<string | null>(null);

  const localCurrentAssignedToMemberId = useForm().watch('assignedToMemberId');
  const selectedMemberForRelease = availableMembers.find(m => m.id === localCurrentAssignedToMemberId);
  const memberHasBirthDateForSchema = !!selectedMemberForRelease?.birthDate;

  const currentAssetFormSchema = useMemo(() => createAssetFormSchema(memberHasBirthDateForSchema), [memberHasBirthDateForSchema]);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(currentAssetFormSchema),
    defaultValues: {
      nomeAtivo: existingAssetToUpdate?.name || '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: '',
      enderecoLocalizacaoFisico: '',
      assignedToMemberId: targetMemberId || undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    },
    mode: "onChange",
  });

  const quemComprouWatch = form.watch('quemComprou');
  const watchedNomeAtivo = form.watch('nomeAtivo');
  const localAssignedToMemberIdWatch = form.watch('assignedToMemberId');
  const setReleaseConditionWatch = form.watch('setReleaseCondition');
  
  const actualSelectedMember = availableMembers.find(m => m.id === localAssignedToMemberIdWatch);
  const memberHasBirthDate = !!actualSelectedMember?.birthDate;

  useEffect(() => {
    const initialValues: AssetFormData = {
      nomeAtivo: existingAssetToUpdate?.name || '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: '',
      enderecoLocalizacaoFisico: '',
      assignedToMemberId: targetMemberId || undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    };
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
      } else {
        setPartnerLabels(["Parte 1", "Parte 2"]);
      }
    }
  }, [user]);

  const handleFormSubmit = async (values: AssetFormData) => {
    const processedValues: AssetFormData = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? "" : values.quemComprou,
      assignedToMemberId: values.assignedToMemberId === "UNASSIGNED" || values.assignedToMemberId === null || values.assignedToMemberId === undefined ? undefined : values.assignedToMemberId,
    };
    await onSubmit(processedValues);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToValidate: (keyof AssetFormData)[] = [];
    let currentValues = form.getValues();
    
    if (step === 1) { 
      fieldsToValidate = ['nomeAtivo', 'dataAquisicao', 'observacoes'];
    } else if (step === 2) { 
      fieldsToValidate = ['quemComprou'];
      if (currentValues.quemComprou === 'Ambos') {
        // Contribuições são opcionais, não validar aqui para avançar
      }
    } else if (step === 3) { 
      fieldsToValidate.push('tipoImovelBemFisico'); 
      if (!targetMemberId) { 
        fieldsToValidate.push('assignedToMemberId');
      }
      if (currentValues.setReleaseCondition && memberHasBirthDate) { 
          fieldsToValidate.push('releaseTargetAge');
      }
    }

    if (fieldsToValidate.length > 0) {
      const result = await form.trigger(fieldsToValidate);
      if (!result) {
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
    }
    
    const validationResult = currentAssetFormSchema.safeParse(currentValues);
    if (!validationResult.success) {
        const stepErrors = validationResult.error.issues.filter(issue => {
            if (step === 1 && (issue.path.includes('nomeAtivo') || issue.path.includes('dataAquisicao') || issue.path.includes('observacoes'))) return true;
            if (step === 2 && (issue.path.includes('quemComprou') || (currentValues.quemComprou === 'Ambos' && (issue.path.includes('contribuicaoParceiro1') || issue.path.includes('contribuicaoParceiro2'))))) return true;
            if (step === 3 && (issue.path.includes('tipoImovelBemFisico') || (!targetMemberId && issue.path.includes('assignedToMemberId')) || (currentValues.setReleaseCondition && memberHasBirthDate && issue.path.includes('releaseTargetAge')) )) return true;
            return false;
        });

        if (stepErrors.length > 0) {
            setFormError(stepErrors[0].message);
            return false;
        }
    }
    return true;
  };

  const handleNextStep = async () => {
    if (await validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS_PHYSICAL) {
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
    if (isSubmittingForm) return true;
    if (currentStep === 1) {
        return !watchedNomeAtivo; 
    }
    return false;
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <p className="text-sm text-center text-muted-foreground">
        {existingAssetToUpdate ? `Adicionar Transação a ${existingAssetToUpdate.name}` : `Adicionar Novo Ativo Físico`} (Etapa {currentStep} de {TOTAL_STEPS_PHYSICAL})
      </p>

      {currentStep === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nomeAtivoFisicoInput">Nome do Ativo Físico</Label>
            <Input
                id="nomeAtivoFisicoInput"
                {...form.register('nomeAtivo')}
                placeholder={"Ex: Casa da Praia, Carro SUV, Obra de Arte"}
                disabled={isSubmittingForm || !!existingAssetToUpdate}
                autoFocus
            />
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
            <Label htmlFor="observacoes">Observações (Opcional)</Label>
            <Input id="observacoes" {...form.register('observacoes')} placeholder="Alguma observação sobre esta ação" disabled={isSubmittingForm} />
            {form.formState.errors.observacoes && <p className="text-sm text-destructive">{form.formState.errors.observacoes.message}</p>}
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="quemComprou">Quem Adquiriu/Contribuiu? (Opcional)</Label>
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
                    <SelectItem value="Entidade Principal">Registro Principal (Acta Ipê)</SelectItem>
                    {partnerNames.length === 1 && (
                      <SelectItem value={partnerNames[0]}>{partnerNames[0]}</SelectItem>
                    )}
                    {partnerNames.length > 1 && partnerNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                    {partnerNames.length > 1 && <SelectItem value="Ambos">Ambos ({partnerNames.join(' & ')})</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Se os nomes dos parceiros não aparecerem, verifique o nome de exibição do registro no Perfil.
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

      {currentStep === 3 && ( 
        <>
          <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
            <h4 className="text-md font-semibold text-primary">Detalhes do Ativo Físico</h4>
            <div className="space-y-1.5">
              <Label htmlFor="tipoImovelBemFisico">Tipo de Bem Físico</Label>
              <Input
                  id="tipoImovelBemFisico"
                  {...form.register('tipoImovelBemFisico')}
                  placeholder="Ex: Imóvel Residencial, Veículo, Obra de Arte"
                  disabled={isSubmittingForm}
              />
              {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enderecoLocalizacaoFisico">Endereço/Localização (Opcional)</Label>
              <Input
                  id="enderecoLocalizacaoFisico"
                  {...form.register('enderecoLocalizacaoFisico')}
                  placeholder="Ex: Rua Exemplo, 123, Cidade - UF"
                  disabled={isSubmittingForm}
              />
              {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documentacaoFisicoFile">Documentação (Opcional)</Label>
              <Input
                  id="documentacaoFisicoFile"
                  type="file" {...form.register('documentacaoFisicoFile')}
                  disabled={isSubmittingForm}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground">Max 5MB. Tipos: JPG, PNG, PDF.</p>
              {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
            </div>
          </div>
          
          {(!targetMemberId) && ( 
            <div className="space-y-4 p-4 border rounded-md bg-card">
                <h4 className="text-md font-semibold text-primary flex items-center"><UserCheck size={18} className="mr-2"/> Designação e Liberação do Ativo (Opcional)</h4>
                <div className="space-y-1.5">
                <Label htmlFor="assignedToMemberId">Designar Ativo para Membro</Label>
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
                        <SelectItem value="UNASSIGNED">Não Designar / Manter com o Registro Principal</SelectItem>
                        {availableMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                {form.formState.errors.assignedToMemberId && <p className="text-sm text-destructive">{form.formState.errors.assignedToMemberId.message}</p>}
                </div>

                {localAssignedToMemberIdWatch && localAssignedToMemberIdWatch !== "UNASSIGNED" && memberHasBirthDate && (
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
                        <Clock size={16} className="mr-2 text-blue-500"/> Definir Condição de Liberação por Idade para {actualSelectedMember?.name}?
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
                {localAssignedToMemberIdWatch && localAssignedToMemberIdWatch !== "UNASSIGNED" && !memberHasBirthDate && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                        Para definir condição de liberação por idade, o membro selecionado ({actualSelectedMember?.name || 'Membro'}) precisa ter uma data de nascimento cadastrada.
                    </p>
                )}
            </div>
          )}
        </>
      )}

      {formError && <p className="text-sm text-destructive text-center">{formError}</p>}
      {priceError && <p className="text-sm text-destructive text-center">{priceError}</p>}


      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isSubmittingForm}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingForm}>
            Cancelar
          </Button>
        )}

        {currentStep < TOTAL_STEPS_PHYSICAL ? (
          <Button type="button" onClick={handleNextStep} disabled={isNextButtonDisabled()}>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmittingForm}>
            {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingAssetToUpdate ? "Adicionar Transação" : "Salvar Ativo Físico"}
          </Button>
        )}
      </div>
    </form>
  );
}
