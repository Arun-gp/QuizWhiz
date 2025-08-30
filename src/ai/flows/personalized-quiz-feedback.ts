'use server';

/**
 * @fileOverview Provides personalized feedback to students based on their quiz performance.
 *
 * - generatePersonalizedFeedback - A function that generates personalized feedback for a student's quiz.
 * - PersonalizedFeedbackInput - The input type for the generatePersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the generatePersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  quizName: z.string().describe('The name of the quiz.'),
  score: z.number().describe('The student\u2019s score on the quiz.'),
  correctAnswers: z
    .array(z.string())
    .describe('The list of correctly answered questions.'),
  incorrectAnswers: z
    .array(z.string())
    .describe('The list of incorrectly answered questions.'),
  feedbackRequest: z
    .string()
    .describe(
      'Optional: Specific areas the student wants feedback on (leave blank for general feedback).'
    ),
});
export type PersonalizedFeedbackInput = z.infer<
  typeof PersonalizedFeedbackInputSchema
>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback for the student.'),
});
export type PersonalizedFeedbackOutput = z.infer<
  typeof PersonalizedFeedbackOutputSchema
>;

export async function generatePersonalizedFeedback(
  input: PersonalizedFeedbackInput
): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are an expert educator providing personalized feedback to students on their quiz performance.

  Student Name: {{studentName}}
  Quiz Name: {{quizName}}
  Score: {{score}}
  Correct Answers: {{#each correctAnswers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Incorrect Answers: {{#each incorrectAnswers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Specific Feedback Request: {{feedbackRequest}}

  Based on the student's performance, provide constructive and specific feedback. Focus on areas where the student can improve and offer actionable suggestions. Be encouraging and supportive.
  Given the quiz score, encourage the student and provide feedback.
  If the student had any incorrect answers, ensure the student understands those answers.
  Do not include a greeting or introduction. Jump straight into the feedback.
  End the feedback with an encouraging statement.
  Format the feedback in markdown.
  `,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
