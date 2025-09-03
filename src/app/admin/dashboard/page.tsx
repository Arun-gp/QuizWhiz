
'use client';

import MainLayout from "@/components/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, set, get, child, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<{name: string, email: string, password: string, role: 'teacher' | 'student'}>({name: '', email: '', password: '', role: 'teacher'});
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const fetchUsers = async () => {
                    const dbRef = ref(db);
                    const snapshot = await get(child(dbRef, 'users'));
                    if (snapshot.exists()) {
                        const usersData = snapshot.val();
                        const usersList = Object.keys(usersData).map(key => ({
                            id: key,
                            ...usersData[key]
                        }));
                        setAllUsers(usersList);
                    }
                    setLoading(false);
                };
                fetchUsers();
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const teachers = allUsers.filter(u => u.role === 'teacher');
    const students = allUsers.filter(u => u.role === 'student');
    const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");

    const handleOpenAddDialog = (role: 'teacher' | 'student') => {
        setNewUser({ name: '', email: '', password: '', role });
        setIsAddUserDialogOpen(true);
    };

    const handleAddUser = async () => {
        if(!newUser.name || !newUser.email || !newUser.password) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill in all fields.'
            })
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const userId = userCredential.user.uid;
            const userToAdd: Omit<User, 'id'> = {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
            
            await set(ref(db, 'users/' + userId), userToAdd);

            setAllUsers([...allUsers, { ...userToAdd, id: userId }]);
            setIsAddUserDialogOpen(false);
            toast({
                title: 'Success',
                description: `${newUser.role === 'teacher' ? 'Teacher' : 'Student'} added successfully.`
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

    const handleOpenEditDialog = (user: User) => {
        setCurrentUser(user);
        setIsEditUserDialogOpen(true);
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
            setAllUsers(allUsers.map(u => u.id === currentUser.id ? currentUser : u));
            setIsEditUserDialogOpen(false);
            toast({
                title: 'Success',
                description: 'User updated successfully.'
            })
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update user.'
            })
        }
    }

    const handleOpenDeleteDialog = (user: User) => {
        setCurrentUser(user);
        setIsDeleteUserDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if(!currentUser) return;
        try {
            await remove(ref(db, 'users/' + currentUser.id));
            setAllUsers(allUsers.filter(u => u.id !== currentUser.id));
            setIsDeleteUserDialogOpen(false);
            toast({
                title: 'Success',
                description: 'User deleted successfully from database.'
            })
        } catch(e) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete user.'
            })
        }
    }


    const UserTable = ({ users, onEdit, onDelete, showMarks = false }: { users: User[], onEdit: (user: User) => void, onDelete: (user: User) => void, showMarks?: boolean}) => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              {showMarks && <TableHead>Marks</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                {showMarks && <TableCell>{user.marks ? Object.values(user.marks).join(', ') : 'N/A'}</TableCell>}
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(user)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={showMarks ? 4: 3} className="text-center">No users found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    )

    if (loading) {
        return (
            <MainLayout userType="admin">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </MainLayout>
        );
    }

  return (
    <MainLayout userType="admin">
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "teachers" | "students")} className="w-full">
                <TabsList>
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>
                <TabsContent value="teachers">
                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Manage Teachers</h2>
                            <Button onClick={() => handleOpenAddDialog('teacher')}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
                            </Button>
                        </div>
                        <UserTable users={teachers} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
                    </div>
                </TabsContent>
                <TabsContent value="students">
                    <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Manage Students</h2>
                            <Button onClick={() => handleOpenAddDialog('student')}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </div>
                       <UserTable users={students} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} showMarks={true}/>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New {newUser.role === 'teacher' ? 'Teacher' : 'Student'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUser}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {currentUser?.role === 'teacher' ? 'Teacher' : 'Student'}</DialogTitle>
                </DialogHeader>
                {currentUser && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" value={currentUser.name} onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" type="email" value={currentUser.email} readOnly disabled/>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateUser}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </MainLayout>
  );
}
