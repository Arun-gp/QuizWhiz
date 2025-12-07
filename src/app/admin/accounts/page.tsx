
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

type UserRole = 'student' | 'teacher';

export default function AdminAccountsPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'delete'>('add');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<{name: string, email: string, password: string}>({name: '', email: '', password: ''});
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>('teacher');
    
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(db, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists() && snapshot.val().role === 'admin') {
                     const usersRef = ref(db, 'users');
                     const unsubscribeUsers = onValue(usersRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const usersData = snapshot.val();
                            const usersList: User[] = Object.keys(usersData).map(key => {
                                const marks = usersData[key].marks || {};
                                const totalScore = Object.values(marks).reduce((acc: number, mark) => acc + (mark as number), 0);
                                return {
                                    id: key,
                                    ...usersData[key],
                                    totalScore,
                                }
                            });
                            setAllUsers(usersList);
                        }
                        setLoading(false);
                    });
                    
                    return () => unsubscribeUsers();
                } else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    const handleOpenDialog = (mode: 'add' | 'edit' | 'delete', role: UserRole, user: User | null = null) => {
        setDialogMode(mode);
        setCurrentUserRole(role);
        setCurrentUser(user);
        if (mode === 'add') {
            setNewUser({ name: '', email: '', password: ''});
        }
        setIsDialogOpen(true);
    };

    const handleDialogSubmit = async () => {
        if (dialogMode === 'add') await handleAddUser();
        if (dialogMode === 'edit') await handleUpdateUser();
        if (dialogMode === 'delete') await handleDeleteUser();
    };

    const handleAddUser = async () => {
        if(!newUser.name || !newUser.email || !newUser.password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const userToAdd: Omit<User, 'id'> = {
                name: newUser.name,
                email: newUser.email,
                role: currentUserRole,
            }

            await set(ref(db, 'users/' + userCredential.user.uid), userToAdd);
            
            setIsDialogOpen(false);
            toast({ title: 'Success', description: `${currentUserRole} added successfully.` });

        } catch (error: any) {
            console.error("Error creating user:", error);
            let description = 'Could not create user.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email address is already in use by another account.';
            } else if (error.code === 'auth/weak-password') {
                description = 'Password should be at least 6 characters.';
            }
             toast({ variant: 'destructive', title: 'Error', description });
        }
    };

    const handleUpdateUser = async () => {
        if(!currentUser) return;
        
        try {
            const userToUpdate = {
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role,
            };
            await set(ref(db, 'users/' + currentUser.id), userToUpdate);
            setIsDialogOpen(false);
            toast({ title: 'Success', description: 'User updated successfully.' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user.' });
        }
    }

    const handleDeleteUser = async () => {
        if(!currentUser) return;
        try {
             await remove(ref(db, 'users/' + currentUser.id));
             setIsDialogOpen(false);
             toast({ title: 'Success', description: 'User deleted successfully.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete user data.' });
        }
    }

    const renderDialogContent = () => {
        const roleName = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);
        if (dialogMode === 'delete') {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>Delete {roleName}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {currentUser?.name}? This will remove their data from the database but not their authentication record. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDialogSubmit}>Delete</Button>
                    </DialogFooter>
                </>
            );
        }

        return (
             <>
                <DialogHeader>
                    <DialogTitle>{dialogMode === 'add' ? 'Add New' : 'Edit'} {roleName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={dialogMode === 'add' ? newUser.name : currentUser?.name} onChange={(e) => dialogMode === 'add' ? setNewUser({...newUser, name: e.target.value}) : setCurrentUser({...currentUser!, name: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={dialogMode === 'add' ? newUser.email : currentUser?.email} onChange={(e) => dialogMode === 'add' ? setNewUser({...newUser, email: e.target.value}) : setCurrentUser({...currentUser!, email: e.target.value})} disabled={dialogMode === 'edit'}/>
                    </div>
                    {dialogMode === 'add' && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})}/>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex-row justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDialogSubmit}>{dialogMode === 'add' ? 'Add' : 'Save Changes'}</Button>
                </DialogFooter>
             </>
        )
    }

  if (loading) {
    return (
        <MainLayout userType="admin">
            <div className="flex items-center justify-center h-full">
                <Skeleton className="h-60 w-full" />
            </div>
        </MainLayout>
    );
  }
  
  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');

  return (
    <MainLayout userType="admin">
      <div className="space-y-8">
        <Tabs defaultValue="teachers">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="teachers">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle>Teachers</CardTitle>
                                <CardDescription>Manage teacher accounts.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenDialog('add', 'teacher')}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
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
                                    {teachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>{teacher.name}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', 'teacher', teacher)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleOpenDialog('delete', 'teacher', teacher)}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {teachers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">No teachers found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* For smaller screens */}
                        <div className="md:hidden space-y-4">
                            {teachers.map((user) => (
                                <Card key={user.id}>
                                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                                        <Avatar>
                                            <AvatarImage data-ai-hint="profile picture" src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="p-2 pt-0 flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog('edit', 'teacher', user)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleOpenDialog('delete', 'teacher', user)}><Trash2 className="h-4 w-4" /></Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {teachers.length === 0 && (
                                <p className="text-center text-muted-foreground pt-4">No teachers found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="students">
                 <Card>
                    <CardHeader>
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>Manage student accounts and view marks.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenDialog('add', 'student')}>
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
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{student.totalScore || 0}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', 'student', student)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleOpenDialog('delete', 'student', student)}><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No students found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                         {/* For smaller screens */}
                        <div className="md:hidden space-y-4">
                            {students.map((user) => (
                                <Card key={user.id}>
                                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                                        <Avatar>
                                            <AvatarImage data-ai-hint="profile picture" src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-2 text-sm">
                                        <strong>Total Marks:</strong> {user.totalScore || 0}
                                    </CardContent>
                                    <CardFooter className="p-2 pt-0 flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog('edit', 'student', user)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleOpenDialog('delete', 'student', user)}><Trash2 className="h-4 w-4" /></Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {students.length === 0 && (
                                <p className="text-center text-muted-foreground pt-4">No students found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                {renderDialogContent()}
            </DialogContent>
        </Dialog>
    </MainLayout>
  );
}
