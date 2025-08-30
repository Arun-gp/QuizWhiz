"use server";

import { generatePersonalizedFeedback } from "@/ai/flows/personalized-quiz-feedback";
import type { PersonalizedFeedbackInput } from "@/ai/flows/personalized-quiz-feedback";

export async function getAIFeedback(input: PersonalizedFeedbackInput) {
  try {
    const result = await generatePersonalizedFeedback(input);
    return { success: true, feedback: result.feedback };
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    return {
      success: false,
      error: "Failed to generate AI feedback. Please try again later.",
    };
  }
}
