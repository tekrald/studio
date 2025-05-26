
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
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Camera, Wallet, Users, BookOpen, Edit3, PlusCircle, Save, Trash2, FileText } from 'lucide-react';
import type { ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const TOTAL_STEPS = 8;

const religionOptions = [
    { value: "agnosticismo", label: "Agnosticismo" },
    { value: "ateismo", label: "Ateísmo" },
    { value: "budismo", label: "Budismo" },
    { value: "cristianismo", label: "Cristianismo" },
    { value: "espiritismo", label: "Espiritismo" },
    { value: "hinduismo", label: "Hinduísmo" },
    { value: "islamismo", label: "Islamismo" },
    { value: "judaismo", label: "Judaísmo" },
    { value: "outra", label: "Outra" },
].sort((a, b) => a.label.localeCompare(b.label));


const defaultContractClauses: ContractClause[] = [
  { id: `initial-${Date.now()}-1`, text: "Todos os ativos adquiridos conjuntamente serão divididos conforme acordado em caso de dissolução da sociedade." },
  { id: `initial-${Date.now()}-2`, text: "As responsabilidades financeiras e operacionais serão divididas conforme definido neste registro." },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Etapa 1: Estrutura da União
  const [relationshipStructure, setRelationshipStructure] = useState<'monogamous' | 'polygamous' | ''>('');
  
  // Etapa 2: Crença
  const [religion, setReligion] = useState('');

  // Etapa 3: Nome da União
  const [unionName, setUnionName] = useState('');

  // Etapa 4: Detalhes da Conta
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Etapa 5: Conectar Carteira
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  // Etapa 6: Fotos
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);

  // Etapa 7: Acordos Iniciais
  const [contractClauses, setContractClauses] = useState<ContractClause[]>(defaultContractClauses);
  const [newClauseText, setNewClauseText] = useState('');
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);


  // Etapa 8: Termos e Condições
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
    if (currentStep === 1) { // Estrutura da União
      if (!relationshipStructure) {
        setError("Por favor, selecione a estrutura da sua união.");
        return false;
      }
    } else if (currentStep === 2) { // Crença
      // Nenhuma validação obrigatória aqui, pois o campo em si é opcional
    } else if (currentStep === 3) { // Nome da União
      if (!unionName.trim()) {
        setError("Por favor, insira o nome da união.");
        return false;
      }
    } else if (currentStep === 4) { // Detalhes da Conta
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
    } else if (currentStep === 5) { // Conectar Carteira - Opcional
    } else if (currentStep === 6) { // Fotos - Opcional
    } else if (currentStep === 7) { // Acordos Iniciais - Opcional (pode ser vazio)
    } else if (currentStep === 8) { // Termos
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
        unionName,
        relationshipStructure,
        religion,
        isWalletConnected,
        connectedWalletAddress,
        contractClauses 
      );
    } catch (err) {
      setError('Falha ao criar registro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-green/20 via-gradient-blue/20 to-background p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-card border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <Image src="/logo.svg" alt="Ipê Acta Logo" width={250} height={83} data-ai-hint="logo IpêActa" style={{ filter: 'brightness(0) invert(1)' }}/>
          </Link>
          <CardDescription className="text-lg font-sans text-muted-foreground">Siga as etapas para criar seu registro. (Etapa {currentStep} de {TOTAL_STEPS})</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {currentStep === 1 && ( // Etapa 1: Estrutura da União
              <div className="space-y-4">
                <div>
                    <Label htmlFor="relationshipStructure" className="text-lg font-semibold flex items-center mb-2 text-foreground/90"><Users size={20} className="mr-2 text-primary" />Estrutura da União</Label>
                    <RadioGroup
                        value={relationshipStructure}
                        onValueChange={(value: 'monogamous' | 'polygamous') => setRelationshipStructure(value)}
                        className="space-y-2"
                        disabled={isLoading}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monogamous" id="rel-monogamous" className="border-primary checked:bg-primary"/>
                            <Label htmlFor="rel-monogamous" className="font-normal text-foreground/90">Monogâmica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="polygamous" id="rel-polygamous" className="border-primary checked:bg-primary"/>
                            <Label htmlFor="rel-polygamous" className="font-normal text-foreground/90">Poligâmica</Label>
                        </div>
                    </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 2 && ( // Etapa 2: Crença
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor="religion" className="text-lg font-semibold flex items-center mb-2 text-foreground/90"><BookOpen size={20} className="mr-2 text-primary" />Crença da União</Label>
                        <Select value={religion} onValueChange={setReligion} disabled={isLoading}>
                            <SelectTrigger id="religion" className="bg-input text-foreground border-border focus:ring-primary">
                                <SelectValue placeholder="Selecione uma opção" />
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

            {currentStep === 3 && ( // Etapa 3: Nome da União
              <div className="space-y-2">
                <Label htmlFor="unionName" className="text-foreground/90">Nome da União</Label>
                <Input
                  id="unionName"
                  type="text"
                  placeholder="Ex: Alex & Jamie Holding"
                  value={unionName}
                  onChange={(e) => setUnionName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary"
                />
              </div>
            )}

            {currentStep === 4 && ( // Etapa 4: Detalhes da Conta
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/90">Endereço de Email Principal</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/90">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-input text-foreground border-border focus:ring-primary"
                  />
                   <p className="text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground/90">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-input text-foreground border-border focus:ring-primary"
                  />
                </div>
              </>
            )}

            {currentStep === 5 && ( // Etapa 5: Conectar Carteira
              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center text-foreground/90"><Wallet size={20} className="mr-2 text-primary" />Conectar Carteira da União (Opcional)</Label>
                <CardDescription className="text-muted-foreground">Conecte sua carteira digital para futuramente visualizar seus ativos digitais automaticamente (simulado).</CardDescription>
                {isWalletConnected && connectedWalletAddress ? (
                  <div className="p-4 border rounded-md bg-accent/10 border-accent/30 text-accent">
                    <p className="font-semibold">Carteira Conectada!</p>
                    <p className="text-sm break-all">Endereço: {connectedWalletAddress}</p>
                    <Button variant="link" className="p-0 h-auto text-sm mt-1 text-accent hover:text-accent/80" onClick={() => {setIsWalletConnected(false); setConnectedWalletAddress(null);}}>
                        Desconectar
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
                    Conectar Carteira (Simulado)
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Esta é uma simulação. Nenhuma carteira real será conectada neste momento.
                </p>
              </div>
            )}

            {currentStep === 6 && ( // Etapa 6: Fotos
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Adicione fotos da união (opcional).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="photo1" className="text-foreground/90">Foto 1 (Parceiro/a 1 ou União)</Label>
                    <div className="flex items-center space-x-2">
                      {photo1Preview ? (
                        <Image src={photo1Preview} alt="Pré-visualização Foto 1" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="união foto" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="avatar placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo1" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 1)} className="sr-only" disabled={isLoading} />
                      <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80" onClick={() => document.getElementById('photo1')?.click()} disabled={isLoading}>
                        {photo1 ? "Trocar Foto" : "Escolher Foto"}
                      </Button>
                    </div>
                    {photo1 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo1.name}>{photo1.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo2" className="text-foreground/90">Foto 2 (Parceiro/a 2 ou União, Opcional)</Label>
                     <div className="flex items-center space-x-2">
                      {photo2Preview ? (
                        <Image src={photo2Preview} alt="Pré-visualização Foto 2" width={80} height={80} className="rounded-md object-cover aspect-square" data-ai-hint="união foto" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground" data-ai-hint="avatar placeholder">
                          <Camera size={32} />
                        </div>
                      )}
                      <Input id="photo2" type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, 2)} className="sr-only" disabled={isLoading} />
                       <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80" onClick={() => document.getElementById('photo2')?.click()} disabled={isLoading}>
                        {photo2 ? "Trocar Foto" : "Escolher Foto"}
                      </Button>
                    </div>
                    {photo2 && <p className="text-xs text-muted-foreground truncate w-full max-w-[150px] sm:max-w-xs" title={photo2.name}>{photo2.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && ( // Etapa 7: Acordos Iniciais
              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center text-foreground/90"><FileText size={20} className="mr-2 text-primary"/>Acordos Iniciais do Registro</Label>
                <CardDescription className="text-muted-foreground">Defina as cláusulas iniciais do seu registro. Você poderá editá-las depois.</CardDescription>
                
                <div className="space-y-2">
                  <Label htmlFor="clause-text-area" className="text-foreground/90">
                    {editingClause ? 'Editar Cláusula' : 'Nova Cláusula'}
                  </Label>
                  <Textarea
                    id="clause-text-area"
                    value={editingClause ? editingClause.text : newClauseText}
                    onChange={(e) => editingClause ? setEditingClause({...editingClause, text: e.target.value}) : setNewClauseText(e.target.value)}
                    placeholder="Digite o texto da cláusula aqui..."
                    className="min-h-[80px] bg-input text-foreground placeholder:text-muted-foreground"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button type="button" onClick={handleAddOrUpdateClause} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !(editingClause ? editingClause.text.trim() : newClauseText.trim())}>
                      {editingClause ? <><Save size={16} className="mr-2" /> Salvar Alterações</> : <><PlusCircle size={16} className="mr-2" /> Adicionar Cláusula</>}
                    </Button>
                    {editingClause && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="text-foreground/90 border-border hover:bg-muted/80" disabled={isLoading}>
                        Cancelar Edição
                      </Button>
                    )}
                  </div>
                </div>

                {contractClauses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-foreground/80 pt-2">Cláusulas Adicionadas:</h4>
                    <ScrollArea className="h-40 border rounded-md p-3 bg-muted/30">
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

            {currentStep === 8 && ( // Etapa 8: Termos e Condições
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground/90">Termos de Serviço - Ipê Acta</Label>
                <div className="p-4 border border-border rounded-md max-h-40 overflow-y-auto bg-muted/50 text-sm text-muted-foreground">
                  <p className="mb-2">Ao criar um registro no Ipê Acta, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
                  <p className="mb-2"><strong>1. Uso do Serviço:</strong> Você concorda em usar o Ipê Acta apenas para fins legais e de acordo com estes termos. O serviço é fornecido para criação e gestão de registros de união e patrimônio.</p>
                  <p className="mb-2"><strong>2. Conteúdo do Usuário:</strong> Você é responsável por todo o conteúdo que envia. Você concede ao Ipê Acta uma licença para usar esse conteúdo no contexto da prestação do serviço.</p>
                  <p className="mb-2"><strong>3. Natureza do Serviço:</strong> Ipê Acta é uma ferramenta de planejamento e gestão visual. Não fornece aconselhamento legal, financeiro ou contábil. A responsabilidade pela validade e aconselhamento profissional é sua.</p>
                  <p className="mb-2"><strong>4. Privacidade:</strong> Seus dados serão tratados conforme nossa Política de Privacidade.</p>
                  <p><strong>5. Limitação de Responsabilidade:</strong> O Ipê Acta não se responsabiliza por perdas ou danos resultantes do uso do serviço.</p>
                  <p className="mt-2"><strong>6. Conexão de Carteira (Simulada):</strong> A funcionalidade de conexão de carteira é atualmente simulada. Nenhum dado real da sua carteira é acessado ou armazenado.</p>
                  <p className="mt-2"><strong>7. Cláusulas Contratuais:</strong> As cláusulas definidas por você são para seu registro e planejamento. O Ipê Acta não valida ou endossa a legalidade ou aplicabilidade dessas cláusulas.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={acceptedContract} onCheckedChange={(checked) => setAcceptedContract(Boolean(checked))} disabled={isLoading} className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/>
                  <Label htmlFor="terms" className="text-sm font-normal text-foreground/90">
                    Eu li e aceito os Termos de Serviço e a Política de Privacidade do Ipê Acta.
                  </Label>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-between items-center pt-4">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={isLoading} className="text-foreground/90 border-border hover:bg-muted/80">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              ) : (
                <div /> 
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleNextStep} disabled={isLoading}>
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !acceptedContract}>
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
            <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
              <Link href="/login">Acesse aqui</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    

    

  

