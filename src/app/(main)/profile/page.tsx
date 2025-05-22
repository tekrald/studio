
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save, Loader2, Briefcase, ExternalLink, Users, BookOpen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const religionOptions = [
    { value: "cristianismo", label: "Cristianismo" },
    { value: "islamismo", label: "Islamismo" },
    { value: "hinduismo", label: "Hinduísmo" },
    { value: "budismo", label: "Budismo" },
    { value: "judaismo", label: "Judaísmo" },
    { value: "espiritismo", label: "Espiritismo" },
    { value: "ateismo", label: "Ateísmo" },
    { value: "agnosticismo", label: "Agnosticismo" },
    { value: "outra", label: "Outra" },
    { value: "nao_dizer", label: "Prefiro não dizer" },
  ];

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarText, setAvatarText] = useState('');
  
  const [holdingType, setHoldingType] = useState<'digital' | 'physical' | ''>('');
  const [acknowledgedPhysicalInfoProfile, setAcknowledgedPhysicalInfoProfile] = useState(false);

  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | 'other' | ''>('');
  const [religion, setReligion] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setHoldingType(user.holdingType || '');
      setRelationshipStructure(user.relationshipStructure || '');
      setReligion(user.religion || '');
      
      if (user.holdingType === 'physical') {
        // setAcknowledgedPhysicalInfoProfile(true); // Default to false to re-confirm
      } else {
        setAcknowledgedPhysicalInfoProfile(false);
      }
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


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (holdingType === 'physical' && !acknowledgedPhysicalInfoProfile) {
      toast({
        title: 'Confirmação Necessária',
        description: 'Você deve confirmar que está ciente sobre a necessidade de consulta profissional para holding física/mista.',
        variant: 'destructive',
      });
      return;
    }
    if (!relationshipStructure) {
        toast({
        title: 'Campo Obrigatório',
        description: 'Por favor, selecione a estrutura da relação.',
        variant: 'destructive',
      });
      return;
    }


    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      updateProfile({
        displayName,
        holdingType,
        relationshipStructure,
        religion,
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
        <p>Usuário não encontrado. Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl mb-8">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl">Nosso Perfil</CardTitle> 
            <CardDescription>
              Gerencie suas informações compartilhadas aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 text-3xl ring-4 ring-primary ring-offset-background ring-offset-2">
                <AvatarImage src={`https://placehold.co/150x150.png?text=${avatarText}`} alt={displayName} data-ai-hint="couple avatar" />
                <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white">
                  {avatarText || '??'}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">As iniciais do avatar são baseadas no nome de exibição.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição do Casal (ex: Alex & Jamie)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="ex: Alex & Jamie"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de Email Compartilhado</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled 
                className="cursor-not-allowed bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado aqui.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="relationshipStructure" className="flex items-center"><Users size={18} className="mr-2 text-primary" />Estrutura da Relação</Label>
                <RadioGroup 
                    value={relationshipStructure} 
                    onValueChange={(value: 'monogamous' | 'polygamous' | 'other' | '') => setRelationshipStructure(value)} 
                    className="space-y-2 pt-1"
                    disabled={isLoading}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monogamous" id="profile-rel-monogamous" />
                        <Label htmlFor="profile-rel-monogamous" className="font-normal">Monogâmica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="polygamous" id="profile-rel-polygamous" />
                        <Label htmlFor="profile-rel-polygamous" className="font-normal">Poligâmica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="profile-rel-other" />
                        <Label htmlFor="profile-rel-other" className="font-normal">Outra</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="profile-rel-undefined" />
                        <Label htmlFor="profile-rel-undefined" className="font-normal">Não especificado</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="religion" className="flex items-center"><BookOpen size={18} className="mr-2 text-primary" />Religião / Crença Espiritual (Opcional)</Label>
                <Select value={religion} onValueChange={setReligion} disabled={isLoading}>
                    <SelectTrigger id="religion">
                        <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                        {religionOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Briefcase className="mr-3 text-primary h-7 w-7" />Formalização da Holding Familiar</CardTitle> 
            <CardDescription>
              Indique como vocês pretendem ou já formalizaram a holding para seus ativos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Como vocês pretendem estruturar/formalizar a holding?</Label>
              <RadioGroup 
                value={holdingType} 
                onValueChange={(value: 'digital' | 'physical' | '') => {
                  setHoldingType(value);
                  if (value !== 'physical') {
                    setAcknowledgedPhysicalInfoProfile(false); 
                  }
                }} 
                className="space-y-2 pt-1" 
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="digital" id="profile-holding-digital" />
                  <Label htmlFor="profile-holding-digital" className="font-normal">Digital</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="physical" id="profile-holding-physical" />
                  <Label htmlFor="profile-holding-physical" className="font-normal">Física ou Mista (incluindo imóveis, veículos, empresas tradicionais)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="profile-holding-undefined" />
                  <Label htmlFor="profile-holding-undefined" className="font-normal">Ainda não definido / Não formalizado</Label>
                </div>
              </RadioGroup>
            </div>

            {holdingType === 'digital' && (
              <Card className="p-4 bg-muted/30 space-y-3">
                <p className="text-sm text-foreground">
                  Para holdings com foco digital, considere a criação de uma empresa em uma Zona Econômica Especial como as da 'Tools for The Commons' para vincular suas carteiras cripto de forma transparente e eficiente.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.open('https://toolsforthecommons.com/', '_blank')}
                  className="w-full sm:w-auto"
                >
                  Consultar Tools for The Commons <ExternalLink size={16} className="ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  A formalização de holdings digitais pode ocorrer via empresas em países específicos ou através de estruturas digitais vinculadas a carteiras/empresas em zonas econômicas digitais. Pesquise as opções.
                </p>
              </Card>
            )}

            {holdingType === 'physical' && (
              <Card className="p-4 bg-muted/30 space-y-4">
                <p className="text-sm text-foreground font-medium">
                  Atenção: A formalização de holdings com ativos físicos (imóveis, veículos) ou mistas geralmente requer a consulta a um contador ou advogado para os processos legais e fiscais.
                </p>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                      id="acknowledgedPhysicalInfoProfile" 
                      checked={acknowledgedPhysicalInfoProfile} 
                      onCheckedChange={(checked) => setAcknowledgedPhysicalInfoProfile(Boolean(checked))}
                      disabled={isLoading}
                  />
                  <Label htmlFor="acknowledgedPhysicalInfoProfile" className="text-sm font-normal text-foreground leading-snug">
                      Estou ciente de que a formalização de uma holding física ou mista requer consulta profissional e que domedome não fornece aconselhamento legal ou contábil.
                  </Label>
                </div>
              </Card>
            )}
             <CardDescription className="text-xs pt-2">
              Lembre-se: domedome oferece uma gestão visual para seu planejamento. A formalização legal da sua holding e questões tributárias devem ser tratadas com profissionais qualificados.
            </CardDescription>
          </CardContent>
        </Card>
            
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-8" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Todas as Alterações
        </Button>
      </form>
    </div>
  );
}
