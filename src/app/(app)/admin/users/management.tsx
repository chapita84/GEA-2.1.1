'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeyRound, Pencil, Trash2, Plus, Users, Search, Loader2 } from 'lucide-react';
import { getAllUsers, updateUser, deleteUser, createUser, uploadProfileImage, updateUserPassword } from '@/lib/users-crud-complete';
import { getClientByUserUid, createClient, updateClient, deleteClient } from '@/lib/client-crud';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/models/user_model';
import { Client } from '@/models/client_model';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserWithClientData = User & Partial<Client>;

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithClientData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithClientData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<Partial<UserWithClientData & { password?: string, confirmPassword?: string }>>({
    uid: '',
    email: '',
    displayName: '',
    photoUrl: '',
    password: '',
    confirmPassword: '',
    onboardingCompleted: false,
    greenCoins: 0,
    isAdmin: false,
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    documento: '',
  });
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      const usersWithClientData = await Promise.all(
        usersData.map(async (user) => {
          const clientData = await getClientByUserUid(user.uid);
          return { ...user, ...clientData };
        })
      );
      setUsers(usersWithClientData as UserWithClientData[]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreateUser = useCallback(async () => {
    try {
      if (!formData.uid || !formData.email || !formData.displayName) {
        toast({ title: "Campos Incompletos", description: "ID, Email y Nombre son obligatorios.", variant: "destructive" });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        toast({ title: "Contraseña inválida", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
        return;
      }

      setIsUploading(true);

      let photoUrl = formData.photoUrl || 'https://via.placeholder.com/150';
      
      if (selectedFile && formData.uid) {
        photoUrl = await uploadProfileImage({ userId: formData.uid, file: selectedFile });
      }

      const userData: User = {
        uid: formData.uid,
        email: formData.email!,
        displayName: formData.displayName,
        photoUrl: photoUrl,
        password: formData.password,
        createdAt: new Date().toISOString(),
        interests: [],
        onboardingCompleted: formData.onboardingCompleted || false,
        greenCoins: formData.greenCoins || 0,
        isAdmin: formData.isAdmin || false,
        gamification: { level: 1, points: 0, title: 'Explorador Ecológico' }
      };

      const clientData: Client = {
        id: formData.uid,
        usuarioUid: formData.uid,
        nombre: formData.nombre || formData.displayName,
        apellido: formData.apellido || '',
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        fechaNacimiento: formData.fechaNacimiento || '',
        documento: formData.documento || '',
      };

      await createUser(userData);
      await createClient(clientData);

      setIsCreateModalOpen(false);
      resetForm();
      setSearchTerm('');
      loadUsers();
      toast({
        title: "Usuario Creado",
        description: `El usuario ${formData.displayName} y su perfil de cliente han sido creados.`,
      });
    } catch (error) {
      console.error('Error creating user/cliente:', error);
      toast({
        title: "Error al Crear",
        description: "Ocurrió un error al intentar crear el usuario y el cliente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  }, [formData, selectedFile, loadUsers, toast]);

  const handleUpdateUser = useCallback(async () => {
    try {
      if (!selectedUser || !formData.email || !formData.displayName) {
        toast({
          title: "Campos Incompletos",
          description: "Por favor completa los campos obligatorios (Email, Nombre).",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);

      let photoUrl = formData.photoUrl;
      
      if (selectedFile) {
        photoUrl = await uploadProfileImage({ userId: selectedUser.uid, file: selectedFile });
      }

      // ✅ CORRECCIÓN: Se asegura que los valores 'null' se conviertan a 'undefined'
      // para que coincidan con el tipo 'User' de la base de datos.
      const userDataToUpdate: Partial<User> = {
        email: formData.email,
        displayName: formData.displayName ?? undefined,
        photoUrl: photoUrl ?? undefined,
        greenCoins: formData.greenCoins,
        isAdmin: formData.isAdmin,
        onboardingCompleted: formData.onboardingCompleted,
      };

      const clientDataToUpdate: Partial<Client> = {
        nombre: formData.nombre || formData.displayName,
        apellido: formData.apellido,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaNacimiento: formData.fechaNacimiento,
        documento: formData.documento,
      };

      await updateUser(selectedUser.uid, userDataToUpdate);
      
      const clientDoc = await getClientByUserUid(selectedUser.uid);
      if (clientDoc) {
        await updateClient(selectedUser.uid, clientDataToUpdate);
      } else {
        const newClientData: Client = {
          id: selectedUser.uid,
          usuarioUid: selectedUser.uid,
          nombre: formData.nombre || formData.displayName || '',
          apellido: formData.apellido || '',
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          fechaNacimiento: formData.fechaNacimiento || '',
          documento: formData.documento || '',
        };
        await createClient(newClientData);
      }
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
      setSearchTerm('');
      loadUsers();
      toast({
        title: "Usuario Actualizado",
        description: `La información de ${formData.displayName} ha sido actualizada.`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error al Actualizar",
        description: "Ocurrió un error al intentar actualizar el usuario.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  }, [formData, selectedFile, selectedUser, loadUsers, toast]);

  const handleDeleteUser = useCallback(async () => {
    try {
      if (!userToDelete) return;
      await deleteUser(userToDelete.uid);
      await deleteClient(userToDelete.uid);
      toast({
        title: "Usuario Eliminado",
        description: `El usuario ${userToDelete.displayName} ha sido eliminado.`,
      });
      setUserToDelete(null);
      setSearchTerm('');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error al Eliminar",
        description: "Ocurrió un error al intentar eliminar el usuario.",
        variant: "destructive",
      });
    }
  }, [userToDelete, loadUsers, toast]);

  const handlePasswordChange = useCallback(async () => {
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    try {
      await updateUserPassword(selectedUser.uid, newPassword);
      toast({ title: "Contraseña actualizada", description: `La contraseña de ${selectedUser.displayName} ha sido cambiada.` });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUser(null);
      setSearchTerm('');
      loadUsers();
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      toast({ title: "Error al cambiar contraseña", variant: "destructive" });
    }
  }, [selectedUser, newPassword, confirmPassword, loadUsers, toast]);

  const openEditModal = (user: UserWithClientData) => {
    setSelectedUser(user);
    setFormData({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      onboardingCompleted: user.onboardingCompleted || false,
      greenCoins: user.greenCoins || 0,
      isAdmin: user.isAdmin || false,
      nombre: user.nombre || user.displayName,
      apellido: user.apellido || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      fechaNacimiento: user.fechaNacimiento || '',
      documento: user.documento || '',
    });
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (user: UserWithClientData) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      uid: '',
      email: '',
      displayName: '',
      photoUrl: '',
      password: '',
      confirmPassword: '',
      onboardingCompleted: false,
      greenCoins: 0,
      isAdmin: false,
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      documento: '',
    });
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios y clientes de la plataforma GEA
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>GreenCoins</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoUrl || 'https://via.placeholder.com/40'}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{user.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
                    </TableCell>
                    <TableCell>{user.greenCoins || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openPasswordModal(user)}>
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEditModal(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setUserToDelete(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo usuario y su perfil de cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
            <h3 className="text-lg font-semibold border-b pb-2">Datos de Acceso</h3>
            <div>
              <Label htmlFor="uid">ID de Usuario (UID) *</Label>
              <Input id="uid" value={formData.uid} onChange={(e) => setFormData({ ...formData, uid: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="displayName">Nombre a Mostrar *</Label>
              <Input id="displayName" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="photoUrl">URL de Foto</Label>
              <Input id="photoUrl" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}/>
            </div>
             <div>
              <Label htmlFor="photoFile">O Subir Imagen</Label>
              <Input id="photoFile" type="file" onChange={handleFileChange} accept="image/*"/>
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t">Perfil de Cliente</h3>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="documento">Documento</Label>
              <Input id="documento" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })}/>
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">Configuración y Gamificación</h3>
            <div>
              <Label htmlFor="greenCoins">GreenCoins</Label>
              <Input id="greenCoins" type="number" value={formData.greenCoins} onChange={(e) => setFormData({ ...formData, greenCoins: parseInt(e.target.value) || 0 })}/>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={formData.isAdmin} onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}/>
              <Label>Es Administrador</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Switch checked={formData.onboardingCompleted} onCheckedChange={(checked) => setFormData({ ...formData, onboardingCompleted: checked })}/>
              <Label>Onboarding Completado</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario y su perfil de cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
            <h3 className="text-lg font-semibold border-b pb-2">Datos de Acceso</h3>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-displayName">Nombre a Mostrar *</Label>
              <Input id="edit-displayName" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-photoUrl">URL de Foto</Label>
              <Input id="edit-photoUrl" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}/>
            </div>
             <div>
              <Label htmlFor="edit-photoFile">O Subir Imagen</Label>
              <Input id="edit-photoFile" type="file" onChange={handleFileChange} accept="image/*"/>
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t">Perfil de Cliente</h3>
            <div>
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input id="edit-nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-apellido">Apellido</Label>
              <Input id="edit-apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input id="edit-telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Input id="edit-direccion" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-fechaNacimiento">Fecha de Nacimiento</Label>
              <Input id="edit-fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="edit-documento">Documento</Label>
              <Input id="edit-documento" value={formData.documento} onChange={(e) => setFormData({ ...formData, documento: e.target.value })}/>
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">Configuración y Gamificación</h3>
            <div>
              <Label htmlFor="edit-greenCoins">GreenCoins</Label>
              <Input id="edit-greenCoins" type="number" value={formData.greenCoins} onChange={(e) => setFormData({ ...formData, greenCoins: parseInt(e.target.value) || 0 })}/>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={formData.isAdmin} onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}/>
              <Label>Es Administrador</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Switch checked={formData.onboardingCompleted} onCheckedChange={(checked) => setFormData({ ...formData, onboardingCompleted: checked })}/>
              <Label>Onboarding Completado</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateUser} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña para {selectedUser?.displayName}</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para este usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
            <Button onClick={handlePasswordChange}>Guardar Contraseña</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al usuario
              <span className="font-bold"> {userToDelete?.displayName}</span> y su perfil de cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ); 
}
