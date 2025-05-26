
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save, Loader2, Users, BookOpen, Landmark, FileText, Edit3 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog'; 

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


export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarText, setAvatarText] = useState('');
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | ''>('');
  const [religion, setReligion] = useState('');
  
  const [holdingType, setHoldingType] = useState<'physical' | ''>('');
  const [cnpjHolding, setCnpjHolding] = useState('');

  const [contractClauses, setContractClauses] = useState<ContractClause[]>([]);
  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setRelationshipStructure(user.relationshipStructure || '');
      setReligion(user.religion || ''); 
      setHoldingType(user.holdingType || '');
      setCnpjHolding(user.cnpjHolding || '');
      setContractClauses(user.contractClauses || []);
    }
  }, [user]);

  useEffect(() => {
    if (displayName) {
      const names = displayName.split('&').map(name => name.trim());
      if (names.length > 1 && names[0] && names[1]) {
        setAvatarText(`${names[0][0]}${names[1][0]}`);
      } else if (names.length === 1 && names[0]) {
        setAvatarText(names[0].substring(0, 2).toUpperCase());
      } else {
         setAvatarText(displayName.substring(0,2).toUpperCase() || '??');
      }
    } else if (user?.email) {
      setAvatarText(user.email.substring(0,2).toUpperCase());
    } else {
       setAvatarText('??');
    }
  }, [displayName, user?.email]);

  const handleAddContractClause = (text: string) => {
    const newClause: ContractClause = {
      id: `clause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text,
    };
    setContractClauses(prev => [...prev, newClause]);
    toast({ title: 'Clause Added', description: 'New clause ready to be saved.' });
  };
  
  const handleRemoveClause = (id: string) => {
    setContractClauses(prev => prev.filter(clause => clause.id !== id));
    toast({ title: 'Clause Removed', description: 'Clause removed (remember to save changes).' });
  };

  const handleUpdateContractClause = (id: string, newText: string) => {
    setContractClauses(prev => prev.map(clause => clause.id === id ? { ...clause, text: newText } : clause));
    toast({ title: 'Clause Updated', description: 'Clause modified (remember to save changes).' });
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!relationshipStructure) {
        toast({
        title: 'Required Field',
        description: 'Please select your union structure.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      updateProfile({
        displayName,
        relationshipStructure,
        religion,
        holdingType,
        cnpjHolding: holdingType === 'physical' ? cnpjHolding : '',
        contractClauses,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
     return (
      <div className="flex flex-col min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex flex-col min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <p className="text-muted-foreground">User not found. Log in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl mb-8 bg-card border-border">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl text-foreground font-lato">Union Profile</CardTitle>
            <CardDescription className="text-muted-foreground font-lato">
              Manage your information and preferences here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 text-3xl ring-4 ring-primary ring-offset-background ring-offset-2">
                <AvatarImage src={`https://placehold.co/150x150.png?text=${avatarText}`} alt={displayName} data-ai-hint="couple avatar"/>
                <AvatarFallback className="bg-gradient-to-br from-gradient-green to-gradient-blue text-black">
                  {avatarText || '??'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">Avatar initials are based on the union name.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground/90">Union Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Main Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="cursor-not-allowed bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="relationshipStructure" className="flex items-center text-foreground/90"><Users size={18} className="mr-2 text-primary" />Union Structure</Label>
                <RadioGroup
                    value={relationshipStructure}
                    onValueChange={(value: 'monogamous' | 'polygamous' | '') => setRelationshipStructure(value as 'monogamous' | 'polygamous' | '')}
                    className="space-y-2 pt-1"
                    disabled={isLoading}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monogamous" id="profile-rel-monogamous" className="border-primary checked:bg-primary" />
                        <Label htmlFor="profile-rel-monogamous" className="font-normal text-foreground/90">Monogamous</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="polygamous" id="profile-rel-polygamous" className="border-primary checked:bg-primary"/>
                        <Label htmlFor="profile-rel-polygamous" className="font-normal text-foreground/90">Polygamous</Label>
                    </div>
                </RadioGroup>
                 {!relationshipStructure && <p className="text-xs text-destructive">This field is required.</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="religion" className="flex items-center text-foreground/90"><BookOpen size={18} className="mr-2 text-primary" />Union Belief</Label>
                <Select value={religion} onValueChange={setReligion} disabled={isLoading}>
                    <SelectTrigger id="religion" className="bg-input text-foreground">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                        {religionOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl mb-8 bg-card border-border">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center text-foreground"><FileText className="mr-3 text-primary h-7 w-7" />Contract Agreements</CardTitle>
                <CardDescription className="text-muted-foreground">
                View and manage the clauses and agreements defined for this record.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full text-foreground/90 border-border hover:bg-muted/80"
                    onClick={() => setIsContractSettingsModalOpen(true)}
                    disabled={isLoading}
                >
                    <Edit3 className="mr-2 h-4 w-4" /> Manage Agreements ({contractClauses.length} clauses)
                </Button>
            </CardContent>
        </Card>


        <Card className="shadow-xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-foreground"><Landmark className="mr-3 text-primary h-7 w-7" />Entity Formalization</CardTitle>
            <CardDescription className="text-muted-foreground">
              Indicate how your entity is or will be formalized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base text-foreground/90">How is this entity legally structured or to be structured?</Label>
              <RadioGroup
                value={holdingType}
                onValueChange={(value: 'physical' | '') => {
                  setHoldingType(value);
                  if (value === '') { 
                    setCnpjHolding('');
                  }
                }}
                className="space-y-2 pt-1"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="profile-holding-undefined" className="border-primary checked:bg-primary"/>
                  <Label htmlFor="profile-holding-undefined" className="font-normal text-foreground/90">Digital / IpêActa Formalization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physical" id="profile-holding-physical" className="border-primary checked:bg-primary"/>
                  <Label htmlFor="profile-holding-physical" className="font-normal text-foreground/90">Mixed (with physical assets)</Label>
                </div>
              </RadioGroup>
            </div>

            {holdingType === 'physical' && (
              <Card className="p-4 bg-muted/30 space-y-4 border-border">
                 <p className="text-sm text-foreground/80 font-medium">
                  The formalization of physical assets (real estate, vehicles) requires consulting an accountant or lawyer to open a company and ensure tax legality for succession.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cnpjHolding" className="text-foreground/90">Entity CNPJ (Optional)</Label>
                  <Input
                    id="cnpjHolding"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpjHolding}
                    onChange={(e) => setCnpjHolding(e.target.value)}
                    disabled={isLoading}
                    className="bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-8" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </form>

      <ContractSettingsDialog
        isOpen={isContractSettingsModalOpen}
        onClose={() => setIsContractSettingsModalOpen(false)}
        clauses={contractClauses}
        onAddClause={handleAddContractClause}
        onRemoveClause={handleRemoveClause}
        onUpdateClause={handleUpdateContractClause}
        dialogTitle="Manage Record Agreements"
        dialogDescription="Edit, add, or remove clauses from your agreements. Changes will be saved when you click 'Save All Changes' on the profile."
      />
    </div>
  );
}
