
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save, Loader2, Briefcase, Users, BookOpen, Landmark, FileText, Edit3 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog'; // Import dialog and type

const religionOptions = [
    { value: "agnosticismo", label: "Agnosticismo" },
    { value: "ateismo", label: "Ateísmo" },
    { value: "budismo", label: "Budismo" },
    { value: "cristianismo", label: "Cristianismo" },
    { value: "espiritismo", label: "Espiritismo" },
    { value: "hinduismo", label: "Hinduísmo" },
    { value: "islamismo", label: "Islamismo" },
    { value: "judaismo", label: "Judaísmo" },
    { value: "nao_dizer", label: "Prefiro não dizer" },
    { value: "outra", label: "Outra" },
].sort((a, b) => a.label.localeCompare(b.label));

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarText, setAvatarText] = useState('');
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | ''>('');
  const [religion, setReligion] = useState('');
  const [holdingType, setHoldingType] = useState<'physical' | ''>('');
  const [cnpjHolding, setCnpjHolding] = useState('');

  // State for contract clauses and dialog
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
      setContractClauses(user.contractClauses || []); // Load contract clauses
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

  // Clause Management Handlers
  const handleAddContractClause = (text: string) => {
    const newClause: ContractClause = {
      id: `clause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text,
    };
    setContractClauses(prev => [...prev, newClause]);
    toast({ title: 'Cláusula Adicionada', description: 'Nova cláusula pronta para ser salva.' });
  };
  
  const handleRemoveClause = (id: string) => {
    setContractClauses(prev => prev.filter(clause => clause.id !== id));
    toast({ title: 'Cláusula Removida', description: 'A cláusula foi removida (lembre-se de salvar as alterações).' });
  };

  const handleUpdateContractClause = (id: string, newText: string) => {
    setContractClauses(prev => prev.map(clause => clause.id === id ? { ...clause, text: newText } : clause));
    toast({ title: 'Cláusula Atualizada', description: 'A cláusula foi modificada (lembre-se de salvar as alterações).' });
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!relationshipStructure) {
        toast({
        title: 'Campo Obrigatório',
        description: 'Por favor, selecione a estrutura da sua união.',
        variant: 'destructive',
      });
      return;
    }
     if (holdingType === 'physical' && !cnpjHolding.trim()) {
        // Tornando CNPJ opcional, então removemos essa validação estrita.
        // Se precisar ser obrigatório, descomente e ajuste a mensagem.
        // toast({
        //   title: 'Campo Obrigatório',
        //   description: 'Por favor, insira o CNPJ da holding física/mista.',
        //   variant: 'destructive',
        // });
        // return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula atraso
      updateProfile({
        displayName,
        relationshipStructure,
        religion,
        holdingType,
        cnpjHolding: holdingType === 'physical' ? cnpjHolding : '',
        contractClauses, // Salvar cláusulas
      });
      toast({
        title: 'Perfil Atualizado',
        description: 'Suas informações de perfil foram salvas.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar perfil. Por favor, tente novamente.',
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
        <p className="text-muted-foreground">Usuário não encontrado. Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl mb-8 bg-card border-border">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl text-foreground">Perfil da União</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie suas informações e preferências aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 text-3xl ring-4 ring-primary ring-offset-background ring-offset-2">
                <AvatarImage src={`https://placehold.co/150x150.png?text=${avatarText}`} alt={displayName} data-ai-hint="casal avatar"/>
                <AvatarFallback className="bg-gradient-to-br from-gradient-green to-gradient-blue text-black">
                  {avatarText || '??'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">As iniciais do avatar são baseadas no nome da união.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground/90">Nome da União (Ex: Alex &amp; Jamie)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Ex: Alex & Jamie"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Endereço de Email Principal</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="cursor-not-allowed bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado aqui.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="relationshipStructure" className="flex items-center text-foreground/90"><Users size={18} className="mr-2 text-primary" />Estrutura da União</Label>
                <RadioGroup
                    value={relationshipStructure}
                    onValueChange={(value: 'monogamous' | 'polygamous' | '') => setRelationshipStructure(value as 'monogamous' | 'polygamous' | '')}
                    className="space-y-2 pt-1"
                    disabled={isLoading}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monogamous" id="profile-rel-monogamous" className="border-primary checked:bg-primary" />
                        <Label htmlFor="profile-rel-monogamous" className="font-normal text-foreground/90">Monogâmica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="polygamous" id="profile-rel-polygamous" className="border-primary checked:bg-primary"/>
                        <Label htmlFor="profile-rel-polygamous" className="font-normal text-foreground/90">Poligâmica</Label>
                    </div>
                </RadioGroup>
                 {!relationshipStructure && <p className="text-xs text-destructive">Este campo é obrigatório.</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="religion" className="flex items-center text-foreground/90"><BookOpen size={18} className="mr-2 text-primary" />Crença da União</Label>
                <Select value={religion} onValueChange={setReligion} disabled={isLoading}>
                    <SelectTrigger id="religion" className="bg-input text-foreground">
                        <SelectValue placeholder="Selecione uma opção" />
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
                <CardTitle className="text-2xl flex items-center text-foreground"><FileText className="mr-3 text-primary h-7 w-7" />Acordos do Registro</CardTitle>
                <CardDescription className="text-muted-foreground">
                Visualize e gerencie as cláusulas e acordos definidos para este registro.
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
                    <Edit3 className="mr-2 h-4 w-4" /> Gerenciar Acordos ({contractClauses.length} cláusulas)
                </Button>
            </CardContent>
        </Card>


        <Card className="shadow-xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-foreground"><Landmark className="mr-3 text-primary h-7 w-7" />Formalização da Entidade</CardTitle>
            <CardDescription className="text-muted-foreground">
              Indique como sua entidade está ou será formalizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base text-foreground/90">Como esta entidade está ou será estruturada legalmente?</Label>
              <RadioGroup
                value={holdingType}
                onValueChange={(value: 'physical' | '') => {
                  setHoldingType(value);
                }}
                className="space-y-2 pt-1"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="profile-holding-undefined" className="border-primary checked:bg-primary"/>
                  <Label htmlFor="profile-holding-undefined" className="font-normal text-foreground/90">Ainda não definido / Não formalizado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physical" id="profile-holding-physical" className="border-primary checked:bg-primary"/>
                  <Label htmlFor="profile-holding-physical" className="font-normal text-foreground/90">Física ou Mista (com ativos físicos)</Label>
                </div>
              </RadioGroup>
            </div>

            {holdingType === 'physical' && (
              <Card className="p-4 bg-muted/30 space-y-4 border-border">
                 <p className="text-sm text-foreground/80 font-medium">
                  A formalização de entidades com ativos físicos (imóveis, veículos) ou mistas geralmente requer a consulta a um contador ou advogado para os processos legais e fiscais.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cnpjHolding" className="text-foreground/90">CNPJ da Entidade (Opcional)</Label>
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
             <CardDescription className="text-xs pt-2 text-muted-foreground">
              Lembre-se: Ipê Acta oferece uma gestão visual para seu planejamento. A formalização legal da sua entidade e questões tributárias devem ser tratadas com profissionais qualificados.
            </CardDescription>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-8" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Todas as Alterações
        </Button>
      </form>

      <ContractSettingsDialog
        isOpen={isContractSettingsModalOpen}
        onClose={() => setIsContractSettingsModalOpen(false)}
        clauses={contractClauses}
        onAddClause={handleAddContractClause}
        onRemoveClause={handleRemoveClause}
        onUpdateClause={handleUpdateContractClause}
        dialogTitle="Gerenciar Acordos do Registro"
        dialogDescription="Edite, adicione ou remova cláusulas dos seus acordos. As alterações serão salvas ao clicar em 'Salvar Todas as Alterações' no perfil."
      />
    </div>
  );
}

  