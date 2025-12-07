
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizCard from "./quiz-card";
import { useEffect, useState } from "react";
import { Quiz } from "@/lib/types";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const quizzesRef = ref(db, 'quizzes');
    const unsubscribe = onValue(quizzesRef, (snapshot) => {
        if(snapshot.exists()){
            const quizzesData = snapshot.val();
            const quizzesList: Quiz[] = Object.keys(quizzesData).map(key => ({
                id: key,
                ...quizzesData[key],
                 questions: quizzesData[key].questions || []
            }));
            setQuizzes(quizzesList);
        } else {
            setQuizzes([]);
        }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Student!</h1>
        <p className="text-muted-foreground">
          Ready to test your knowledge? Choose a quiz to get started.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
             {quizzes.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No quizzes are available at the moment.
                </div>
             )}
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
