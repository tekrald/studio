
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
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Camera, Wallet, Users, BookOpen } from 'lucide-react';

const TOTAL_STEPS = 6; 

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

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [religion, setReligion] = useState('');
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | ''>('');

  const [name, setName] = useState(''); // Nome da Entidade/Registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);
  
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

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) { // Detalhes da Sociedade
      if (!relationshipStructure) {
        setError("Por favor, selecione a estrutura da sua sociedade/relação.");
        return false;
      }
    } else if (currentStep === 2) { // Nome da Entidade/Registro
      if (!name.trim()) {
        setError("Por favor, insira o nome da entidade/registro.");
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
    } else if (currentStep === 4) { // Conectar Carteira
      // Esta etapa é opcional
    } else if (currentStep === 5) { // Logos/Imagens (ex-Fotos do Casal)
      // Upload de logos/imagens é opcional
    } else if (currentStep === 6) { // Termos e Condições
      if (!acceptedContract) {
        setError('Você precisa aceitar os Termos de Serviço para continuar.');
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
        name, // Nome da Entidade/Registro
        relationshipStructure,
        religion,
        isWalletConnected,
        connectedWalletAddress
      ); 
    } catch (err) {
      setError('Falha ao criar conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-gray-100 to-[#f0f0f0] p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Image src="/acta-ipe-logo.svg" alt="Acta Ipê Logo" width={250} height={83} priority data-ai-hint="logo ActaIpê" />
          </Link>
          <CardDescription className="text-lg font-lato">Siga as etapas para criar seu registro em Ipê City. (Etapa {currentStep} de {TOTAL_STEPS})</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {currentStep === 1 && ( 
              <div className="space-y-4">
                <div>
                    <Label htmlFor="relationshipStructure" className="text-lg font-semibold flex items-center mb-2"><Users size={20} className="mr-2 text-primary" />Estrutura da Sociedade/Relação</Label>
                    <RadioGroup 
                        value={relationshipStructure} 
                        onValueChange={(value: 'monogamous' | 'polygamous' | '') => setRelationshipStructure(value as 'monogamous' | 'polygamous')}
                        className="space-y-2"
                        disabled={isLoading}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monogamous" id="rel-monogamous" />
                            <Label htmlFor="rel-monogamous" className="font-normal">Individual/Monogâmica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="polygamous" id="rel-polygamous" />
                            <Label htmlFor="rel-polygamous" className="font-normal">Coletiva/Poligâmica</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div>
                    <Label htmlFor="religion" className="text-lg font-semibold flex items-center mb-2"><BookOpen size={20} className="mr-2 text-primary" />Crença / Filosofia (Opcional)</Label>
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

            {currentStep === 2 && ( 
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Entidade/Registro (ex: Família Silva, Projeto Ipê Verde)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="ex: Família Silva, Projeto Ipê Verde"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            )}

            {currentStep === 3 && ( 
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de Email Principal</Label>
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

            {currentStep === 4 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center"><Wallet size={20} className="mr-2 text-primary" />Conectar Carteira Digital (Opcional)</Label>
                <CardDescription>Conecte sua carteira digital para futuramente sincronizar ativos digitais automaticamente com seus registros em Ipê City.</CardDescription>
                {isWalletConnected && connectedWalletAddress ? (
                  <div className="p-4 border rounded-md bg-green-50 border-green-200 text-green-700">
                    <p className="font-semibold">Carteira Conectada!</p>
                    <p className="text-sm break-all">Endereço: {connectedWalletAddress}</p>
                    <Button variant="link" className="p-0 h-auto text-sm mt-1 text-green-700" onClick={() => {setIsWalletConnected(false); setConnectedWalletAddress(null);}}>
                        Desconectar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                    Conectar Carteira (Simulado)
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Esta é uma simulação. Nenhuma carteira real será conectada neste momento.
                  Esta etapa é opcional e você pode prosseguir sem conectar uma carteira.
                </p>
              </div>
            )}

            {currentStep === 5 && ( 
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Adicione logos ou imagens que representem sua entidade/registro (opcional).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="photo1">Imagem 1</Label>
                    <div className="flex items-center space-x-2">
                      {photo1Preview ? (
                        <Image src={photo1Preview} alt="Pré-visualização Imagem 1" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="entity logo preview" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="entity logo placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo1" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 1)} className="sr-only" disabled={isLoading} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('photo1')?.click()} disabled={isLoading}>
                        {photo1 ? "Trocar Imagem" : "Escolher Imagem"}
                      </Button>
                    </div>
                    {photo1 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo1.name}>{photo1.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo2">Imagem 2 (Opcional)</Label>
                     <div className="flex items-center space-x-2">
                      {photo2Preview ? (
                        <Image src={photo2Preview} alt="Pré-visualização Imagem 2" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="entity logo preview" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="entity logo placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo2" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 2)} className="sr-only" disabled={isLoading} />
                       <Button type="button" variant="outline" onClick={() => document.getElementById('photo2')?.click()} disabled={isLoading}>
                        {photo2 ? "Trocar Imagem" : "Escolher Imagem"}
                      </Button>
                    </div>
                    {photo2 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo2.name}>{photo2.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && ( 
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Termos de Serviço da Plataforma Acta Ipê</Label>
                <div className="p-4 border rounded-md max-h-40 overflow-y-auto bg-muted/50 text-sm">
                  <p className="mb-2">Ao criar uma conta no Acta Ipê, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
                  <p className="mb-2"><strong>1. Uso do Serviço:</strong> Você concorda em usar o Acta Ipê apenas para fins legais e de acordo com estes termos. O serviço é fornecido para registro e gestão visual de ativos e acordos na Ipê City.</p>
                  <p className="mb-2"><strong>2. Conteúdo do Usuário:</strong> Você é responsável por todo o conteúdo que envia (logos, textos, dados de ativos). Você concede ao Acta Ipê uma licença para usar esse conteúdo no contexto da prestação do serviço.</p>
                  <p className="mb-2"><strong>3. Natureza do Serviço:</strong> Acta Ipê é uma ferramenta de registro visual e planejamento. Não fornece aconselhamento legal, financeiro ou contábil, nem realiza a formalização legal ou jurídica de entidades ou acordos. A responsabilidade pela validade e aconselhamento profissional é inteiramente sua.</p>
                  <p className="mb-2"><strong>4. Privacidade:</strong> Seus dados serão tratados conforme nossa Política de Privacidade.</p>
                  <p><strong>5. Limitação de Responsabilidade:</strong> O Acta Ipê não se responsabiliza por perdas ou danos resultantes do uso do serviço, nem por decisões tomadas com base nas informações aqui apresentadas, na máxima extensão permitida por lei.</p>
                  <p className="mt-2"><strong>6. Conexão de Carteira (Simulada):</strong> A funcionalidade de conexão de carteira é atualmente simulada. Nenhum dado real da sua carteira é acessado ou armazenado.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={acceptedContract} onCheckedChange={(checked) => setAcceptedContract(Boolean(checked))} disabled={isLoading} />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    Eu li e aceito os Termos de Serviço e a Política de Privacidade do Acta Ipê.
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
                  Criar Registro
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Já possui um registro?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-primary">
              <Link href="/login">Acesse aqui</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
