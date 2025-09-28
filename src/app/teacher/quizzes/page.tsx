
'use client';
import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, get, remove } from "firebase/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function TeacherQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
    const { toast } = useToast();

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
                            } else {
                                setQuizzes([]);
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

    const openDeleteDialog = (quiz: Quiz) => {
        setQuizToDelete(quiz);
        setIsDeleteDialogOpen(true);
    }

    const handleDeleteQuiz = async () => {
        if (!quizToDelete) return;

        try {
            await remove(ref(db, `quizzes/${quizToDelete.id}`));

            // Also remove marks for this quiz from all students
            const usersRef = ref(db, 'users');
            get(usersRef).then(snapshot => {
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    Object.keys(users).forEach(userId => {
                        if (users[userId].marks && users[userId].marks[quizToDelete.id]) {
                            remove(ref(db, `users/${userId}/marks/${quizToDelete.id}`));
                        }
                    });
                }
            });
            
            toast({
                title: 'Success',
                description: 'Quiz deleted successfully.'
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the quiz.'
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setQuizToDelete(null);
        }
    }


  if (loading) {
    return (
        <MainLayout userType="teacher">
             <div className="flex items-center justify-center h-full">
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/teacher/quizzes/${quiz.id}`}>Edit</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(quiz)}>
                        <Trash2 className="h-4 w-4" />
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Quiz</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the quiz "{quizToDelete?.title}"? This will also remove all student marks associated with it. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteQuiz}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </MainLayout>
  );
}
