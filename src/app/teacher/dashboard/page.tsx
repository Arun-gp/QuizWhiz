
'use client';
import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { quizzes as initialQuizzes, users as initialUsers } from "@/lib/data";
import type { User, Quiz } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";


export default function TeacherDashboardPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
    const [students, setStudents] = useState<User[]>(initialUsers.filter(u => u.role === 'student'));
    const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
    const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
    const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<User | null>(null);
    const [newStudent, setNewStudent] = useState<{name: string, email: string}>({name: '', email: ''});
    const { toast } = useToast();

    const handleOpenAddDialog = () => {
        setNewStudent({ name: '', email: ''});
        setIsAddStudentDialogOpen(true);
    };

    const handleAddStudent = () => {
        if(!newStudent.name || !newStudent.email) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill in all fields.'
            })
            return;
        }
        const studentToAdd: User = {
            id: `user-${Date.now()}`,
            ...newStudent,
            role: 'student',
        }
        setStudents([...students, studentToAdd]);
        setIsAddStudentDialogOpen(false);
        toast({
            title: 'Success',
            description: `Student added successfully.`
        })
    };

    const handleOpenEditDialog = (student: User) => {
        setCurrentStudent(student);
        setIsEditStudentDialogOpen(true);
    };

    const handleUpdateStudent = () => {
        if(!currentStudent) return;
        setStudents(students.map(s => s.id === currentStudent.id ? currentStudent : s));
        setIsEditStudentDialogOpen(false);
        toast({
            title: 'Success',
            description: 'Student updated successfully.'
        })
    }

    const handleOpenDeleteDialog = (student: User) => {
        setCurrentStudent(student);
        setIsDeleteStudentDialogOpen(true);
    };

    const handleDeleteStudent = () => {
        if(!currentStudent) return;
        setStudents(students.filter(s => s.id !== currentStudent.id));
        setIsDeleteStudentDialogOpen(false);
        toast({
            title: 'Success',
            description: 'Student deleted successfully.'
        })
    }

  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, Teacher!</h1>
                <p className="text-muted-foreground">
                    Manage your quizzes and students here.
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

        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Your Students</CardTitle>
                        <CardDescription>A list of all your students.</CardDescription>
                    </div>
                    <Button onClick={handleOpenAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Average Mark</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.marks ? (Object.values(student.marks).reduce((a, b) => a + b, 0) / Object.values(student.marks).length).toFixed(2) : 'N/A'}%</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(student)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleOpenDeleteDialog(student)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       {/* Add/Edit/Delete Dialogs */}
       <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddStudent}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>
                {currentStudent && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" value={currentStudent.name} onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" type="email" value={currentStudent.email} onChange={(e) => setCurrentStudent({...currentStudent, email: e.target.value})}/>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditStudentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStudent}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isDeleteStudentDialogOpen} onOpenChange={setIsDeleteStudentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Student</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {currentStudent?.name}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteStudentDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </MainLayout>
  );
}
