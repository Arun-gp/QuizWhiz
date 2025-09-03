
'use client';
import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { User } from '@/lib/types';
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


export default function StudentDashboardPage() {
  const [student, setStudent] = useState<User | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            onValue(userRef, (snapshot) => {
                if(snapshot.exists()){
                    setStudent({id: user.uid, ...snapshot.val()});
                }
                setLoading(false);
            })
        } else {
            router.push('/login');
        }
    });

    return () => unsubscribe();
  }, [router]);
  
  if (loading) {
    return (
        <MainLayout userType="student">
            <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-40 w-full" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout userType="student">
        <div className="space-y-8">
            <Dashboard />
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
                            {student?.marks && Object.entries(student.marks).map(([quizId, score]) => (
                                <TableRow key={quizId}>
                                    <TableCell>Quiz {quizId}</TableCell>
                                    <TableCell className="text-right">{score}%</TableCell>
                                </TableRow>
                            ))}
                             {!student?.marks && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No marks yet.</TableCell>
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
