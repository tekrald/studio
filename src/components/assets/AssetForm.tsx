
"use client";
import { useState, useEffect, useMemo } from 'react';
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
import { CalendarIcon, Loader2, Save, ArrowLeft, ArrowRight, UserCheck, Clock, RefreshCw, Building, WalletCards, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Changed to enUS
import type { AssetFormData } from '@/types/asset';
import type { AuthContextType, User } from '@/components/auth-provider';
import Image from 'next/image';
import { CardDescription } from '../ui/card';

const BitcoinIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2"><circle cx="12" cy="12" r="10" fill="#F7931A"/><path d="M10.05 16.64H12.32C14.66 16.64 16.31 15.32 16.31 12.91C16.31 10.5 14.66 9.17999 12.32 9.17999H10.05V7.35999H12.4C15.43 7.35999 17.5 8.95999 17.5 11.82C17.5 13.48 16.73 14.91 15.38 15.79V15.83C17.06 16.57 18 17.97 18 19.76C18 22.79 15.67 24.48 12.54 24.48H8V7.35999H10.05V16.64ZM10.05 11.6H12.22C13.6 11.6 14.51 12.31 14.51 13.59C14.51 14.87 13.6 15.58 12.22 15.58H10.05V11.6ZM10.05 17.68H12.4C13.98 17.68 15.03 18.46 15.03 19.79C15.03 21.12 13.98 21.9 12.4 21.9H10.05V17.68Z" fill="white" transform="scale(0.75) translate(2, -4)"/></svg>;
const EthereumIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2"><path d="M12.023 2.68701L11.531 3.32701V11.56L12.023 11.829L12.516 11.56V3.32701L12.023 2.68701Z" fill="#627EEA"/><path d="M12.023 2.68701L6.78101 9.40401L12.023 11.829V2.68701Z" fill="#8AA1F2"/><path d="M12.023 2.68701L17.265 9.40401L12.023 11.829V2.68701Z" fill="#627EEA"/><path d="M12.023 12.76L11.555 12.981V16.844L12.023 17.13L12.492 16.844V12.981L12.023 12.76Z" fill="#627EEA"/><path d="M12.023 17.13V12.76L6.78101 10.352L12.023 17.13Z" fill="#8AA1F2"/><path d="M12.023 17.13V12.76L17.265 10.352L12.023 17.13Z" fill="#627EEA"/><path d="M12.023 11.829L17.265 9.40401L12.023 6.99701L6.78101 9.40401L12.023 11.829Z" fill="#45578E"/></svg>;
const SolanaIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2"><defs><linearGradient id="solanaFormGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:"#9945FF"}}/><stop offset="100%" style={{stopColor:"#14F195"}}/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#solanaFormGradient)"/><path d="M8.06006 6.5L6.5 8.06006L10.44 12L6.5 15.94L8.06006 17.5L12 13.56L15.94 17.5L17.5 15.94L13.56 12L17.5 8.06006L15.94 6.5L12 10.44L8.06006 6.5Z" fill="black" transform="scale(0.8) translate(3,3)"/></svg>;

