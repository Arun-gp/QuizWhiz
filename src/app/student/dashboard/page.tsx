
'use client';
import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
            setLoading(false);
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
        </div>
    </MainLayout>
  );
}
