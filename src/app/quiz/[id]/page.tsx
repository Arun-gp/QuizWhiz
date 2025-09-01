
'use client';
import { useEffect, useState } from "react";
import { quizzes } from "@/lib/data";
import QuizView from "@/components/quiz-view";
import MainLayout from "@/components/main-layout";
import { notFound, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";
import type { Quiz } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      const quizRef = ref(db, `quizzes/${quizId}`);
      const snapshot = await get(quizRef);
      if (snapshot.exists()) {
        const quizData = snapshot.val();
        setQuiz({ id: quizId, ...quizData, questions: quizData.questions || [] });
      } else {
        setQuiz(null);
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [quizId]);


  if (loading) {
     return (
        <MainLayout>
            <div className="w-full max-w-3xl mx-auto space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full my-6" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full mt-6" />
            </div>
        </MainLayout>
     )
  }

  if (!quiz) {
    return notFound();
  }

  return (
    <MainLayout>
      <QuizView quiz={quiz} />
    </MainLayout>
  );
}
