
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to QuizWhiz</h1>
            <p className="text-balance text-muted-foreground">
              Select your role to login
            </p>
          </div>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Login</CardTitle>
                        <CardDescription>Access your dashboard to take quizzes and view your progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild className="w-full">
                            <Link href="/student/login">Proceed to Student Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="teacher">
                 <Card>
                    <CardHeader>
                        <CardTitle>Teacher Login</CardTitle>
                        <CardDescription>Manage your quizzes, and track student performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/teacher/login">Proceed to Teacher Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="admin">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                        <CardDescription>Manage users and system settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/admin/login">Proceed to Admin Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="library books"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
