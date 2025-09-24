
'use client';
import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import type { Quiz, User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const userRef = ref(db, `users/${currentUser.uid}`);
                const quizzesRef = ref(db, 'quizzes');

                get(userRef).then(snapshot => {
                    if (snapshot.exists() && snapshot.val().role === 'teacher') {
                        setUser({id: currentUser.uid, ...snapshot.val()});
                        const unsubscribeQuizzes = onValue(quizzesRef, (snapshot) => {
                            if (snapshot.exists()) {
                                const quizzesData = snapshot.val();
                                const quizzesList: Quiz[] = Object.keys(quizzesData).map(key => ({
                                    id: key,
                                    ...quizzesData[key],
                                    questions: quizzesData[key].questions || []
                                }));
                                setQuizzes(quizzesList);
                            }
                            setLoading(false);
                        });

                         return () => unsubscribeQuizzes();
                    } else {
                        router.push('/login');
                    }
                });

            } else {
                router.push('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

  if (loading) {
    return (
        <MainLayout userType="teacher">
            <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-40 w-full" />
            </div>
        </MainLayout>
    );
  }
  
  const myQuizzes = quizzes.filter(quiz => quiz.authorId === user?.id);

  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Your Quizzes</CardTitle>
                    <CardDescription>A list of all the quizzes you have created.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/teacher/quizzes/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Quiz
                    </Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/teacher/quizzes/${quiz.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {myQuizzes.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No quizzes found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
