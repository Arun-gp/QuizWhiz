
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Trophy,
  UserCircle,
  Menu,
  Users,
  Moon,
  Sun,
  Image as ImageIcon,
  LogOut,
  UserCog,
  Sparkles,
  Loader2,
  BadgePercent
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import type { User } from "@/lib/types";


interface MainLayoutProps {
  children: React.ReactNode;
  userType?: "student" | "teacher" | "admin";
}

export default function MainLayout({
  children,
  userType = "student",
}: MainLayoutProps) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setCurrentUser({id: user.uid, ...snapshot.val()});
                }
            });
        }
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));
  
  const userConfig = {
      student: { name: "Student User", home: "/student/dashboard", quizzes: "/student/dashboard", myMarks: "/student/my-marks" },
      teacher: { name: "Teacher Admin", home: "/teacher/dashboard", quizzes: "/teacher/quizzes", students: "/teacher/students" },
      admin: { name: "Admin", home: "/admin/dashboard", accounts: "/admin/dashboard" }
  }

  const user = userConfig[userType];
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  }

  const handleSaveAvatar = async () => {
    if (!newAvatarPreview || !currentUser) return;

    try {
        const userRef = ref(db, `users/${currentUser.id}`);
        await update(userRef, { avatar: newAvatarPreview });
        toast({
            title: 'Avatar updated!',
            description: 'Your new profile picture has been saved.',
        });
        setIsAvatarDialogOpen(false);
        setNewAvatarPreview(null);
        setAvatarFile(null);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Failed to save avatar',
            description: 'Could not save your new avatar. Please try again.',
        });
    }
  }

  const getMenuItems = () => {
    switch (userType) {
        case "admin":
            return (
                <>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive(user.home)} tooltip="Dashboard">
                            <Link href={user.home}><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )
        case "teacher":
            return (
                <>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === user.home} tooltip="Dashboard">
                          <Link href={user.home}><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive(user.quizzes)} tooltip="Quizzes">
                            <Link href={user.quizzes}><FileText /><span>Quizzes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive(user.students || '')} tooltip="Students">
                            <Link href={user.students || ''}><Users /><span>Students</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )
        default: // student
            return (
                <>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive(user.home)} tooltip="Dashboard">
                            <Link href={user.home}><LayoutDashboard /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive(user.myMarks)} tooltip="My Marks">
                            <Link href={user.myMarks}><BadgePercent /><span>My Marks</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive("/leaderboard")} tooltip="Leaderboard">
                            <Link href="/leaderboard"><Trophy /><span>Leaderboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )
    }
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                Q
              </div>
              <h1 className="text-xl font-semibold">QuizWhiz</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {getMenuItems()}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage data-ai-hint="profile picture" src={currentUser?.avatar || `https://i.pravatar.cc/40?u=${currentUser?.id}`} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{currentUser?.name || user.name}</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b lg:justify-end">
            <SidebarTrigger className="lg:hidden" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarImage data-ai-hint="profile picture" src={currentUser?.avatar || `https://i.pravatar.cc/40?u=${currentUser?.id}`} />
                        <AvatarFallback>
                            <UserCircle />
                        </AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAvatarDialogOpen(true)}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change Picture
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="ml-2">Toggle theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>

       <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Change Profile Picture</DialogTitle>
                <DialogDescription>
                    Upload an image to set as your new profile picture.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="avatar-file">Upload Image</Label>
                    <Input id="avatar-file" type="file" accept="image/*" onChange={handleAvatarFileChange} />
                </div>
                {newAvatarPreview && (
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="flex justify-center">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={newAvatarPreview} alt="New Avatar Preview" />
                                <AvatarFallback>P</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAvatar} disabled={!newAvatarPreview}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
