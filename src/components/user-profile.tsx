
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import type { User, Quiz } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser({ id: currentUser.uid, ...snapshot.val() });
          } else {
             setUser(null);
          }

          const quizzesRef = ref(db, 'quizzes');
          onValue(quizzesRef, (quizSnapshot) => {
            if (quizSnapshot.exists()) {
              const quizzesData = quizSnapshot.val();
              const quizzesMap: Record<string, Quiz> = {};
              Object.keys(quizzesData).forEach(key => {
                quizzesMap[key] = {
                  id: key,
                  ...quizzesData[key],
                  questions: quizzesData[key].questions || []
                };
              });
              setQuizzes(quizzesMap);
            }
            setLoading(false);
          });
        });
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                </div>
            </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <p>User not found.</p>;
  }

  const userInitial = user.name ? user.name.charAt(0) : 'U';

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage data-ai-hint="profile picture" src={user.avatar || `https://i.pravatar.cc/64?u=${user.id}`} />
                    <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl">{user.name}</CardTitle>
                    <CardDescription className="text-base">{user.email}</CardDescription>
                </div>
            </CardHeader>
        </Card>
        
        {user.role === 'student' && (
            <Card>
                <CardHeader>
                    <CardTitle>My Marks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quiz</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {user.marks && Object.entries(user.marks).length > 0 ? (
                                Object.entries(user.marks).map(([quizId, score]) => {
                                    const quiz = quizzes[quizId];
                                    if (!quiz) return null;
                                    const totalQuestions = quiz.questions.length;
                                    return (
                                        <TableRow key={quizId}>
                                            <TableCell>{quiz.title}</TableCell>
                                            <TableCell className="text-right">{score} / {totalQuestions}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">You haven't completed any quizzes yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
