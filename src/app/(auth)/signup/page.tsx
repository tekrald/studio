
"use client";
import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Camera, Briefcase, ExternalLink, Users, BookOpen } from 'lucide-react';

const TOTAL_STEPS = 6; 

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [religion, setReligion] = useState('');
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | 'other' | ''>('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);

  const [holdingType, setHoldingType] = useState<'digital' | 'physical' | ''>('');
  const [acknowledgedPhysicalInfo, setAcknowledgedPhysicalInfo] = useState(false);
  
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

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) { // Detalhes da União
      if (!relationshipStructure) {
        setError("Por favor, selecione a estrutura da relação.");
        return false;
      }
      // Religião é opcional
    } else if (currentStep === 2) { // Nome do Casal
      if (!name.trim()) {
        setError("Por favor, insira o nome do casal.");
        return false;
      }
    } else if (currentStep === 3) { // Detalhes da Conta
      if (!email.trim() || !password || !confirmPassword) {
        setError("Por favor, preencha email, senha e confirmação de senha.");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Por favor, insira um endereço de email válido.");
        return false;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return false;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return false;
      }
    } else if (currentStep === 4) { // Fotos do Casal
      // Upload de fotos é opcional
    } else if (currentStep === 5) { // Formalização da Holding
      if (!holdingType) {
        setError("Por favor, selecione como vocês pretendem estruturar a holding.");
        return false;
      }
      if (holdingType === 'physical' && !acknowledgedPhysicalInfo) {
        setError("Você deve confirmar que está ciente sobre a necessidade de consulta profissional para holding física/mista.");
        return false;
      }
    } else if (currentStep === 6) { // Termos e Condições
      if (!acceptedContract) {
        setError('Você precisa aceitar os Termos e Condições para continuar.');
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
      // Simulação de envio para o backend
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      // A função signup atualmente não aceita religion ou relationshipStructure.
      // Estes dados precisariam ser passados e tratados no AuthProvider e/ou backend.
      signup(email, name, holdingType); 
    } catch (err) {
      setError('Falha ao criar conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-gray-100 to-[#f0f0f0] p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Image src="/domedome-logo.svg" alt="domedome Logo" width={250} height={83} priority data-ai-hint="logo domedome" />
          </Link>
          <CardDescription className="text-lg">Siga as etapas para começar a construir seu futuro. (Etapa {currentStep} de {TOTAL_STEPS})</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {currentStep === 1 && ( // Detalhes da União
              <div className="space-y-4">
                <div>
                    <Label htmlFor="relationshipStructure" className="text-lg font-semibold flex items-center mb-2"><Users size={20} className="mr-2 text-primary" />Estrutura da Relação</Label>
                    <RadioGroup 
                        value={relationshipStructure} 
                        onValueChange={(value: 'monogamous' | 'polygamous' | 'other' | '') => setRelationshipStructure(value)} 
                        className="space-y-2"
                        disabled={isLoading}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monogamous" id="rel-monogamous" />
                            <Label htmlFor="rel-monogamous" className="font-normal">Monogâmica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="polygamous" id="rel-polygamous" />
                            <Label htmlFor="rel-polygamous" className="font-normal">Poligâmica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="rel-other" />
                            <Label htmlFor="rel-other" className="font-normal">Outra</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div>
                    <Label htmlFor="religion" className="text-lg font-semibold flex items-center mb-2"><BookOpen size={20} className="mr-2 text-primary" />Religião / Crença Espiritual (Opcional)</Label>
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
              </div>
            )}

            {currentStep === 2 && ( // Nome do Casal
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Casal (ex: Alex & Jamie)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex & Jamie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            )}

            {currentStep === 3 && ( // Detalhes da Conta
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de Email Compartilhado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                   <p className="text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {currentStep === 4 && ( // Fotos do Casal
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Adicione fotos que representem vocês como união (opcional).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="photo1">Foto 1</Label>
                    <div className="flex items-center space-x-2">
                      {photo1Preview ? (
                        <Image src={photo1Preview} alt="Pré-visualização Foto 1" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="couple photo preview" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="couple photo placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo1" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 1)} className="sr-only" disabled={isLoading} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('photo1')?.click()} disabled={isLoading}>
                        {photo1 ? "Trocar Foto" : "Escolher Foto"}
                      </Button>
                    </div>
                    {photo1 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo1.name}>{photo1.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo2">Foto 2 (Opcional)</Label>
                     <div className="flex items-center space-x-2">
                      {photo2Preview ? (
                        <Image src={photo2Preview} alt="Pré-visualização Foto 2" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="couple photo preview" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="couple photo placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo2" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 2)} className="sr-only" disabled={isLoading} />
                       <Button type="button" variant="outline" onClick={() => document.getElementById('photo2')?.click()} disabled={isLoading}>
                        {photo2 ? "Trocar Foto" : "Escolher Foto"}
                      </Button>
                    </div>
                    {photo2 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo2.name}>{photo2.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && ( // Formalização da Holding
              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center"><Briefcase size={20} className="mr-2 text-primary" />Formalização da Holding Familiar</Label>
                <CardDescription>Como vocês pretendem estruturar a holding para seus ativos?</CardDescription>
                
                <RadioGroup value={holdingType} onValueChange={(value: 'digital' | 'physical' | '') => { setHoldingType(value); setAcknowledgedPhysicalInfo(false); }} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital" id="holding-digital" />
                    <Label htmlFor="holding-digital" className="font-normal">Digital</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="holding-physical" />
                    <Label htmlFor="holding-physical" className="font-normal">Física ou Mista (incluindo imóveis, veículos, etc.)</Label>
                  </div>
                </RadioGroup>

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
                      A formalização de holdings digitais pode ocorrer via empresas em países específicos ou através de estruturas digitais vinculadas a carteiras/empresas em zonas econômicas digitais. Pesquise as opções que melhor se adequam ao seu perfil.
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
                            id="acknowledgedPhysicalInfo" 
                            checked={acknowledgedPhysicalInfo} 
                            onCheckedChange={(checked) => setAcknowledgedPhysicalInfo(Boolean(checked))}
                            disabled={isLoading}
                        />
                        <Label htmlFor="acknowledgedPhysicalInfo" className="text-sm font-normal text-foreground leading-snug">
                            Estou ciente de que a formalização de uma holding física ou mista requer consulta profissional e que domedome não fornece aconselhamento legal ou contábil.
                        </Label>
                    </div>
                  </Card>
                )}
                 <CardDescription className="text-xs pt-2">
                  Lembre-se: domedome oferece uma gestão visual para o seu planejamento. A formalização legal da sua holding e questões tributárias devem ser tratadas com profissionais qualificados (contadores, advogados).
                </CardDescription>
              </div>
            )}

            {currentStep === 6 && ( // Termos e Condições
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Termos e Condições do Aplicativo</Label>
                <div className="p-4 border rounded-md max-h-40 overflow-y-auto bg-muted/50 text-sm">
                  <p className="mb-2">Ao criar uma conta no domedome, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
                  <p className="mb-2"><strong>1. Uso do Serviço:</strong> Você concorda em usar o domedome apenas para fins legais e de acordo com estes termos. O serviço é fornecido para planejamento pessoal e gestão visual de patrimônio.</p>
                  <p className="mb-2"><strong>2. Conteúdo do Usuário:</strong> Você é responsável por todo o conteúdo que envia (fotos, textos, dados de ativos). Você concede ao domedome uma licença para usar esse conteúdo no contexto da prestação do serviço.</p>
                  <p className="mb-2"><strong>3. Natureza do Serviço:</strong> domedome é uma ferramenta de planejamento e visualização. Não fornece aconselhamento legal, financeiro ou contábil, nem realiza a formalização legal de holdings ou empresas. A responsabilidade pela formalização e aconselhamento profissional é inteiramente sua.</p>
                  <p className="mb-2"><strong>4. Privacidade:</strong> Seus dados serão tratados conforme nossa Política de Privacidade. Coletamos informações para fornecer e melhorar o serviço.</p>
                  <p><strong>5. Limitação de Responsabilidade:</strong> O domedome não se responsabiliza por perdas ou danos resultantes do uso do serviço, nem por decisões tomadas com base nas informações aqui apresentadas, na máxima extensão permitida por lei.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={acceptedContract} onCheckedChange={(checked) => setAcceptedContract(Boolean(checked))} disabled={isLoading} />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    Eu li e aceito os Termos de Serviço e a Política de Privacidade.
                  </Label>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between items-center pt-4">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              ) : (
                <div /> 
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" className="bg-primary hover:bg-primary/90" onClick={handleNextStep} disabled={isLoading}>
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading || !acceptedContract}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Cadastrar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-primary">
              <Link href="/login">Faça login aqui</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
    
    

    
    

    



    



