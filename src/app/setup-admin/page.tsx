
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
import { ref, set, get, child } from 'firebase/database';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [name, setName] = useState('Admin User');
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const users = snapshot.val();
          const hasAdmin = Object.values(users).some((user: any) => user.role === 'admin');
          setAdminExists(hasAdmin);
        } else {
          setAdminExists(false);
        }
      } catch (error) {
        console.error("Error checking for admin:", error);
        // Fail safe: assume admin exists to prevent creating multiple admins
        setAdminExists(true);
      } finally {
        setLoading(false);
      }
    };
    checkAdminExists();
  }, []);

  const handleCreateAdmin = async () => {
    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      const adminData = {
        name: name,
        email: email,
        role: 'admin',
      };
      
      await set(ref(db, `users/${userId}`), adminData);

      toast({
        title: 'Admin Account Created!',
        description: 'You can now log in with the admin credentials.',
      });
      router.push('/login');

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      let description = 'Could not create admin user.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. You can proceed to login.';
      }
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description,
      });
    } finally {
        setLoading(false);
    }
  };
  
  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <p>Loading...</p>
          </div>
      )
  }

  if (adminExists) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Setup Complete</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="default">
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>Admin already exists</AlertTitle>
                        <AlertDescription>
                            An administrator account has already been configured.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Account Setup</CardTitle>
          <CardDescription>
            Create the first administrator account for QuizWhiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleCreateAdmin} disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
