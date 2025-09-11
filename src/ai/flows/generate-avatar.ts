
'use server';

/**
 * @fileOverview Generates a new avatar image based on a user-provided image and a style prompt.
 *
 * - generateAvatar - A function that handles the avatar generation process.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "The user's uploaded photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .describe(
      'A creative prompt describing the desired style or theme for the new avatar (e.g., "pixel art style", "watercolor painting", "cosmic space theme").'
    ),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "The newly generated avatar image, as a data URI (e.g., 'data:image/png;base64,...')."
    ),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async ({photoDataUri, prompt}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: photoDataUri}},
        {text: `Generate a new avatar based on this image, in the style of: ${prompt}. The output must be a square avatar.`},
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a valid data URI.');
    }

    return {
      avatarDataUri: media.url,
    };
  }
);
