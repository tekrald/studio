
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { AssetFormData, ExtendedAssetNodeData } from '@/types/asset';
import type { User } from '@/components/auth-provider';
import Image from 'next/image';
import { CardDescription } from '../ui/card';

// Schema exclusively for Physical Assets
const createAssetFormSchema = (memberHasBirthDateContext?: boolean) => {
  return z.object({
    nomeAtivo: z.string().min(1, 'Asset name is required.'),
    dataAquisicao: z.date({ required_error: "Acquisition date is required." }),
    observacoes: z.string().optional(), // Optional general notes for the asset
    
    // Transaction/acquisition specific fields for the physical asset
    quemComprou: z.string().optional(), // Who made THIS specific transaction
    contribuicaoParceiro1: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    contribuicaoParceiro2: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    
    // Physical asset specific details
    tipoImovelBemFisico: z.string().min(1, "Type of physical good is required."),
    enderecoLocalizacaoFisico: z.string().optional(),
    documentacaoFisicoFile: z.any().optional(), // Placeholder for file upload

    // For overall asset assignment and release
    assignedToMemberId: z.string().optional().nullable(),
    setReleaseCondition: z.boolean().optional(),
    releaseTargetAge: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseInt(String(val), 10),
      z.number().min(1, "Age must be positive.").max(120, "Unrealistic age.").optional()
    ),
  }).superRefine((data, ctx) => {
    if (data.setReleaseCondition && memberHasBirthDateContext && (data.releaseTargetAge === undefined || data.releaseTargetAge === null || isNaN(data.releaseTargetAge))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Release age is required and must be a valid number if condition is checked and member has birth date.',
        path: ['releaseTargetAge']
      });
    }
  });
};

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  availableMembers: { id: string; name: string; birthDate?: Date | string }[];
  targetMemberId?: string | null; // For pre-selecting member when adding asset from member node
  user: User | null;
}

const TOTAL_STEPS_PHYSICAL = 3; // 1. Basic Info, 2. Ownership, 3. Physical Details & Assignment

