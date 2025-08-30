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
} from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MainLayoutProps {
  children: React.ReactNode;
  userType?: "student" | "teacher";
}

export default function MainLayout({
  children,
  userType = "student",
}: MainLayoutProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const isStudent = userType === "student";
  const user = isStudent ? { name: "Student User", home: "/student/dashboard", quizzes: "/student/dashboard" } : { name: "Teacher Admin", home: "/teacher/dashboard", quizzes: "/teacher/dashboard" };


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
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${userType}`} />
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
                  <UserCircle />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
