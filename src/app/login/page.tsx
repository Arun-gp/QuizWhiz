
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "@/lib/types";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRecord = await get(child(ref(db), `users/${userCredential.user.uid}`));
      
      if (userRecord.exists()) {
        const user = userRecord.val() as User;
        switch (user.role) {
            case 'admin':
                router.push('/admin/dashboard');
                break;
            case 'teacher':
                router.push('/teacher/dashboard');
                break;
            case 'student':
                router.push('/student/dashboard');
                break;
            default:
                // This case should ideally not be reached if roles are always set.
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "User role is not defined.",
                });
                router.push('/login'); 
                break;
        }
      } else {
        // This case might happen if a user is in Auth but not in the DB.
        // Or if the demo users are not yet in the DB.
        // For this app, we'll treat them as a student by default if not in DB.
        if (email === 'student@gmail.com') {
             router.push('/student/dashboard');
        } else if (email === 'teacher@gmail.com') {
             router.push('/teacher/dashboard');
        } else if (email === 'admin@gmail.com') {
             router.push('/admin/dashboard');
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "User data not found in the database.",
             });
        }
      }

    } catch (error) {
      console.error("Firebase authentication error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your email and password and try again.",
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-10"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 transform text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
