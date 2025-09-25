
'use client';
import MainLayout from "@/components/main-layout";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

export default function TeacherDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists() && snapshot.val().role === 'teacher') {
                     setLoading(false);
                }
                else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
         <Loader2 className="h-10 w-10 animate-spin" />
      </div>
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
