
'use client';
import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";
import { Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if(user) {
            const userRecord = await get(child(ref(db), `users/${user.uid}`));
            if (userRecord.exists() && userRecord.val().role === 'student') {
                setLoading(false);
                setAuthChecked(true);
            } else {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    });

    return () => unsubscribe();
  }, [router]);
  
  if (!authChecked || loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
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
