
'use client';
import MainLayout from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from 'react';
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
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, set, get, remove, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<User[]>([]);
    const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
    const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
    const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<User | null>(null);
    const [newStudent, setNewStudent] = useState<{name: string, email: string, password: string}>({name: '', email: '', password: ''});
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists() && snapshot.val().role === 'teacher') {
                     const usersRef = ref(db, 'users');
                     const unsubscribeUsers = onValue(usersRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const usersData = snapshot.val();
                            const usersList: User[] = Object.keys(usersData).map(key => ({
                                id: key,
                                ...usersData[key]
                            }));
                            setStudents(usersList.filter(u => u.role === 'student'));
                        }
                        setLoading(false);
                    });
                    
                    return () => {
                        unsubscribeUsers();
                    };
                } else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    const handleOpenAddDialog = () => {
        setNewStudent({ name: '', email: '', password: ''});
        setIsAddStudentDialogOpen(true);
    };

    const handleAddStudent = async () => {
        if(!newStudent.name || !newStudent.email || !newStudent.password) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill in all fields.'
            })
            return;
        }

        try {
            // Note: This creates an auth user but doesn't sign them in.
            const userCredential = await createUserWithEmailAndPassword(auth, newStudent.email, newStudent.password);
            const studentToAdd: Omit<User, 'id'> = {
                name: newStudent.name,
                email: newStudent.email,
                role: 'student',
            }

            await set(ref(db, 'users/' + userCredential.user.uid), studentToAdd);
            
            setIsAddStudentDialogOpen(false);
            toast({
                title: 'Success',
                description: `Student added successfully.`
            })

        } catch (error: any) {
            console.error("Error creating user:", error);
            let description = 'Could not create user.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email address is already in use by another account.';
            } else if (error.message) {
                description = error.message;
            }
             toast({
                variant: 'destructive',
                title: 'Error',
                description
            })
        }
    };

    const handleOpenEditDialog = (student: User) => {
        setCurrentStudent(student);
        setIsEditStudentDialogOpen(true);
    };

    const handleUpdateStudent = async () => {
        if(!currentStudent) return;
        
        try {
            const userToUpdate = {
                name: currentStudent.name,
                email: currentStudent.email,
                role: currentStudent.role,
            };
            await set(ref(db, 'users/' + currentStudent.id), userToUpdate);
            setIsEditStudentDialogOpen(false);
            toast({
                title: 'Success',
                description: 'Student updated successfully.'
            })
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update student.'
            })
        }
    }

    const handleOpenDeleteDialog = (student: User) => {
        setCurrentStudent(student);
        setIsDeleteStudentDialogOpen(true);
    };

    const handleDeleteStudent = async () => {
        if(!currentStudent) return;
        try {
             await remove(ref(db, 'users/' + currentStudent.id));
             setIsDeleteStudentDialogOpen(false);
             toast({
                title: 'Success',
                description: 'Student deleted successfully.'
             })
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete student.'
            })
        }
    }

  if (loading) {
    return (
        <MainLayout userType="teacher">
            <div className="flex items-center justify-center h-full">
                <Skeleton className="h-40 w-full" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout userType="teacher">
      <div className="space-y-8">
        <Card id="students">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                {/* For larger screens */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(student)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleOpenDeleteDialog(student)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {students.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No students found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* For smaller screens */}
                <div className="md:hidden space-y-4">
                    {students.map((student) => (
                        <Card key={student.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 p-4">
                                <Avatar>
                                    <AvatarImage data-ai-hint="profile picture" src={student.avatar || `https://i.pravatar.cc/40?u=${student.id}`} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(student)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleOpenDeleteDialog(student)}><Trash2 className="h-4 w-4" /></Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {students.length === 0 && (
                        <p className="text-center text-muted-foreground pt-4">No students found.</p>
                    )}
                </div>

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
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}/>
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
                            <Input id="edit-email" type="email" value={currentStudent.email} readOnly disabled/>
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
