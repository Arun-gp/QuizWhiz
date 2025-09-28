
'use server';
/**
 * @fileOverview An AI flow for generating quiz questions.
 *
 * - generateQuestions - A function that handles the quiz question generation process.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz questions.'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;


const QuestionSchema = z.object({
    question: z.string().describe("The text of the question."),
    options: z.array(z.string()).describe("An array of 4 possible answers."),
    answer: z.string().describe("The correct answer from the options."),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of 5 generated quiz questions.'),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;


export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `You are an expert quiz creator. Generate 5 multiple-choice questions about the topic: {{{topic}}}. Each question must have 4 options and 1 correct answer.`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate questions.');
    }
    return output;
  }
);
