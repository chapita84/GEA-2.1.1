'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeyRound, Pencil, Plus, Users, Search, Loader2 } from 'lucide-react';
import { getAllUsers, updateUser, createUser, uploadProfileImage, updateUserPassword } from '@/lib/users-crud-complete';
import { getClientByUserUid, createClient, updateClient } from '@/lib/client-crud';
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
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { firebaseConfig } from '@/lib/firebase-client';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Use modern Firebase SDK instead of compat
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const functions = getFunctions(app, 'southamerica-west1');

// Keep compat for backwards compatibility if needed
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

type UserWithClientData = User & Partial<Client>;

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithClientData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<Partial<UserWithClientData & { password?: string, confirmPassword?: string }>>({});
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

  const handleToggleStatus = async (userToToggle: UserWithClientData) => {
    const newStatus = (userToToggle.status === 'active' || userToToggle.status === undefined) ? 'inactive' : 'active';
    try {
      const toggleFunction = firebase.app().functions("southamerica-west1").httpsCallable('toggleUserStatus');
      await toggleFunction({ userId: userToToggle.uid, newStatus });
      
      toast({
        title: "Estado Actualizado",
        description: `El usuario ${userToToggle.displayName} ha sido ${newStatus === 'active' ? 'activado' : 'desactivado'}.`
      });
      loadUsers();
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
      toast({ title: "Error", description: "No se pudo cambiar el estado del usuario.", variant: "destructive" });
    }
  };

  const handleCreateUser = useCallback(async () => {
    try {
      if (!formData.email || !formData.displayName || !formData.password) {
        toast({ title: "Campos Incompletos", description: "Email, Nombre y Contraseña son obligatorios.", variant: "destructive" });
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: "Contraseña inválida", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      
      let photoUrl = 'https://via.placeholder.com/150';
      
      // Validar URL de foto si se proporcionó
      if (formData.photoUrl && formData.photoUrl.trim() !== '') {
        const trimmedUrl = formData.photoUrl.trim();
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          photoUrl = trimmedUrl;
        }
      }
      
      // Subir imagen si se seleccionó una
      if (selectedFile) {
        photoUrl = await uploadProfileImage({ userId: 'temp', file: selectedFile });
      }

      // Preparar datos para la Cloud Function
      const userData = {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        photoUrl: photoUrl,
        isAdmin: formData.isAdmin,
      };

      const clientData = {
        nombre: formData.nombre || formData.displayName,
        apellido: formData.apellido || '',
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        fechaNacimiento: formData.fechaNacimiento || '',
        documento: formData.documento || '',
      };

      // Usar Cloud Function para crear usuario sin afectar la sesión actual
      console.log('Calling createUserByAdmin with:', { userData, clientData });
      const createUserFunction = httpsCallable(functions, 'createUserByAdmin');
      const result = await createUserFunction({ userData, clientData });
      console.log('createUserByAdmin result:', result);

      const data = result.data as { success: boolean; uid?: string };
      if (data.success) {
        setIsCreateModalOpen(false);
        resetForm();
        setSearchTerm('');
        loadUsers();
        toast({
          title: "Usuario Creado",
          description: `El usuario ${formData.displayName} y su perfil de cliente han sido creados.`,
        });
      }
    } catch (error: any) {
      console.error('Error creating user/cliente:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
      let errorMessage = "Ocurrió un error al intentar crear el usuario y el cliente.";
      
      if (error.message?.includes('email-already-in-use') || error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está en uso.";
      } else if (error.message?.includes('invalid-email')) {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (error.message?.includes('weak-password')) {
        errorMessage = "La contraseña es muy débil.";
      }
      
      toast({
        title: "Error al Crear",
        description: errorMessage,
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

      const userDataToUpdate: Partial<User> = {
        email: formData.email,
        displayName: formData.displayName,
        photoUrl: photoUrl,
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
                  <TableHead>Estado</TableHead>
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
                      <Badge variant={(user.status === 'active' || user.status === undefined) ? 'default' : 'destructive'}>
                        {(user.status === 'active' || user.status === undefined) ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-4">
                        <Switch
                          checked={(user.status === 'active' || user.status === undefined)}
                          onCheckedChange={() => handleToggleStatus(user)}
                          aria-label="Activar/desactivar usuario"
                        />
                        <Button variant="outline" size="icon" onClick={() => openPasswordModal(user)}>
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEditModal(user)}>
                          <Pencil className="h-4 w-4" />
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
    </div>
  ); 
}