export function AssetForm({
  onSubmit,
  isLoading: isSubmittingForm,
  onClose,
  availableMembers = [],
  targetMemberId,
  user,
}: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [partnerNames, setPartnerNames] = useState<string[]>([]);
  const [partnerLabels, setPartnerLabels] = useState<string[]>(["Partner 1", "Partner 2"]);

  const form = useForm<AssetFormData>({
    // Resolver will be set dynamically based on context
    mode: "onChange", 
  });

  const watchedNomeAtivo = form.watch('nomeAtivo');
  const watchedDataAquisicao = form.watch('dataAquisicao');
  const formWatchedQuemComprou = form.watch('quemComprou');
  const formLocalAssignedToMemberIdWatch = form.watch('assignedToMemberId');
  const formSetReleaseConditionWatch = form.watch('setReleaseCondition');

  const actualSelectedMemberForAssignment = availableMembers.find(m => m.id === formLocalAssignedToMemberIdWatch);
  const memberHasBirthDateForSchema = !!actualSelectedMemberForAssignment?.birthDate;

  const currentAssetFormSchema = useMemo(() => createAssetFormSchema(memberHasBirthDateForSchema), [memberHasBirthDateForSchema]);

  // Update resolver when schema changes
  useEffect(() => {
    form.reset(undefined, { keepValues: true }); // Keep existing values, but re-evaluate with new schema context
    // This is a bit of a trick; ideally, RHF would re-evaluate resolver, but explicitly resetting can help.
    // A more robust way might involve re-initializing useForm, but that's more complex.
    // For now, this ensures the latest schema is somewhat acknowledged.
    // The main place the schema is used is in `form.handleSubmit` and `form.trigger`.
  }, [currentAssetFormSchema, form]);
  
  // Initialize default values and set resolver initially
  useEffect(() => {
    form.reset({
      nomeAtivo: '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: '',
      enderecoLocalizacaoFisico: '',
      documentacaoFisicoFile: undefined,
      assignedToMemberId: targetMemberId || undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    });
    // @ts-ignore
    form.setValue('resolver', zodResolver(currentAssetFormSchema)); // Set resolver after reset
    setCurrentStep(1);
    setFormError(null);
  }, [targetMemberId, currentAssetFormSchema, form]);


  useEffect(() => {
    if (user?.displayName) {
      const names = user.displayName.split('&').map(name => name.trim()).filter(name => name);
      setPartnerNames(names);
      if (names.length === 1) {
        setPartnerLabels([names[0], "Other Contributor"]);
      } else if (names.length > 1) {
        setPartnerLabels([names[0], names[1]]);
      } else {
        setPartnerLabels(["Partner 1", "Partner 2"]);
      }
    }
  }, [user]);
  
  const handleFormSubmit = async (values: AssetFormData) => {
    const processedValues: AssetFormData = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? undefined : values.quemComprou,
      assignedToMemberId: values.assignedToMemberId === "UNASSIGNED" || values.assignedToMemberId === null ? undefined : values.assignedToMemberId,
    };
    await onSubmit(processedValues);
  };

  const getFieldsForStep = (s: number): (keyof AssetFormData)[] => {
    if (s === 1) return ['nomeAtivo', 'dataAquisicao', 'observacoes'];
    if (s === 2) return ['quemComprou', 'contribuicaoParceiro1', 'contribuicaoParceiro2'];
    if (s === 3) return [
        'tipoImovelBemFisico', 'enderecoLocalizacaoFisico', 'documentacaoFisicoFile',
        'assignedToMemberId', 'setReleaseCondition', 'releaseTargetAge'
    ];
    return [];
  };
  
  const isFieldRelevantUpToStep = (fieldName: keyof AssetFormData, currentValidationStep: number): boolean => {
      for (let i = 1; i <= currentValidationStep; i++) {
          if (getFieldsForStep(i).includes(fieldName)) {
              return true;
          }
      }
      return false;
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    form.clearErrors(); 
    let fieldsToValidate: FieldPath<AssetFormData>[] = [];

    if (step === 1) {
      fieldsToValidate = ['nomeAtivo', 'dataAquisicao']; 
    } else if (step === 2) {
      // Optional fields, no specific trigger needed for "Next" unless business logic changes
      // `quemComprou` and contributions are optional.
    } else if (step === 3) {
      // For the final step, handleSubmit will do the full validation.
      // However, if there are specific fields for this step that must be valid to "enable" submit, list them.
      // For now, let's assume tipoImovelBemFisico is crucial for this step if user reaches it.
      fieldsToValidate.push('tipoImovelBemFisico');
    }

    if (fieldsToValidate.length > 0) {
      const result = await form.trigger(fieldsToValidate);
      if (!result) {
        let firstErrorMessage: string | null = null;
        for (const field of fieldsToValidate) {
            if (form.formState.errors[field]) {
            // @ts-ignore
            firstErrorMessage = (form.formState.errors[field] as any)?.message || "Please fill out required fields correctly.";
            break;
            }
        }
        if (firstErrorMessage) {
            setFormError(firstErrorMessage);
        } else if (Object.keys(form.formState.errors).length > 0) {
            const firstErrorKey = Object.keys(form.formState.errors)[0] as FieldPath<AssetFormData>;
            // @ts-ignore
            firstErrorMessage = form.formState.errors[firstErrorKey]?.message || "Please correct the highlighted fields.";
            setFormError(firstErrorMessage);
        } else {
             // This case might happen if trigger fails but no specific error message is found for the triggered fields
            setFormError(`Please ensure all fields for Step ${step} are valid.`);
        }
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
      const nomeAtivoValue = form.getValues('nomeAtivo'); // Get current value for check
      const dataAquisicaoValue = form.getValues('dataAquisicao');
      const isNomeFilled = nomeAtivoValue && nomeAtivoValue.trim().length > 0;
      const isDataValid = !!dataAquisicaoValue && isValid(new Date(dataAquisicaoValue));
      return !(isNomeFilled && isDataValid);
    }
    if (currentStep === 2) { 
      return false; 
    }
    // For Step 3 (last step for physical assets), the button changes to "Save Physical Asset", 
    // RHF's formState.isValid (via handleSubmit) will handle it.
    return false; 
  };
  

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <p className="text-sm text-center text-muted-foreground">
        Add New Physical Asset (Step {currentStep} of {TOTAL_STEPS_PHYSICAL})
      </p>

      {currentStep === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nomeAtivoFisicoInput" className="text-foreground/90">Physical Asset Name</Label>
            <Controller
                name="nomeAtivo"
                control={form.control}
                render={({ field }) => (
                    <Input
                        id="nomeAtivoFisicoInput"
                        {...field}
                        placeholder={"Ex: Beach House, SUV Car, Artwork"}
                        disabled={isSubmittingForm}
                        autoFocus
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                    />
                )}
            />
            {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataAquisicao" className="text-foreground/90">Acquisition/Transaction Date</Label>
            <Controller
              name="dataAquisicao"
              control={form.control}
              defaultValue={new Date()}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal bg-input text-foreground hover:bg-input/80",!field.value && "text-muted-foreground")}
                      disabled={isSubmittingForm}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "PPP 'at' HH:mm", { locale: enUS }) : <span>Choose date and time</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border">
                    <Calendar
                      mode="single"
                      selected={field.value && isValid(new Date(field.value)) ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        const currentVal = field.value && isValid(new Date(field.value)) ? new Date(field.value) : new Date();
                        const newDate = date ? new Date(date) : currentVal; // Keep current if no new date
                        
                        let currentHours = currentVal.getHours();
                        let currentMinutes = currentVal.getMinutes();

                        if(date){ // Only set H/M if a new date was actually picked from calendar part
                            newDate.setHours(currentHours);
                            newDate.setMinutes(currentMinutes);
                        }
                        field.onChange(newDate);
                      }}
                      initialFocus
                      locale={enUS}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isSubmittingForm}
                    />
                    <div className="p-2 border-t border-border">
                      <Label htmlFor="time" className="text-sm text-foreground/90">Time of Acquisition/Transaction</Label>
                       <Input
                        id="time"
                        type="time"
                        defaultValue={field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "HH:mm") : "00:00"}
                        onChange={(e) => {
                            const currentTimeVal = field.value && isValid(new Date(field.value)) ? new Date(field.value) : new Date();
                            const [hours, minutes] = e.target.value.split(':');
                            if (isValid(currentTimeVal) && hours && minutes) {
                                currentTimeVal.setHours(parseInt(hours,10));
                                currentTimeVal.setMinutes(parseInt(minutes,10));
                                field.onChange(new Date(currentTimeVal));
                            }
                        }}
                        className="w-full mt-1 bg-input text-foreground"
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
            <Label htmlFor="observacoes" className="text-foreground/90">Transaction Notes (Optional)</Label>
            <Controller
                name="observacoes"
                control={form.control}
                render={({ field }) => (
                    <Input 
                        id="observacoes" 
                        {...field} 
                        value={field.value || ''}
                        placeholder="Any notes about this transaction" 
                        disabled={isSubmittingForm} 
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                    />
                )}
            />
            {form.formState.errors.observacoes && <p className="text-sm text-destructive">{form.formState.errors.observacoes.message}</p>}
          </div>
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="quemComprou" className="text-foreground/90">Who Acquired/Contributed in this Transaction? (Optional)</Label>
            <Controller
              name="quemComprou"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === "UNSPECIFIED_BUYER" ? undefined : value)}
                  value={field.value === "" || field.value === undefined ? "UNSPECIFIED_BUYER" : field.value}
                  disabled={isSubmittingForm}
                >
                  <SelectTrigger id="quemComprou" className="bg-input text-foreground">
                    <SelectValue placeholder="Select who acquired" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="UNSPECIFIED_BUYER">Unspecified</SelectItem>
                    <SelectItem value="União Principal (Ipê Acta)">Main Union (Ipê Acta)</SelectItem>
                    {partnerNames.length === 1 && (
                      <SelectItem value={partnerNames[0]}>{partnerNames[0]}</SelectItem>
                    )}
                    {partnerNames.length > 1 && partnerNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                    {partnerNames.length > 1 && <SelectItem value="Ambos">Both ({partnerNames.join(' & ')})</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              If partner names do not appear, check the union name in Profile.
            </p>
            {form.formState.errors.quemComprou && <p className="text-sm text-destructive">{form.formState.errors.quemComprou.message}</p>}
          </div>

          {formWatchedQuemComprou === 'Ambos' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/30">
              <h4 className="text-md font-semibold text-primary">Contribution Details (Optional)</h4>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro1" className="text-foreground/90">Amount Contributed by {partnerLabels[0]} ($)</Label>
                 <Controller
                    name="contribuicaoParceiro1"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                        id="contribuicaoParceiro1"
                        type="number"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        placeholder="0.00"
                        disabled={isSubmittingForm}
                        step="0.01"
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                        />
                    )}
                />
                {form.formState.errors.contribuicaoParceiro1 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro1.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro2" className="text-foreground/90">Amount Contributed by {partnerLabels[1]} ($)</Label>
                 <Controller
                    name="contribuicaoParceiro2"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                        id="contribuicaoParceiro2"
                        type="number"
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        placeholder="0.00"
                        disabled={isSubmittingForm}
                        step="0.01"
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                        />
                    )}
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
            <h4 className="text-md font-semibold text-primary">Physical Asset Details</h4>
            <div className="space-y-1.5">
              <Label htmlFor="tipoImovelBemFisico" className="text-foreground/90">Type of Physical Good</Label>
              <Controller
                name="tipoImovelBemFisico"
                control={form.control}
                render={({ field }) => (
                    <Input
                        id="tipoImovelBemFisico"
                        {...field}
                        placeholder={"Ex: Residential Property, Vehicle, Artwork"}
                        disabled={isSubmittingForm}
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                    />
                )}
              />
              {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enderecoLocalizacaoFisico" className="text-foreground/90">Address/Location (Optional)</Label>
              <Controller
                name="enderecoLocalizacaoFisico"
                control={form.control}
                render={({ field }) => (
                    <Input
                        id="enderecoLocalizacaoFisico"
                        {...field}
                        value={field.value || ''}
                        placeholder="Ex: 123 Example St, City - State"
                        disabled={isSubmittingForm}
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                    />
                )}
              />
              {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documentacaoFisicoFile" className="text-foreground/90">Documentation (Optional)</Label>
              <Controller
                name="documentacaoFisicoFile"
                control={form.control}
                render={({ field: { onChange, onBlur, name, ref } }) => (
                    <Input
                        id="documentacaoFisicoFile"
                        type="file" 
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        onChange={(e) => onChange(e.target.files)}
                        disabled={isSubmittingForm}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-foreground hover:file:bg-primary/30 text-foreground/90"
                    />
                )}
              />
              <p className="text-xs text-muted-foreground">Max 5MB. Types: JPG, PNG, PDF.</p>
              {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
            </div>
          </div>

          {(!targetMemberId || targetMemberId === "UNASSIGNED_TARGET") && ( // Show only if not adding to a specific member from member node
            <div className="space-y-4 p-4 border rounded-md bg-card">
                <h4 className="text-md font-semibold text-primary flex items-center"><UserCheck size={18} className="mr-2"/> Asset Designation and Release (Optional)</h4>
                <div className="space-y-1.5">
                <Label htmlFor="assignedToMemberId" className="text-foreground/90">Assign Asset to Member</Label>
                <Controller
                    name="assignedToMemberId"
                    control={form.control}
                    render={({ field }) => (
                    <Select
                        onValueChange={(value) => field.onChange(value === "UNASSIGNED" ? undefined : value)}
                        value={field.value === null || field.value === undefined ? "UNASSIGNED" : field.value}
                        disabled={isSubmittingForm || !!targetMemberId }
                    >
                        <SelectTrigger id="assignedToMemberId" className={cn("bg-input text-foreground", (!!targetMemberId) && "cursor-not-allowed bg-muted/50 text-muted-foreground")}>
                        <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="UNASSIGNED">Do Not Assign / Keep with Main Union</SelectItem>
                        {availableMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                {form.formState.errors.assignedToMemberId && <p className="text-sm text-destructive">{form.formState.errors.assignedToMemberId.message}</p>}
                </div>

                {formLocalAssignedToMemberIdWatch && formLocalAssignedToMemberIdWatch !== "UNASSIGNED" && memberHasBirthDateForSchema && (
                <div className="space-y-3 mt-3 p-3 border-t border-border">
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
                                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                            )}
                        />
                        <Label htmlFor="setReleaseCondition" className="font-normal flex items-center text-foreground/90">
                        <Clock size={16} className="mr-2 text-primary"/> Set Age-Based Release Condition for {actualSelectedMemberForAssignment?.name}?
                        </Label>
                    </div>
                    {formSetReleaseConditionWatch && (
                    <div className="space-y-1.5 pl-6">
                        <Label htmlFor="releaseTargetAge" className="text-foreground/90">Release at (age)</Label>
                        <Controller
                            name="releaseTargetAge"
                            control={form.control}
                            render={({ field }) => (
                                <Input
                                id="releaseTargetAge"
                                type="number"
                                {...field}
                                value={field.value === undefined ? '' : field.value}
                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                placeholder="Ex: 18"
                                min="1"
                                disabled={isSubmittingForm}
                                className="bg-input text-foreground placeholder:text-muted-foreground"
                                />
                            )}
                        />
                        {form.formState.errors.releaseTargetAge && <p className="text-sm text-destructive">{form.formState.errors.releaseTargetAge.message}</p>}
                    </div>
                    )}
                </div>
                )}
                {formLocalAssignedToMemberIdWatch && formLocalAssignedToMemberIdWatch !== "UNASSIGNED" && !memberHasBirthDateForSchema && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                        To set an age-based release condition, the selected member ({actualSelectedMemberForAssignment?.name || 'Member'}) must have a birth date registered.
                    </p>
                )}
            </div>
          )}
        </>
      )}

      {formError && <p className="text-sm text-destructive text-center">{formError}</p>}


      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isSubmittingForm} className="text-foreground/90 border-border hover:bg-muted/80">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingForm} className="text-foreground/90 border-border hover:bg-muted/80">
            Cancel
          </Button>
        )}

        {currentStep < TOTAL_STEPS_PHYSICAL ? (
          <Button type="button" onClick={handleNextStep} disabled={isNextButtonDisabled()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {isSubmittingForm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isSubmittingForm ? "Processing..." : "Next"}
             {!isSubmittingForm && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmittingForm || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Physical Asset
          </Button>
        )}
      </div>
    </form>
  );
}

