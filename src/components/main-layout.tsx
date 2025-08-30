
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";


interface MainLayoutProps {
  children: React.ReactNode;
  userType?: "student" | "teacher";
}

export default function MainLayout({
  children,
  userType = "student",
}: MainLayoutProps) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const isActive = (path: string) => pathname === path;
  
  const isStudent = userType === "student";
  const user = isStudent ? { name: "Student User", home: "/student/dashboard", quizzes: "/student/dashboard" } : { name: "Teacher Admin", home: "/teacher/dashboard", quizzes: "/teacher/dashboard" };
  
  const handleChangePicture = () => {
    // In a real app, this would open a file dialog to upload a new picture.
    // For this prototype, we'll just show a toast notification.
    toast({
        title: "Feature not implemented",
        description: "You'll be able to change your profile picture soon!",
    });
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(user.home)}
                  tooltip="Dashboard"
                >
                  <Link href={user.home}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/quiz") || pathname.startsWith("/teacher/quizzes")}
                  tooltip="Quizzes"
                >
                  <Link href={user.quizzes}>
                    <FileText />
                    <span>Quizzes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isStudent && (
                 <SidebarMenuItem>
                    <SidebarMenuButton
                    asChild
                    isActive={isActive("/leaderboard")}
                    tooltip="Leaderboard"
                    >
                    <Link href="/leaderboard">
                        <Trophy />
                        <span>Leaderboard</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage data-ai-hint="profile picture" src={`https://i.pravatar.cc/40?u=${userType}`} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{user.name}</span>
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
                        <AvatarImage data-ai-hint="profile picture" src={`https://i.pravatar.cc/40?u=${userType}`} />
                        <AvatarFallback>
                            <UserCircle />
                        </AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChangePicture}>
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
                <DropdownMenuItem asChild>
                    <Link href="/">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
