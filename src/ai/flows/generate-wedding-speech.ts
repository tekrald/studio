// 'use server'
'use server';
/**
 * @fileOverview AI-powered tool that helps generate a wedding speech based on key details provided by the couple.
 *
 * - generateWeddingSpeech - A function that handles the wedding speech generation process.
 * - GenerateWeddingSpeechInput - The input type for the generateWeddingSpeech function.
 * - GenerateWeddingSpeechOutput - The return type for the generateWeddingSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeddingSpeechInputSchema = z.object({
  coupleHistory: z
    .string()
    .describe('A detailed history of the couple, including how they met and key milestones in their relationship.'),
  memorableMoments: z
    .string()
    .describe('Description of memorable moments the couple has shared.'),
  personalAnecdotes: z
    .string()
    .describe('Personal anecdotes and stories that highlight the couple’s relationship.'),
  messageForTheAudience: z
    .string()
    .describe('A message for the audience expressing gratitude and setting the tone for the celebration.'),
});
export type GenerateWeddingSpeechInput = z.infer<typeof GenerateWeddingSpeechInputSchema>;

const GenerateWeddingSpeechOutputSchema = z.object({
  speech: z.string().describe('The generated wedding speech.'),
});
export type GenerateWeddingSpeechOutput = z.infer<typeof GenerateWeddingSpeechOutputSchema>;

export async function generateWeddingSpeech(input: GenerateWeddingSpeechInput): Promise<GenerateWeddingSpeechOutput> {
  return generateWeddingSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeddingSpeechPrompt',
  input: {schema: GenerateWeddingSpeechInputSchema},
  output: {schema: GenerateWeddingSpeechOutputSchema},
  prompt: `You are a professional wedding speech writer.

  Based on the information provided by the couple, write a personalized and heartfelt wedding speech.
  Ensure the speech includes elements of humor, emotion, and gratitude.

  Couple History: {{{coupleHistory}}}
  Memorable Moments: {{{memorableMoments}}}
  Personal Anecdotes: {{{personalAnecdotes}}}
  Message for the Audience: {{{messageForTheAudience}}}
  `,
});

const generateWeddingSpeechFlow = ai.defineFlow(
  {
    name: 'generateWeddingSpeechFlow',
    inputSchema: GenerateWeddingSpeechInputSchema,
    outputSchema: GenerateWeddingSpeechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
