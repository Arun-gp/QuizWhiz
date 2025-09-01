
'use client';
import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";
import { users } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function StudentDashboardPage() {
  const student = users.find(u => u.email === "student@gmail.com");

  return (
    <MainLayout userType="student">
        <div className="space-y-8">
            <Dashboard />
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
                            {student?.marks && Object.entries(student.marks).map(([quizId, score]) => (
                                <TableRow key={quizId}>
                                    <TableCell>Quiz {quizId}</TableCell>
                                    <TableCell className="text-right">{score}%</TableCell>
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
