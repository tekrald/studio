
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
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock, Building, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { AssetFormData } from '@/types/asset';
import { useAuth, getPartnerNames } from '@/components/auth-provider'; // Import useAuth and getPartnerNames

// Schema exclusively for Physical Assets
const createAssetFormSchema = (memberHasBirthDateContext?: boolean) => {
  return z.object({
    nomeAtivo: z.string().min(1, 'Asset name is required.'),
    dataAquisicao: z.date({ required_error: "Acquisition date is required." }),
    observacoes: z.string().optional(), 
    
    quemComprou: z.string().optional(), 
    contribuicaoParceiro1: z.preprocess(
      (val) => String(val) === '' || val === undefined || val === null ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    contribuicaoParceiro2: z.preprocess(
      (val) => String(val) === '' || val === undefined || val === null ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    
    tipoImovelBemFisico: z.string().min(1, "Type of physical good is required."),
    enderecoLocalizacaoFisico: z.string().optional(),
    documentacaoFisicoFile: z.any().optional(), 

    assignedToMemberId: z.string().optional().nullable(),
    setReleaseCondition: z.boolean().optional(),
    releaseTargetAge: z.preprocess(
      (val) => String(val) === '' || val === undefined || val === null ? undefined : parseInt(String(val), 10),
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
  targetMemberId?: string | null;
}

const TOTAL_STEPS_PHYSICAL = 3; // 1. Basic Info, 2. Ownership, 3. Physical Details & Assignment

export function AssetForm({
  onSubmit,
  isLoading: isSubmittingForm,
  onClose,
  availableMembers = [],
  targetMemberId,
}: AssetFormProps) {
  const { user } = useAuth(); // Get user from context
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [partnerLabels, setPartnerLabels] = useState<[string, string]>(["Partner 1", "Partner 2"]);
  
  useEffect(() => {
    if (user?.partners) {
      setPartnerLabels(getPartnerNames(user.partners));
    }
  }, [user]);

  const watchedAssignedToMemberId = useMemo(() => targetMemberId, [targetMemberId]);
  const currentAssignedMember = availableMembers.find(m => m.id === watchedAssignedToMemberId);
  const memberHasBirthDateForSchema = !!currentAssignedMember?.birthDate;
  const currentAssetFormSchema = useMemo(() => createAssetFormSchema(memberHasBirthDateForSchema), [memberHasBirthDateForSchema]);
  
  const form = useForm<AssetFormData>({
    resolver: zodResolver(currentAssetFormSchema),
    mode: "onChange", 
    defaultValues: {
      nomeAtivo: '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: undefined, 
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: '',
      enderecoLocalizacaoFisico: '',
      documentacaoFisicoFile: undefined,
      assignedToMemberId: targetMemberId || undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    },
  });
  
  useEffect(() => {
    let defaultVals: AssetFormData = {
      nomeAtivo: '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: undefined,
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: '',
      enderecoLocalizacaoFisico: '',
      documentacaoFisicoFile: undefined,
      assignedToMemberId: targetMemberId || undefined,
      setReleaseCondition: false,
      releaseTargetAge: undefined,
    };
    form.reset(defaultVals);
    setCurrentStep(1);
    setFormError(null);
  }, [targetMemberId, form]); // form.reset is stable, but form itself should be in deps

  const handleFormSubmit = async (values: AssetFormData) => {
    setFormError(null);
    const processedValues: AssetFormData = {
      ...values,
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? undefined : values.quemComprou,
      assignedToMemberId: values.assignedToMemberId === "UNASSIGNED" || values.assignedToMemberId === null || values.assignedToMemberId === '' ? undefined : values.assignedToMemberId,
      contribuicaoParceiro1: values.contribuicaoParceiro1 === null ? undefined : values.contribuicaoParceiro1,
      contribuicaoParceiro2: values.contribuicaoParceiro2 === null ? undefined : values.contribuicaoParceiro2,
      releaseTargetAge: values.releaseTargetAge === null ? undefined : values.releaseTargetAge,
    };
    try {
      await onSubmit(processedValues);
    } catch (error: any) {
      setFormError(error.message || "An unexpected error occurred.");
    }
  };
  
  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToTrigger: FieldPath<AssetFormData>[] = [];

    if (stepToValidate === 1) {
      fieldsToTrigger = ['nomeAtivo', 'dataAquisicao'];
    } else if (stepToValidate === 2) {
      // Fields are optional or have defaults.
    } else if (stepToValidate === 3) {
      fieldsToTrigger = ['tipoImovelBemFisico']; // Primary required field for this step.
      if(form.getValues('setReleaseCondition') && memberHasBirthDateForSchema){
        fieldsToTrigger.push('releaseTargetAge');
      }
    }

    if (fieldsToTrigger.length > 0) {
      const result = await form.trigger(fieldsToTrigger);
      if (!result) {
        const errors = form.formState.errors;
        for (const field of fieldsToTrigger) {
          if (errors[field]) {
            setFormError((errors[field] as any)?.message || "Please fill out required fields correctly.");
            return false;
          }
        }
        if (Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0] as FieldPath<AssetFormData>;
            setFormError((errors[firstErrorKey] as any)?.message || "Please correct the highlighted fields.");
        } else {
            setFormError("Please ensure all fields for this step are valid.");
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
  
  const watchedNomeAtivo = form.watch('nomeAtivo');
  const watchedDataAquisicao = form.watch('dataAquisicao');
  const watchedTipoImovel = form.watch('tipoImovelBemFisico');

  const isNextButtonDisabled = () => {
    if (isSubmittingForm) return true;

    if (currentStep === 1) {
      const isNomeFilled = watchedNomeAtivo && watchedNomeAtivo.trim().length > 0;
      const isDataValid = !!watchedDataAquisicao && isValid(new Date(watchedDataAquisicao));
      return !(isNomeFilled && isDataValid);
    }
    if (currentStep === 2) { 
      return false; 
    }
    if (currentStep === 3) { // This is the final step, button is "Save"
        return !form.formState.isValid; // Button is "Save", rely on overall form validity
    }
    return false; 
  };
  
  const watchedQuemComprou = form.watch('quemComprou');
  const localWatchedAssignedToMemberId = form.watch('assignedToMemberId');
  const localCurrentAssignedMember = availableMembers.find(m => m.id === localWatchedAssignedToMemberId);
  const watchedSetReleaseCondition = form.watch('setReleaseCondition');


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
                        const newDate = date ? new Date(date) : currentVal; 
                        
                        let currentHours = currentVal.getHours();
                        let currentMinutes = currentVal.getMinutes();

                        if(date){ 
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
                    <SelectItem value="Main Union (Ipê Acta)">Main Union (Ipê Acta)</SelectItem>
                    {user?.partners?.map((partner, index) => (
                       partner.name && <SelectItem key={`partner-${index}-${partner.name}`} value={partner.name}>{partner.name}</SelectItem>
                    ))}
                    {(user?.partners && user.partners.length > 1 && user.partners.every(p => p.name)) && <SelectItem value="Ambos">Both ({getPartnerNames(user.partners).join(' & ')})</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Partner names are based on signup. If not shown, check profile.
            </p>
            {form.formState.errors.quemComprou && <p className="text-sm text-destructive">{form.formState.errors.quemComprou.message}</p>}
          </div>

          {watchedQuemComprou === 'Ambos' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/30">
              <h4 className="text-md font-semibold text-primary">Contribution Details (Optional)</h4>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro1" className="text-foreground/90">Amount Contributed by {partnerLabels[0]}</Label>
                 <Controller
                    name="contribuicaoParceiro1"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                        id="contribuicaoParceiro1"
                        type="number"
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
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
                <Label htmlFor="contribuicaoParceiro2" className="text-foreground/90">Amount Contributed by {partnerLabels[1]}</Label>
                 <Controller
                    name="contribuicaoParceiro2"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                        id="contribuicaoParceiro2"
                        type="number"
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
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

          {(!targetMemberId || targetMemberId === "UNASSIGNED_TARGET") && ( 
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
                        value={field.value === null || field.value === undefined || field.value === '' ? "UNASSIGNED" : field.value}
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

                {localWatchedAssignedToMemberId && localWatchedAssignedToMemberId !== "UNASSIGNED" && localCurrentAssignedMember?.birthDate && (
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
                        <Clock size={16} className="mr-2 text-primary"/> Set Age-Based Release Condition for {localCurrentAssignedMember?.name}?
                        </Label>
                    </div>
                    {watchedSetReleaseCondition && (
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
                                value={field.value === undefined || field.value === null ? '' : String(field.value)}
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
                {localWatchedAssignedToMemberId && localWatchedAssignedToMemberId !== "UNASSIGNED" && !localCurrentAssignedMember?.birthDate && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                        To set an age-based release condition, the selected member ({localCurrentAssignedMember?.name || 'Member'}) must have a birth date registered.
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
          <Button 
            type="button" 
            onClick={() => form.handleSubmit(handleFormSubmit)()} 
            disabled={isSubmittingForm || !watchedTipoImovel.trim() || (watchedSetReleaseCondition && memberHasBirthDateForSchema && (form.getValues('releaseTargetAge') === undefined || form.getValues('releaseTargetAge')! <=0) ) } 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Physical Asset
          </Button>
        )}
      </div>
    </form>
  );
}
