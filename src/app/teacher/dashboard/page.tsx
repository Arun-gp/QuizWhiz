import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { quizzes } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboardPage() {
  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Teacher!</h1>
                <p className="text-muted-foreground">
                    Manage your quizzes and questions here.
                </p>
            </div>
            <Button asChild>
                <Link href="/teacher/quizzes/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Quiz
                </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Quizzes</CardTitle>
            <CardDescription>A list of all the quizzes you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>{quiz.duration} min</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/teacher/quizzes/${quiz.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
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
