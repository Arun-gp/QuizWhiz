
'use client';
import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if(user) {
            const userRecord = await get(child(ref(db), `users/${user.uid}`));
            if (userRecord.exists() && userRecord.val().role === 'student') {
                setIsAuthenticated(true);
            } else if (user.email === 'student@gmail.com') { // Fallback for demo user
                setIsAuthenticated(true);
            } else {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  if (loading || !isAuthenticated) {
    return (
        <MainLayout userType="student">
            <div className="flex items-center justify-center h-full">
                <Skeleton className="h-40 w-full" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout userType="student">
        <div className="space-y-8">
            <Dashboard />
        </div>
    </MainLayout>
  );
}
