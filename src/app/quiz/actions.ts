
"use server";

import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

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
