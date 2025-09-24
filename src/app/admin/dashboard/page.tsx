
'use client';
import MainLayout from "@/components/main-layout";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = ref(db, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists() && snapshot.val().role === 'admin') {
                    setUser({ id: currentUser.uid, ...snapshot.val() });
                    
                    const allUsersRef = ref(db, 'users');
                    const allUsersSnapshot = await get(allUsersRef);
                    if(allUsersSnapshot.exists()) {
                        const usersData = allUsersSnapshot.val();
                        const usersList: User[] = Object.keys(usersData).map(key => ({
                            id: key,
                            ...usersData[key]
                        }));
                        setAllUsers(usersList);
                    }
                    setLoading(false);
                } else {
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
    <MainLayout userType="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Admin</h1>
                <p className="text-muted-foreground">
                    Here's an overview of all users in the system.
                </p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="capitalize">{user.role}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
