
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressChart from "./progress-chart";
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart />
        </CardContent>
      </Card>
    </div>
  );
}
