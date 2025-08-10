'use client';

import { useState, useEffect, useCallback, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Users, Search, Loader2, Leaf } from 'lucide-react';
import { getAllClients, createClient, updateClient, deleteClient } from '@/lib/client-crud';
import { getAllUsers, createUser } from '@/lib/users-crud-complete';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/models/client_model';
import { User } from '@/models/user_model';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { gamificationLevels } from '@/lib/gamification';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
// ✅ Se importan las funciones de Firebase Auth
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase-client';


type ClientWithUserData = Client & Partial<User>;

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<ClientWithUserData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientWithUserData | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithUserData | null>(null);
  const [formData, setFormData] = useState<Partial<ClientWithUserData & { password?: string, confirmPassword?: string }>>({});
  const { toast } = useToast();
  const auth = getAuth(app);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, usersData] = await Promise.all([
        getAllClients(),
        getAllUsers(),
      ]);
      
      const clientsWithUserData = clientsData.map(client => {
        const user = usersData.find(u => u.uid === client.usuarioUid);
        return { ...client, ...user };
      });

      setClients(clientsWithUserData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredClients = clients.filter(client =>
    client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gamification?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderLevelIcon = (iconName?: string, color?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className={cn("h-4 w-4", color || "text-muted-foreground")} /> : null;
  };

  const handleSave = useCallback(async () => {
    try {
      // --- Lógica para CREAR un nuevo Cliente y Usuario ---
      if (!selectedClient) {
        if (!formData.email || !formData.nombre || !formData.password || !formData.confirmPassword) {
          toast({ title: "Campos Incompletos", description: "Email, Nombre, y Contraseña son obligatorios.", variant: "destructive" });
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

        // 1. Crear el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;

        // 2. Crear el documento del usuario en la colección 'users'
        await createUser(firebaseUser, { 
          displayName: `${formData.nombre} ${formData.apellido || ''}`.trim() 
        });

        // 3. Crear el perfil del cliente en la colección 'clients'
        const clientData: Client = {
          id: firebaseUser.uid,
          usuarioUid: firebaseUser.uid,
          nombre: formData.nombre,
          apellido: formData.apellido || '',
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          fechaNacimiento: formData.fechaNacimiento || '',
          documento: formData.documento || '',
        };
        await createClient(clientData);
        toast({ title: "Cliente y Usuario Creados" });

      } else { // --- Lógica para ACTUALIZAR un Cliente existente ---
        if (!formData.nombre || !formData.apellido) {
          toast({ title: "Campos Incompletos", description: "Nombre y apellido son obligatorios.", variant: "destructive" });
          return;
        }
        const dataToUpdate: Partial<Client> = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          fechaNacimiento: formData.fechaNacimiento || '',
          documento: formData.documento || '',
        };
        await updateClient(selectedClient.id, dataToUpdate);
        toast({ title: "Cliente Actualizado" });
      }

      setIsModalOpen(false);
      setSearchTerm('');
      loadData();
    } catch (error: any) {
      console.error('Error saving client:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: "Error", description: "Este correo electrónico ya está en uso.", variant: "destructive" });
      } else {
        toast({ title: "Error al Guardar", variant: "destructive" });
      }
    }
  }, [formData, selectedClient, loadData, toast, auth]);

  const handleDelete = useCallback(async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id);
      // Opcional: También podrías querer eliminar el usuario asociado desde una Cloud Function
      toast({
        title: "Cliente Eliminado",
        description: `El cliente ${clientToDelete.nombre} ha sido eliminado.`,
      });
      setClientToDelete(null);
      setSearchTerm('');
      loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: "Error al Eliminar", variant: "destructive" });
    }
  }, [clientToDelete, loadData, toast]);

  const openModal = (client: ClientWithUserData | null = null) => {
    setSelectedClient(client);
    setFormData(client ? { ...client } : {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      documento: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra los perfiles de clientes de la plataforma GEA
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, apellido, email o nivel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Clientes ({filteredClients.length})
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
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Monedas Verdes</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const levelInfo = gamificationLevels.find(l => l.level === client.gamification?.level);
                  const iconName = levelInfo?.icon;
                  const iconColor = levelInfo?.color;

                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nombre} {client.apellido}</TableCell>
                      <TableCell>{client.email || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-500" />
                          <span>{client.greenCoins || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderLevelIcon(iconName, iconColor)}
                          <span>{client.gamification?.title || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openModal(client)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => setClientToDelete(client)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Editar' : 'Nuevo'} Cliente</DialogTitle>
            <DialogDescription>
              {selectedClient ? 'Modifica la información del perfil.' : 'Completa la información para crear un nuevo cliente y su cuenta de usuario.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto p-4">
            {!selectedClient && (
              <>
                <h3 className="text-lg font-semibold border-b pb-2">Datos de Acceso</h3>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
                </div>
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}/>
                </div>
              </>
            )}
            
            <h3 className="text-lg font-semibold pt-4 border-t">Datos Personales</h3>
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="apellido">Apellido *</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              {selectedClient ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al cliente
              <span className="font-bold"> {clientToDelete?.nombre} {clientToDelete?.apellido}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
