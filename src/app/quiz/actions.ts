
"use server";

import { generatePersonalizedFeedback } from "@/ai/flows/personalized-quiz-feedback";
import type { PersonalizedFeedbackInput } from "@/ai/flows/personalized-quiz-feedback";
import { db } from "@/lib/firebase";
import { ref, set, get, child } from "firebase/database";
import { auth } from "@/lib/firebase";

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


export async function saveQuizResult(userId: string, quizId: string, score: number) {
    try {
        const marksRef = ref(db, `users/${userId}/marks/${quizId}`);
        await set(marksRef, score);
        return { success: true };
    } catch(error) {
        console.error("Error saving quiz result:", error);
        return { success: false, error: "Failed to save your score." };
    }
}
