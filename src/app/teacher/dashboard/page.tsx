
'use client';
import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import type { Quiz } from '@/lib/types';
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
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const unsubscribeUser = onValue(userRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserName(snapshot.val().name);
                    }
                    setLoading(false);
                });
                return () => unsubscribeUser();
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
                <Skeleton className="h-6 w-1/2" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName || 'Teacher'}!</h1>
                <p className="text-muted-foreground">
                    Manage your quizzes and students using the sidebar.
                </p>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
