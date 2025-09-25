
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [name, setName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [isAdminSetup, setIsAdminSetup] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminExists = async () => {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const adminExists = Object.values(users).some((user: any) => user.role === 'admin');
        setIsAdminSetup(adminExists);
      } else {
        setIsAdminSetup(false);
      }
    };
    checkAdminExists();
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user record in Realtime Database
      const adminUser: Omit<User, 'id'> = {
        name,
        email,
        role: 'admin',
      };
      await set(ref(db, `users/${user.uid}`), adminUser);

      toast({
        title: 'Admin Account Created',
        description: 'You can now log in with the admin credentials.',
      });

      router.push('/login');
    } catch (error: any) {
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. You may already have an admin account.';
      } else if (error.code === 'auth/weak-password') {
        description = 'The password is too weak. It must be at least 6 characters long.';
      }
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAdminSetup === null) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )
  }

  if (isAdminSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Setup Complete</CardTitle>
            <CardDescription>
              An administrator account already exists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>If you need to manage your application, please log in with your administrator credentials.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Account Setup</CardTitle>
          <CardDescription>
            Create the first administrator account for your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSetup} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
