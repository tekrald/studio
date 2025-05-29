
"use client";
import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Camera, Wallet, Users, BookOpen, FileText, Edit3, PlusCircle, Save, Trash2, Eye, Building, Landmark, HomeIcon } from 'lucide-react';
import type { ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 8;

const initialReligionOptions = [
    { value: "agnosticism", label: "Agnosticism" },
    { value: "atheism", label: "Atheism" },
    { value: "buddhism", label: "Buddhism" },
    { value: "christianity", label: "Christianity" },
    { value: "hinduism", label: "Hinduism" },
    { value: "islam", label: "Islam" },
    { value: "judaism", label: "Judaism" },
    { value: "other", label: "Other" },
    { value: "spiritualism", label: "Spiritualism" },
];

const otherOption = initialReligionOptions.find(opt => opt.value === 'other');
const sortedReligionOptions = initialReligionOptions
  .filter(opt => opt.value !== 'other')
  .sort((a, b) => a.label.localeCompare(b.label));
const religionOptions = otherOption ? [...sortedReligionOptions, otherOption] : sortedReligionOptions;


const defaultContractClauses: ContractClause[] = [
  { id: 'initial-clause-1', text: "All assets acquired together will be divided into X% as agreed in the event of dissolution of the union or equally what each person put in from their own pocket." },
  { id: 'initial-clause-2', text: "Financial and operational responsibilities will be divided as defined in this record." },
];

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Union Structure
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | ''>('');
  // Step 2: Union Belief
  const [religion, setReligion] = useState<string | undefined>(undefined);
  
  // Step 3: Union Name
  const [unionName, setUnionName] = useState('');

  // Step 4: Account Details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 5: Connect Joint Wallet
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  
  // Step 6: Photos
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);
  
  // Step 7: Initial Agreements
  const [contractClauses, setContractClauses] = useState<ContractClause[]>(defaultContractClauses);
  const [newClauseText, setNewClauseText] = useState('');
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);

  // Step 8: Terms and Conditions
  const [acceptedContract, setAcceptedContract] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>, photoNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      if (photoNumber === 1) {
        setPhoto1(file);
        setPhoto1Preview(URL.createObjectURL(file));
      } else {
        setPhoto2(file);
        setPhoto2Preview(URL.createObjectURL(file));
      }
      setError(null);
    }
  };

  const handleConnectWallet = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const mockAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setConnectedWalletAddress(mockAddress);
      setIsWalletConnected(true);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAddOrUpdateClause = () => {
    const textToSave = editingClause ? editingClause.text : newClauseText;
    if (!textToSave.trim()) return;

    if (editingClause) {
      setContractClauses(clauses => clauses.map(c => c.id === editingClause.id ? { ...c, text: textToSave.trim() } : c));
      setEditingClause(null);
    } else {
      setContractClauses(clauses => [...clauses, { id: `clause-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, text: textToSave.trim() }]);
    }
    setNewClauseText('');
  };

  const handleEditClause = (clause: ContractClause) => {
    setEditingClause(clause);
    setNewClauseText(''); 
  };

  const handleRemoveClause = (id: string) => {
    setContractClauses(clauses => clauses.filter(c => c.id !== id));
    if (editingClause?.id === id) {
      setEditingClause(null);
    }
  };

   const handleCancelEdit = () => {
    setEditingClause(null);
    setNewClauseText('');
  };

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) { // Union Structure
      if (!relationshipStructure) {
        setError("Please select your union structure.");
        return false;
      }
    } else if (currentStep === 2) { // Union Belief
        // No mandatory validation here, can be left as "Select an option" (or default to the first one)
    } else if (currentStep === 3) { // Union Name
      if (!unionName.trim()) {
        setError("Please enter the name of your union.");
        return false;
      }
    } else if (currentStep === 4) { // Account Details
      if (!email.trim() || !password || !confirmPassword) {
        setError("Please fill in email, password, and password confirmation.");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
    } else if (currentStep === 5) { // Connect Wallet - optional
        // No mandatory validation here
    } else if (currentStep === 6) { // Photos - Optional
    } else if (currentStep === 7) { // Initial Agreements - Optional (can be empty)
    } else if (currentStep === 8) { // Terms
      if (!acceptedContract) {
        setError('You must accept the Terms of Service to continue.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleFinalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateStep()) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      signup(
        email,
        unionName,
        relationshipStructure,
        religion,
        isWalletConnected,
        connectedWalletAddress,
        contractClauses,
      );
    } catch (err) {
      setError('Failed to create contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gradient-green/20 via-gradient-blue/20 to-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl bg-card border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Image src="/logo.svg" alt="Ipê Acta Logo" width={250} height={83} data-ai-hint="logo IpêActa" style={{ filter: 'brightness(0) invert(1)' }}/>
          </Link>
           <CardDescription className="font-lato text-muted-foreground mb-3">
             Follow the steps to create your contract.
          </CardDescription>
          <div className="flex items-center justify-center w-full my-4 px-4 sm:px-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300",
                      index + 1 < currentStep // Completed
                        ? "bg-primary text-primary-foreground"
                        : index + 1 === currentStep // Current
                        ? "bg-primary/20 border-2 border-primary text-primary scale-110"
                        : // Pending
                          "bg-muted border-2 border-border text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                </div>
                {index < TOTAL_STEPS - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 sm:h-1 mx-0.5 sm:mx-1 transition-colors duration-300",
                      index + 1 < currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-6 flex flex-col items-center">
            
            {currentStep === 1 && ( 
              <div className="space-y-4 flex flex-col"> {/* Container for Step 1 */}
                <div> {/* Wrapper for Label and RadioGroup */}
                    <Label htmlFor="relationshipStructure" className="text-lg font-semibold flex items-center justify-start mb-2 text-foreground/90 w-full"><Users size={20} className="mr-2 text-primary" />Union Structure</Label>
                    <RadioGroup
                        value={relationshipStructure}
                        onValueChange={(value: 'monogamous' | 'polygamous') => setRelationshipStructure(value)}
                        className="space-y-2 flex flex-col items-start" 
                        disabled={isLoading}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monogamous" id="rel-monogamous" className="border-primary checked:bg-primary"/>
                            <Label htmlFor="rel-monogamous" className="font-normal text-foreground/90">Monogamous</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="polygamous" id="rel-polygamous" className="border-primary checked:bg-primary"/>
                            <Label htmlFor="rel-polygamous" className="font-normal text-foreground/90">Polygamous</Label>
                        </div>
                    </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 2 && ( 
                 <div className="space-y-4 flex flex-col"> {/* Container for Step 2 */}
                    <div> {/* Wrapper for Label and Select */}
                        <Label htmlFor="religion" className="text-lg font-semibold flex items-center justify-start mb-2 text-foreground/90 w-full"><BookOpen size={20} className="mr-2 text-primary" />Union Belief</Label>
                        <Select value={religion} onValueChange={(value) => setReligion(value === '' ? undefined : value)} disabled={isLoading}>
                            <SelectTrigger id="religion" className="bg-input text-foreground border-border focus:ring-primary w-full min-w-[200px] sm:min-w-[250px]">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground border-border">
                                {religionOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            )}

            {currentStep === 3 && ( 
              <div className="space-y-2 flex flex-col w-full max-w-lg">
                <Label htmlFor="unionName" className="text-foreground/90 w-full text-left">Union Name</Label>
                <Input
                  id="unionName"
                  type="text"
                  placeholder="Alex & Jamie Holding"
                  value={unionName}
                  onChange={(e) => setUnionName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary w-full"
                />
              </div>
            )}

            {currentStep === 4 && ( 
              <div className="space-y-6 flex flex-col w-full max-w-lg">
                <div className="space-y-2 w-full">
                  <Label htmlFor="email" className="text-foreground/90 text-left">Main Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="password" className="text-foreground/90 text-left">Password</Label>
                  <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-input text-foreground border-border focus:ring-primary pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <Eye size={16} />
                    </Button>
                  </div>
                   <p className="text-xs text-muted-foreground text-left">Minimum 6 characters.</p>
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="confirmPassword" className="text-foreground/90 text-left">Confirm Password</Label>
                   <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-input text-foreground border-border focus:ring-primary pr-10"
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Eye size={16} />
                    </Button>
                   </div>
                </div>
              </div>
            )}

            {currentStep === 5 && ( 
              <div className="space-y-4 flex flex-col w-full max-w-lg">
                <Label className="text-lg font-semibold flex items-center justify-start text-foreground/90 w-full"><Wallet size={20} className="mr-2 text-primary" />Connect Joint Wallet</Label>
                <CardDescription className="text-muted-foreground w-full text-left">Connect your digital wallet to auto-visualize your digital assets within the holding.</CardDescription>
                {isWalletConnected && connectedWalletAddress ? (
                  <div className="p-4 border rounded-md bg-accent/10 border-accent/30 text-accent w-full">
                    <p className="font-semibold text-left">Wallet Connected!</p>
                    <p className="text-sm break-all text-left">Address: {connectedWalletAddress}</p>
                    <Button variant="link" className="p-0 h-auto text-sm mt-1 text-accent hover:text-accent/80 float-left" onClick={() => {setIsWalletConnected(false); setConnectedWalletAddress(null);}}>
                        Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                    Connect Wallet (Simulated)
                  </Button>
                )}
                <p className="text-xs text-muted-foreground w-full text-left">
                  This is a simulation. No real wallet will be connected at this time.
                </p>
              </div>
            )}

            {currentStep === 6 && ( 
              <div className="space-y-4 flex flex-col w-full max-w-lg">
                <p className="text-sm text-muted-foreground w-full text-left">Add photos of the union (optional).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
                  <div className="space-y-2 flex flex-col items-start text-left w-full">
                    <Label htmlFor="photo1" className="text-foreground/90">Partner 1 Photo</Label>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full justify-start">
                      {photo1Preview ? (
                        <Image src={photo1Preview} alt="Partner 1 Photo Preview" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="union photo" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="avatar placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo1" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 1)} className="sr-only" disabled={isLoading} />
                      <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80" onClick={() => document.getElementById('photo1')?.click()} disabled={isLoading}>
                        {photo1 ? "Change Photo" : "Choose Photo"}
                      </Button>
                    </div>
                    {photo1 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs text-left" title={photo1.name}>{photo1.name}</p>}
                  </div>
                  <div className="space-y-2 flex flex-col items-start text-left w-full">
                    <Label htmlFor="photo2" className="text-foreground/90">Partner 2 Photo</Label>
                     <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full justify-start">
                      {photo2Preview ? (
                        <Image src={photo2Preview} alt="Partner 2 Photo Preview" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="union photo" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="avatar placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo2" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 2)} className="sr-only" disabled={isLoading} />
                       <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80" onClick={() => document.getElementById('photo2')?.click()} disabled={isLoading}>
                        {photo2 ? "Change Photo" : "Choose Photo"}
                      </Button>
                    </div>
                    {photo2 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs text-left" title={photo2.name}>{photo2.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && ( 
              <div className="space-y-4 flex flex-col w-full max-w-lg">
                <Label className="text-lg font-semibold flex items-center justify-start text-foreground/90 w-full"><FileText size={20} className="mr-2 text-primary"/>Initial Contract Agreements</Label>
                <CardDescription className="text-muted-foreground w-full text-left">Define the initial clauses of your contract. You can edit them later.</CardDescription>
                
                <div className="space-y-2 w-full">
                  <Label htmlFor="clause-text-area" className="text-foreground/90 text-left block">
                    {editingClause ? 'Edit Clause' : 'New Clause'}
                  </Label>
                  <Textarea
                    id="clause-text-area"
                    value={editingClause ? editingClause.text : newClauseText}
                    onChange={(e) => editingClause ? setEditingClause({...editingClause, text: e.target.value}) : setNewClauseText(e.target.value)}
                    placeholder="Enter clause text here..."
                    className="min-h-[80px] bg-input text-foreground placeholder:text-muted-foreground"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <Button type="button" onClick={handleAddOrUpdateClause} className="bg-primary hover:bg-primary/90 text-primary-foreground sm:flex-1" disabled={isLoading || !(editingClause ? editingClause.text.trim() : newClauseText.trim())}>
                      {editingClause ? <><Save size={16} className="mr-2" /> Save Changes</> : <><PlusCircle size={16} className="mr-2" /> Add Clause</>}
                    </Button>
                    {editingClause && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="text-foreground/90 border-border hover:bg-muted/80 sm:w-auto" disabled={isLoading}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>

                {contractClauses.length > 0 && (
                  <div className="space-y-3 w-full">
                    <h4 className="text-md font-medium text-foreground/80 pt-2 text-left">Added Clauses:</h4>
                    <ScrollArea className="h-40 border rounded-md p-3 bg-muted/30 text-left">
                      <ul className="space-y-2">
                        {contractClauses.map((clause) => (
                          <li key={clause.id} className="p-2 bg-background/50 rounded-md text-sm text-foreground border border-border/30">
                            <p className="whitespace-pre-wrap mb-1">{clause.text}</p>
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-primary hover:text-primary/80" onClick={() => handleEditClause(clause)} disabled={isLoading}>
                                <Edit3 size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive/80" onClick={() => handleRemoveClause(clause.id)} disabled={isLoading}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {currentStep === 8 && ( 
              <div className="space-y-4 flex flex-col w-full max-w-lg">
                <Label className="text-lg font-semibold text-foreground/90 w-full text-left">Terms of Service - Ipê Acta</Label>
                <div className="p-4 border border-border rounded-md max-h-40 overflow-y-auto bg-muted/50 text-sm text-muted-foreground w-full text-left">
                  <p className="mb-2">By creating an account with Ipê Acta, you agree to our Terms of Service and Privacy Policy.</p>
                  <p className="mb-2"><strong>1. Use of Service:</strong> You agree to use Ipê Acta only for lawful purposes and in accordance with these terms. The service is provided for creating and managing union and asset records.</p>
                  <p className="mb-2"><strong>2. User Content:</strong> You are responsible for all content you submit. You grant Ipê Acta a license to use this content in the context of providing the service.</p>
                  <p className="mb-2"><strong>3. Nature of Service:</strong> Ipê Acta is a visual planning and management tool. It does not provide legal, financial, or accounting advice. Responsibility for validity and professional advice is yours.</p>
                  <p className="mb-2"><strong>4. Privacy:</strong> Your data will be handled according to our Privacy Policy.</p>
                  <p><strong>5. Limitation of Liability:</strong> Ipê Acta is not liable for losses or damages resulting from the use of the service.</p>
                  <p className="mt-2"><strong>6. Wallet Connection (Simulated):</strong> The wallet connection feature is currently simulated. No real data from your wallet is accessed or stored.</p>
                  <p className="mt-2"><strong>7. Contractual Clauses:</strong> The clauses you define are for your record and planning. Ipê Acta does not validate or endorse the legality or applicability of these clauses.</p>
                  <p className="mt-2"><strong>8. No Legal Formalization:</strong> Ipê Acta is a planning tool and does not perform legal formalization of any entity or contract. Consult qualified professionals for legal and tax matters.</p>
                </div>
                <div className="flex items-center space-x-2 w-full justify-start">
                  <Checkbox id="terms" checked={acceptedContract} onCheckedChange={(checked) => setAcceptedContract(Boolean(checked))} disabled={isLoading} className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/>
                  <Label htmlFor="terms" className="text-sm font-normal text-foreground/90">
                    I have read and accept the Ipê Acta Terms of Service and Privacy Policy.
                  </Label>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive text-center w-full max-w-lg">{error}</p>}

            <div className="flex justify-between items-center pt-4 w-full max-w-lg">
              {currentStep === 1 ? (
                 <Button type="button" variant="outline" onClick={() => router.push('/')} disabled={isLoading} className="text-foreground/90 border-border hover:bg-muted/80">
                    <HomeIcon className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              ) : currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading} className="text-foreground/90 border-border hover:bg-muted/80">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div /> 
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleNextStep} disabled={isLoading}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !acceptedContract}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Create Contract
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have a contract?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
            <Link href="/login">Access here</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}


    

    