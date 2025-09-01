
'use client';

import MainLayout from "@/components/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users } from "@/lib/data";
import type { User } from "@/lib/types";
import { useState } from "react";
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
import { auth } from "@/lib/firebase";

export default function AdminDashboardPage() {
    const [allUsers, setAllUsers] = useState<User[]>(users);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<{name: string, email: string, password: string, role: 'teacher' | 'student'}>({name: '', email: '', password: '', role: 'teacher'});
    const { toast } = useToast();

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
            // In a real app, this should be a secure server-side action.
            // For this demo, we'll create the user on the client-side.
            // This is not recommended for production environments.
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

            const userToAdd: User = {
                id: userCredential.user.uid,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }

            // This is a temporary solution for the demo to persist the new user.
            // In a real app, you would save this to a database.
            users.push(userToAdd);

            setAllUsers([...allUsers, userToAdd]);
            setIsAddUserDialogOpen(false);
            toast({
                title: 'Success',
                description: `${newUser.role === 'teacher' ? 'Teacher' : 'Student'} added successfully.`
            })

        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not create user.'
            })
        }
    };

    const handleOpenEditDialog = (user: User) => {
        setCurrentUser(user);
        setIsEditUserDialogOpen(true);
    };

    const handleUpdateUser = () => {
        if(!currentUser) return;
        setAllUsers(allUsers.map(u => u.id === currentUser.id ? currentUser : u));
        setIsEditUserDialogOpen(false);
        toast({
            title: 'Success',
            description: 'User updated successfully.'
        })
    }

    const handleOpenDeleteDialog = (user: User) => {
        setCurrentUser(user);
        setIsDeleteUserDialogOpen(true);
    };

    const handleDeleteUser = () => {
        if(!currentUser) return;
        setAllUsers(allUsers.filter(u => u.id !== currentUser.id));
        setIsDeleteUserDialogOpen(false);
        toast({
            title: 'Success',
            description: 'User deleted successfully.'
        })
    }


    const UserTable = ({ users, onEdit, onDelete }: { users: User[], onEdit: (user: User) => void, onDelete: (user: User) => void}) => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
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
          </TableBody>
        </Table>
    )

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
                       <UserTable users={students} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog}/>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        {/* Add/Edit/Delete Dialogs */}
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
                            <Input id="edit-email" type="email" value={currentUser.email} onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}/>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateUser}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

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
