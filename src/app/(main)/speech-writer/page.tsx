
"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWeddingSpeech, type GenerateWeddingSpeechInput } from '@/ai/flows/generate-wedding-speech';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Copy, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  coupleHistory: z.string().min(50, 'Por favor, forneça mais detalhes sobre sua história (pelo menos 50 caracteres).'),
  memorableMoments: z.string().min(50, 'Compartilhe alguns momentos memoráveis (pelo menos 50 caracteres).'),
  personalAnecdotes: z.string().min(50, 'Inclua algumas anedotas pessoais (pelo menos 50 caracteres).'),
  messageForTheAudience: z.string().min(20, 'Qual mensagem você quer transmitir aos seus convidados? (pelo menos 20 caracteres).'),
});

type SpeechFormValues = z.infer<typeof formSchema>;

export default function SpeechWriterPage() {
  const [generatedSpeech, setGeneratedSpeech] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SpeechFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleHistory: '',
      memorableMoments: '',
      personalAnecdotes: '',
      messageForTheAudience: '',
    },
  });

  async function onSubmit(values: SpeechFormValues) {
    setIsLoading(true);
    setGeneratedSpeech(null);
    try {
      const result = await generateWeddingSpeech(values);
      setGeneratedSpeech(result.speech);
      toast({
        title: 'Discurso Gerado!',
        description: 'Seu discurso de casamento personalizado está pronto.',
      });
    } catch (error) {
      console.error('Erro ao gerar discurso:', error);
      toast({
        title: 'Erro ao Gerar Discurso',
        description: 'Algo deu errado. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (generatedSpeech) {
      navigator.clipboard.writeText(generatedSpeech);
      toast({ title: 'Copiado para a Área de Transferência!', description: 'Discurso copiado com sucesso.' });
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle className="text-3xl font-pacifico flex items-center">
              <Wand2 className="mr-3 h-8 w-8 text-primary" />
              Escritor de Discursos IA
            </CardTitle>
            <CardDescription>
              Conte-nos sobre sua história de amor, e nossa IA ajudará você a criar um lindo discurso de casamento.
              Quanto mais detalhes você fornecer, mais pessoal e emocionante será o discurso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="coupleHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>História do Casal</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Como vocês se conheceram, marcos importantes, sua jornada juntos..." {...field} rows={4} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memorableMoments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Momentos Memoráveis</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Viagens inesquecíveis, incidentes engraçados, ocasiões especiais..." {...field} rows={4} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalAnecdotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anedotas Pessoais</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Histórias que destacam seu relacionamento, piadas internas..." {...field} rows={4} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="messageForTheAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem para os Convidados</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Expresse gratidão, defina o tom para a celebração..." {...field} rows={3} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Gerar Discurso
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="shadow-xl min-h-[calc(100vh-10rem)]">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-pacifico text-primary">Seu Discurso Gerado</CardTitle>
              <CardDescription>Revise e use seu discurso de casamento criado por IA.</CardDescription>
            </div>
            {generatedSpeech && (
               <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!generatedSpeech}>
                 <Copy className="mr-2 h-4 w-4" /> Copiar Discurso
               </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && !generatedSpeech && (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Criando suas palavras perfeitas...</p>
              </div>
            )}
            {!isLoading && !generatedSpeech && (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                 <FileText className="h-12 w-12 mb-4" />
                <p>Seu discurso aparecerá aqui assim que for gerado.</p>
                <p className="text-sm">Preencha o formulário e clique em &quot;Gerar Discurso&quot;.</p>
              </div>
            )}
            {generatedSpeech && (
              <ScrollArea className="h-[calc(100vh-18rem)] p-1 rounded-md border bg-muted/30">
                 <div className="p-4 whitespace-pre-wrap text-foreground/90 leading-relaxed">
                    {generatedSpeech}
                 </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
