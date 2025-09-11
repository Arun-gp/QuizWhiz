
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { useRouter } from "next/navigation";
import type { User, Quiz } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = { id: currentUser.uid, ...snapshot.val() };
            setUser(userData);
            setName(userData.name);
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

  const handleSaveChanges = async () => {
    if (!user) return;

    // Update name
    if (name !== user.name) {
        const userRef = ref(db, `users/${user.id}`);
        await update(userRef, { name: name });
        toast({ title: "Success", description: "Your name has been updated." });
    }

    // Update password
    if (password) {
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
            return;
        }
        if (password.length < 6) {
            toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters long." });
            return;
        }
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await updatePassword(currentUser, password);
                toast({ title: "Success", description: "Your password has been changed." });
                setPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error("Password update error:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update password. You may need to log out and log back in." });
        }
    }

    setIsEditing(false);
  }

  const handleCancel = () => {
    if(user) setName(user.name);
    setPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  }


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
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage data-ai-hint="profile picture" src={user.avatar || `https://i.pravatar.cc/64?u=${user.id}`} />
                        <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">{isEditing ? "Edit Profile" : user.name}</CardTitle>
                        <CardDescription className="text-base">{user.email}</CardDescription>
                    </div>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </CardHeader>
            {isEditing && (
                <>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </div>
                </CardContent>
                <CardFooter className="gap-2 justify-end">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
                </>
            )}
        </Card>
        
        {user.role === 'student' && !isEditing && (
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