const createAssetFormSchema = (memberHasBirthDateContext?: boolean) => {
  return z.object({
    nomeAtivo: z.string().min(1, 'Asset name is required.'),
    dataAquisicao: z.date({ required_error: "Acquisition date is required." }),
    observacoes: z.string().optional(),
    quemComprou: z.string().optional(),
    contribuicaoParceiro1: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    contribuicaoParceiro2: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseFloat(String(val).replace(',', '.')),
      z.number().min(0, 'Contribution must be a positive value.').optional()
    ),
    tipoImovelBemFisico: z.string().min(1, "Type of physical good is required."),
    enderecoLocalizacaoFisico: z.string().optional(),
    documentacaoFisicoFile: z.any().optional(),

    assignedToMemberId: z.string().optional().nullable(),
    setReleaseCondition: z.boolean().optional(),
    releaseTargetAge: z.preprocess(
      (val) => String(val) === '' || val === undefined ? undefined : parseInt(String(val), 10),
      z.number().min(1, "Age must be positive.").max(120, "Unrealistic age.").optional()
    ),
  }).superRefine((data, ctx) => {
    if (data.setReleaseCondition && memberHasBirthDateContext && (data.releaseTargetAge === undefined || data.releaseTargetAge === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Release age is required if condition is checked and member has birth date.',
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
  user: User | null;
  existingAssetToUpdate?: ExtendedAssetNodeData | null; // Now using ExtendedAssetNodeData
}

const TOTAL_STEPS_PHYSICAL = 3;

export function AssetForm({
  onSubmit,
  isLoading: isSubmittingForm,
  onClose,
  availableMembers = [],
  targetMemberId,
  user,
  existingAssetToUpdate = null,
}: AssetFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [partnerNames, setPartnerNames] = useState<string[]>([]);
  const [partnerLabels, setPartnerLabels] = useState<string[]>(["Contributor 1", "Contributor 2"]);
  
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);
  const [fetchedCurrency, setFetchedCurrency] = useState<'BRL' | 'USD' | null>(null);


  const tempForm = useForm(); // Temporary form instance to watch 'assignedToMemberId' for schema context
  const currentAssignedToMemberIdForSchema = tempForm.watch('assignedToMemberId');

  const selectedMemberForReleaseSchema = availableMembers.find(m => m.id === currentAssignedToMemberIdForSchema);
  const memberHasBirthDateForSchema = !!selectedMemberForReleaseSchema?.birthDate;

  const currentAssetFormSchema = useMemo(() => createAssetFormSchema(memberHasBirthDateForSchema), [memberHasBirthDateForSchema]);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(currentAssetFormSchema),
    defaultValues: {
      nomeAtivo: '', // Will be set by select or input for physical
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
    },
    mode: "onChange",
  });
  
  const watchedNomeAtivo = form.watch('nomeAtivo');
  const quemComprouWatch = form.watch('quemComprou');
  const localAssignedToMemberIdWatch = form.watch('assignedToMemberId');
  const setReleaseConditionWatch = form.watch('setReleaseCondition');
  const watchedDataAquisicao = form.watch('dataAquisicao');

  const actualSelectedMember = availableMembers.find(m => m.id === localAssignedToMemberIdWatch);
  const memberHasBirthDate = !!actualSelectedMember?.birthDate;

 useEffect(() => {
    const defaultVals: Partial<AssetFormData> = {
      nomeAtivo: existingAssetToUpdate?.nomeAtivo || '',
      dataAquisicao: new Date(),
      observacoes: '',
      quemComprou: '',
      contribuicaoParceiro1: undefined,
      contribuicaoParceiro2: undefined,
      tipoImovelBemFisico: existingAssetToUpdate?.tipoImovelBemFisico || '',
      enderecoLocalizacaoFisico: existingAssetToUpdate?.enderecoLocalizacaoFisico || '',
      assignedToMemberId: targetMemberId || existingAssetToUpdate?.assignedToMemberId || undefined,
      setReleaseCondition: !!existingAssetToUpdate?.releaseCondition,
      releaseTargetAge: existingAssetToUpdate?.releaseCondition?.targetAge,
    };

    if (existingAssetToUpdate) {
        // If updating, set specific fields from the existing asset's first transaction (if any) or asset itself
        const firstTransaction = existingAssetToUpdate.transactions?.[0];
        defaultVals.dataAquisicao = firstTransaction?.dataAquisicao ? new Date(firstTransaction.dataAquisicao) : new Date();
        defaultVals.observacoes = firstTransaction?.observacoes || existingAssetToUpdate.observacoes || '';
        defaultVals.quemComprou = firstTransaction?.quemComprou || '';
        defaultVals.contribuicaoParceiro1 = firstTransaction?.contribuicaoParceiro1;
        defaultVals.contribuicaoParceiro2 = firstTransaction?.contribuicaoParceiro2;
    } else {
        // For new physical assets, ensure nomeAtivo is clear
        defaultVals.nomeAtivo = '';
    }
    form.reset(defaultVals);
    setCurrentStep(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMemberId, existingAssetToUpdate, form.reset]);


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
      quemComprou: values.quemComprou === "UNSPECIFIED_BUYER" ? "" : values.quemComprou,
      assignedToMemberId: values.assignedToMemberId === "UNASSIGNED" || values.assignedToMemberId === null || values.assignedToMemberId === undefined ? undefined : values.assignedToMemberId,
    };
    await onSubmit(processedValues);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setFormError(null);
    let fieldsToValidate: (keyof AssetFormData)[] = [];
    let currentValues = form.getValues();

    if (step === 1) { // Name and Acquisition Date for physical assets
        fieldsToValidate = ['nomeAtivo', 'dataAquisicao'];
        if (!existingAssetToUpdate && !currentValues.nomeAtivo) {
            setFormError("Asset name is required.");
            return false;
        }
         if (!currentValues.dataAquisicao) {
            setFormError("Acquisition date is required.");
            return false;
        }
    } else if (step === 2) { // Ownership and contributions
      fieldsToValidate = ['quemComprou'];
      // Contributions are optional
    } else if (step === 3) { // Physical asset details & designation
      fieldsToValidate.push('tipoImovelBemFisico');
      if (!targetMemberId) { // Only validate if not pre-targeted
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
            firstErrorMessage = (errors[field] as any)?.message || "Please fill out required fields correctly.";
            break;
            }
        }
        if (firstErrorMessage) {
            setFormError(firstErrorMessage);
            return false;
        }
      }
    }
    
    // Perform full schema validation for the current step's context
    const validationResult = currentAssetFormSchema.safeParse(currentValues);
    if (!validationResult.success) {
        // Check if any of the schema errors are relevant to the current step's fields
        const stepErrors = validationResult.error.issues.filter(issue => {
            if (step === 1 && (issue.path.includes('nomeAtivo') || issue.path.includes('dataAquisicao'))) return true;
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
    if (isSubmittingForm || isFetchingPrice) return true;
    // For step 1 (Asset Name and Date for Physical)
    if (currentStep === 1) {
        return !watchedNomeAtivo || !watchedDataAquisicao;
    }
    // For step 2 (Ownership), quemComprou can be "UNSPECIFIED_BUYER" (empty string form value), so no specific field is strictly required to enable next
    // For step 3 (Physical details), tipoImovelBemFisico is required
    if (currentStep === TOTAL_STEPS_PHYSICAL -1 && !form.getValues('tipoImovelBemFisico')) {
        return true;
    }
    return false;
  };
  

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <p className="text-sm text-center text-muted-foreground">
        {existingAssetToUpdate ? `Add Transaction to: ${existingAssetToUpdate.nomeAtivo}` : "Add New Physical Asset"} (Step {currentStep} of {TOTAL_STEPS_PHYSICAL})
      </p>

      {/* Step 1: Asset Name and Acquisition Date (Physical Assets Only) */}
      {currentStep === 1 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="nomeAtivoFisicoInput" className="text-foreground/90">Physical Asset Name</Label>
            <Input
                id="nomeAtivoFisicoInput"
                {...form.register('nomeAtivo')}
                placeholder={"Ex: Beach House, SUV Car, Artwork"}
                disabled={isSubmittingForm || !!existingAssetToUpdate}
                autoFocus={!existingAssetToUpdate}
                className={cn("bg-input text-foreground placeholder:text-muted-foreground", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
            />
            {form.formState.errors.nomeAtivo && <p className="text-sm text-destructive">{form.formState.errors.nomeAtivo.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataAquisicao" className="text-foreground/90">Acquisition/Transaction Date</Label>
            <Controller
              name="dataAquisicao"
              control={form.control}
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
                        if (isValid(currentVal) && isValid(newDate)) {
                            newDate.setHours(currentVal.getHours());
                            newDate.setMinutes(currentVal.getMinutes());
                            field.onChange(newDate);
                        } else if (isValid(newDate)) {
                            field.onChange(newDate);
                        }
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
                            const currentTime = field.value && isValid(new Date(field.value)) ? new Date(field.value) : new Date();
                            const [hours, minutes] = e.target.value.split(':');
                            if (isValid(currentTime)) {
                                currentTime.setHours(parseInt(hours,10));
                                currentTime.setMinutes(parseInt(minutes,10));
                                field.onChange(new Date(currentTime));
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
            <Input id="observacoes" {...form.register('observacoes')} placeholder="Any notes about this transaction" disabled={isSubmittingForm} className="bg-input text-foreground placeholder:text-muted-foreground"/>
            {form.formState.errors.observacoes && <p className="text-sm text-destructive">{form.formState.errors.observacoes.message}</p>}
          </div>
        </>
      )}

      {/* Step 2: Ownership and Contributions */}
      {currentStep === 2 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="quemComprou" className="text-foreground/90">Who Acquired/Contributed in this Transaction? (Optional)</Label>
            <Controller
              name="quemComprou"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === "UNSPECIFIED_BUYER" ? "" : value)}
                  value={field.value === "" || field.value === undefined ? "UNSPECIFIED_BUYER" : field.value}
                  disabled={isSubmittingForm}
                >
                  <SelectTrigger id="quemComprou" className="bg-input text-foreground">
                    <SelectValue placeholder="Select who acquired" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="UNSPECIFIED_BUYER">Unspecified</SelectItem>
                    <SelectItem value="Main Entity">Main Union (Ipê Acta)</SelectItem>
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
              If partner names do not appear, check the union display name in Profile.
            </p>
            {form.formState.errors.quemComprou && <p className="text-sm text-destructive">{form.formState.errors.quemComprou.message}</p>}
          </div>

          {quemComprouWatch === 'Ambos' && (
            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/50">
              <h4 className="text-md font-semibold text-primary">Contribution Details (Optional)</h4>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro1" className="text-foreground/90">Amount Contributed by {partnerLabels[0]} ($)</Label>
                <Input
                  id="contribuicaoParceiro1"
                  type="number"
                  {...form.register('contribuicaoParceiro1')}
                  placeholder="0.00"
                  disabled={isSubmittingForm}
                  step="0.01"
                  className="bg-input text-foreground placeholder:text-muted-foreground"
                />
                {form.formState.errors.contribuicaoParceiro1 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro1.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribuicaoParceiro2" className="text-foreground/90">Amount Contributed by {partnerLabels[1]} ($)</Label>
                <Input
                  id="contribuicaoParceiro2"
                  type="number"
                  {...form.register('contribuicaoParceiro2')}
                  placeholder="0.00"
                  disabled={isSubmittingForm}
                  step="0.01"
                  className="bg-input text-foreground placeholder:text-muted-foreground"
                />
                {form.formState.errors.contribuicaoParceiro2 && <p className="text-sm text-destructive">{form.formState.errors.contribuicaoParceiro2.message}</p>}
              </div>
            </div>
          )}
        </>
      )}

      {/* Step 3: Physical Asset Specifics & Designation */}
      {currentStep === 3 && (
        <>
          <div className="space-y-4 p-4 border rounded-md bg-muted/30 mb-4">
            <h4 className="text-md font-semibold text-primary">Physical Asset Details</h4>
            <div className="space-y-1.5">
              <Label htmlFor="tipoImovelBemFisico" className="text-foreground/90">Type of Physical Good</Label>
              <Input
                  id="tipoImovelBemFisico"
                  {...form.register('tipoImovelBemFisico')}
                  placeholder="Ex: Residential Property, Vehicle, Artwork"
                  disabled={isSubmittingForm || !!existingAssetToUpdate}
                  className={cn("bg-input text-foreground placeholder:text-muted-foreground", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
              />
              {form.formState.errors.tipoImovelBemFisico && <p className="text-sm text-destructive">{form.formState.errors.tipoImovelBemFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enderecoLocalizacaoFisico" className="text-foreground/90">Address/Location (Optional)</Label>
              <Input
                  id="enderecoLocalizacaoFisico"
                  {...form.register('enderecoLocalizacaoFisico')}
                  placeholder="Ex: 123 Example St, City - State"
                  disabled={isSubmittingForm || !!existingAssetToUpdate}
                  className={cn("bg-input text-foreground placeholder:text-muted-foreground", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
              />
              {form.formState.errors.enderecoLocalizacaoFisico && <p className="text-sm text-destructive">{form.formState.errors.enderecoLocalizacaoFisico.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documentacaoFisicoFile" className="text-foreground/90">Documentation (Optional)</Label>
              <Input
                  id="documentacaoFisicoFile"
                  type="file" {...form.register('documentacaoFisicoFile')}
                  disabled={isSubmittingForm || !!existingAssetToUpdate}
                  className={cn("file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-foreground hover:file:bg-primary/30 text-foreground/90", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
              />
              <p className="text-xs text-muted-foreground">Max 5MB. Types: JPG, PNG, PDF.</p>
              {form.formState.errors.documentacaoFisicoFile && <p className="text-sm text-destructive">{String(form.formState.errors.documentacaoFisicoFile.message)}</p>}
            </div>
          </div>

          {(!targetMemberId || (existingAssetToUpdate && !existingAssetToUpdate.assignedToMemberId)) && ( // Show if not pre-targeted OR if updating a union-assigned asset
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
                        disabled={isSubmittingForm || !!targetMemberId || (!!existingAssetToUpdate && !!existingAssetToUpdate.assignedToMemberId) }
                    >
                        <SelectTrigger id="assignedToMemberId" className={cn("bg-input text-foreground", (!!targetMemberId || (!!existingAssetToUpdate && !!existingAssetToUpdate.assignedToMemberId)) && "cursor-not-allowed bg-muted/50 text-muted-foreground")}>
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

                {localAssignedToMemberIdWatch && localAssignedToMemberIdWatch !== "UNASSIGNED" && memberHasBirthDate && (
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
                                    disabled={isSubmittingForm || !!existingAssetToUpdate}
                                    className={cn("border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
                                />
                            )}
                        />
                        <Label htmlFor="setReleaseCondition" className={cn("font-normal flex items-center text-foreground/90", !!existingAssetToUpdate && "text-muted-foreground")}>
                        <Clock size={16} className="mr-2 text-blue-400"/> Set Age-Based Release Condition for {actualSelectedMember?.name}?
                        </Label>
                    </div>
                    {setReleaseConditionWatch && (
                    <div className="space-y-1.5 pl-6">
                        <Label htmlFor="releaseTargetAge" className={cn("text-foreground/90", !!existingAssetToUpdate && "text-muted-foreground")}>Release at (age)</Label>
                        <Input
                        id="releaseTargetAge"
                        type="number"
                        {...form.register('releaseTargetAge')}
                        placeholder="Ex: 18"
                        min="1"
                        disabled={isSubmittingForm || !!existingAssetToUpdate}
                        className={cn("bg-input text-foreground placeholder:text-muted-foreground", !!existingAssetToUpdate && "cursor-not-allowed bg-muted/50 text-muted-foreground")}
                        />
                        {form.formState.errors.releaseTargetAge && <p className="text-sm text-destructive">{form.formState.errors.releaseTargetAge.message}</p>}
                    </div>
                    )}
                </div>
                )}
                {localAssignedToMemberIdWatch && localAssignedToMemberIdWatch !== "UNASSIGNED" && !memberHasBirthDate && (
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                        To set an age-based release condition, the selected member ({actualSelectedMember?.name || 'Member'}) must have a birth date registered.
                    </p>
                )}
            </div>
          )}
        </>
      )}

      {formError && <p className="text-sm text-destructive text-center">{formError}</p>}


      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isSubmittingForm || isFetchingPrice} className="text-foreground/90 border-border hover:bg-muted/80">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingForm || isFetchingPrice} className="text-foreground/90 border-border hover:bg-muted/80">
            Cancel
          </Button>
        )}

        {currentStep < TOTAL_STEPS_PHYSICAL ? (
          <Button type="button" onClick={handleNextStep} disabled={isNextButtonDisabled()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             {(isSubmittingForm || isFetchingPrice) && currentStep === 1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             {(isSubmittingForm || isFetchingPrice) && currentStep === 1 ? "Fetching..." : "Next"}
             {!((isSubmittingForm || isFetchingPrice) && currentStep === 1) && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmittingForm || isFetchingPrice} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {existingAssetToUpdate ? "Add Transaction" : "Save Physical Asset"}
          </Button>
        )}
      </div>
    </form>
  );
}
