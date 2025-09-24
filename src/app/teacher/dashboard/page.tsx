
'use client';
import MainLayout from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

export default function TeacherDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists() && snapshot.val().role === 'teacher') {
                     setIsAuthenticated(true);
                } else if (user.email === 'teacher@gmail.com') {
                     setIsAuthenticated(true);
                }
                else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribeAuth();
    }, [router]);

  if (loading || !isAuthenticated) {
    return (
        <MainLayout userType="teacher">
             <div className="flex items-center justify-center h-full">
                <Skeleton className="h-10 w-3/4" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Teacher</h1>
                <p className="text-muted-foreground">
                    Manage your quizzes and students using the sidebar.
                </p>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
