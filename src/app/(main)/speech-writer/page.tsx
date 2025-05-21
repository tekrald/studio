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
import { Loader2, Sparkles, Wand2, Copy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  coupleHistory: z.string().min(50, 'Please provide more details about your history (at least 50 characters).'),
  memorableMoments: z.string().min(50, 'Share some memorable moments (at least 50 characters).'),
  personalAnecdotes: z.string().min(50, 'Include a few personal anecdotes (at least 50 characters).'),
  messageForTheAudience: z.string().min(20, 'What message do you want to convey to your guests? (at least 20 characters).'),
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
        title: 'Speech Generated!',
        description: 'Your personalized wedding speech is ready.',
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: 'Error Generating Speech',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (generatedSpeech) {
      navigator.clipboard.writeText(generatedSpeech);
      toast({ title: 'Copied to Clipboard!', description: 'Speech copied successfully.' });
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle className="text-3xl font-pacifico flex items-center">
              <Wand2 className="mr-3 h-8 w-8 text-primary" />
              AI Speechwriter
            </CardTitle>
            <CardDescription>
              Tell us about your love story, and our AI will help you craft a beautiful wedding speech.
              The more details you provide, the more personal and heartfelt the speech will be.
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
                      <FormLabel>Couple&apos;s History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="How you met, key milestones, your journey together..." {...field} rows={4} disabled={isLoading} />
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
                      <FormLabel>Memorable Moments</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Unforgettable trips, funny incidents, special occasions..." {...field} rows={4} disabled={isLoading} />
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
                      <FormLabel>Personal Anecdotes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Stories that highlight your relationship, inside jokes..." {...field} rows={4} disabled={isLoading} />
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
                      <FormLabel>Message for the Audience</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Express gratitude, set the tone for celebration..." {...field} rows={3} disabled={isLoading} />
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
                  Generate Speech
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
              <CardTitle className="text-3xl font-pacifico text-primary">Your Generated Speech</CardTitle>
              <CardDescription>Review and use your AI-crafted wedding speech.</CardDescription>
            </div>
            {generatedSpeech && (
               <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!generatedSpeech}>
                 <Copy className="mr-2 h-4 w-4" /> Copy Speech
               </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && !generatedSpeech && (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Crafting your perfect words...</p>
              </div>
            )}
            {!isLoading && !generatedSpeech && (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                 <FileText className="h-12 w-12 mb-4" />
                <p>Your speech will appear here once generated.</p>
                <p className="text-sm">Fill out the form and click &quot;Generate Speech&quot;.</p>
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
