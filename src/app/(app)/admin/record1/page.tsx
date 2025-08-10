'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Search, Loader2, Check, X, Leaf } from 'lucide-react';
import { getAllRecords, createRecord, updateRecord, deleteRecord } from '@/lib/record-crud';
import { getAllUsers } from '@/lib/users-crud-complete';
import { getAllComercios } from '@/lib/comercios-verdes-crud';
import { getAllClients } from '@/lib/client-crud';
import { useToast } from '@/hooks/use-toast';
import { Record } from '@/models/record_model';
import { User } from '@/models/user_model';
import { ComercioVerde } from '@/models/comercio_verde_model';
import { Client } from '@/models/client_model';
import { calculateGreenCoins } from '@/lib/green-coins-calculator';
import { TODOS_LOS_RUBROS } from '@/data/rubros';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsManagementPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comercios, setComercios] = useState<ComercioVerde[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [recordToUpdateStatus, setRecordToUpdateStatus] = useState<{ record: Record; newStatus: 'approved' | 'rejected' } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<Partial<Record>>({
    fecha: '',
    monto: 0,
    descripcion: '',
    usuario: '',
    clienteUid: '',
    rubro: '', // Cambiado de categoria a rubro
    status: 'pendiente',
    greenCoins: 0,
    cuit: '',
    isSustainable: false,
  });
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsData, usersData, comerciosData, clientsData] = await Promise.all([
        getAllRecords(),
        getAllUsers(),
        getAllComercios(),
        getAllClients(),
      ]);
      setRecords(recordsData as Record[]);
      setUsers(usersData as User[]);
      setComercios(comerciosData as ComercioVerde[]);
      setClients(clientsData as Client[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const calculatedCoins = calculateGreenCoins({
      monto: formData.monto || 0,
      isSustainable: formData.isSustainable || false,
    });
    setFormData(prev => ({ ...prev, greenCoins: calculatedCoins }));
  }, [formData.monto, formData.isSustainable]);

  const getUserNameById = useCallback((userId: string) => {
    const user = users.find(u => u.uid === userId);
    return user ? user.displayName : userId;
  }, [users]);

  const getComercioNameByCuit = useCallback((cuit?: string) => {
    if (!cuit) return 'N/A';
    const comercio = comercios.find(c => c.cuit === cuit);
    return comercio ? comercio.name : 'N/A';
  }, [comercios]);

  const getClientNameById = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.nombre} ${client.apellido}` : 'No Asignado';
  }, [clients]);

  const filteredRecords = records.filter(record =>
    record.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientNameById(record.clienteUid!)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getComercioNameByCuit(record.cuit).toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.rubro?.toLowerCase().includes(searchTerm.toLowerCase()) // Cambiado de categoria a rubro
  );

  const handleComercioChange = (comercioId: string) => {
    const selected = comercios.find(c => c.id === comercioId);
    setFormData(prev => ({
      ...prev,
      cuit: selected?.cuit || '',
      isSustainable: selected?.isSustainable || false,
    }));
  };

  const handleSaveRecord = useCallback(async (isUpdate: boolean) => {
    try {
      if (!formData.descripcion || !formData.usuario || !formData.fecha || !formData.rubro) {
        toast({ title: "Campos Incompletos", variant: "destructive" });
        return;
      }

      const dataToSave: Omit<Record, 'id'> = {
        fecha: formData.fecha,
        monto: formData.monto || 0,
        descripcion: formData.descripcion,
        usuario: formData.usuario,
        clienteUid: formData.clienteUid || '',
        rubro: formData.rubro, // Cambiado de categoria a rubro
        greenCoins: formData.greenCoins || 0,
        status: formData.status || 'pendiente',
        cuit: formData.cuit || '',
        isSustainable: formData.isSustainable || false,
      };

      if (isUpdate && selectedRecord?.id) {
        await updateRecord(selectedRecord.id, dataToSave);
        toast({ title: "Transacción Actualizada" });
      } else {
        await createRecord(dataToSave);
        toast({ title: "Transacción Creada" });
      }

      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({ title: "Error al Guardar", variant: "destructive" });
    }
  }, [formData, selectedRecord, loadData, toast]);

  const handleStatusChange = useCallback(async () => {
    if (!recordToUpdateStatus) return;
    try {
      await updateRecord(recordToUpdateStatus.record.id!, { status: recordToUpdateStatus.newStatus });
      toast({
        title: "Estado Actualizado",
        description: `La transacción ha sido ${recordToUpdateStatus.newStatus === 'approved' ? 'aprobada' : 'rechazada'}.`,
      });
      setRecordToUpdateStatus(null);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Error al Actualizar Estado", variant: "destructive" });
    }
  }, [recordToUpdateStatus, loadData, toast]);

  const handleDeleteRecord = useCallback(async () => {
    if (!recordToDelete) return;
    try {
      await deleteRecord(recordToDelete.id!);
      toast({
        title: "Transacción Eliminada",
        description: `La transacción fue eliminada.`,
      });
      setRecordToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({ title: "Error al Eliminar", variant: "destructive" });
    }
  }, [recordToDelete, loadData, toast]);

  const openEditModal = (record: Record) => {
    setSelectedRecord(record);
    setFormData({
      fecha: record.fecha,
      monto: record.monto,
      descripcion: record.descripcion,
      usuario: record.usuario,
      clienteUid: record.clienteUid || '',
      rubro: record.rubro, // Cambiado de categoria a rubro
      status: record.status || 'pendiente',
      greenCoins: record.greenCoins || 0,
      cuit: record.cuit || '',
      isSustainable: record.isSustainable || false,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fecha: '',
      monto: 0,
      descripcion: '',
      usuario: '',
      clienteUid: '',
      rubro: '', // Cambiado de categoria a rubro
      status: 'pendiente',
      greenCoins: 0,
      cuit: '',
      isSustainable: false,
    });
  };

  const getBadgeVariant = (status?: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  };
  
  const selectedComercioId = comercios.find(c => c.cuit === formData.cuit)?.id || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Transacciones</h1>
          <p className="text-muted-foreground">
            Administra las transacciones de la plataforma GEA
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por descripción, cliente, comercio o rubro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Transacciones ({filteredRecords.length})
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
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Comercio</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Monedas Verdes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.descripcion}</TableCell>
                    <TableCell>{getClientNameById(record.clienteUid!)}</TableCell>
                    <TableCell>{getComercioNameByCuit(record.cuit)}</TableCell>
                    <TableCell>${record.monto?.toLocaleString('es-AR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600">
                        <Leaf className="h-4 w-4" />
                        <span>{record.greenCoins || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(record.status)}>{record.status || 'pendiente'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {record.status === 'pendiente' && (
                          <>
                            <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700" onClick={() => setRecordToUpdateStatus({ record, newStatus: 'approved' })}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setRecordToUpdateStatus({ record, newStatus: 'rejected' })}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="icon" onClick={() => openEditModal(record)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setRecordToDelete(record)}>
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
      
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={isEditModalOpen ? setIsEditModalOpen : setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Editar' : 'Nueva'} Transacción</DialogTitle>
            <DialogDescription>
              Completa la información de la transacción.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto p-4">
            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input id="descripcion" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="usuario">Usuario (Creador) *</Label>
              <Select value={formData.usuario} onValueChange={(value) => setFormData(prev => ({ ...prev, usuario: value }))}>
                <SelectTrigger id="usuario"><SelectValue placeholder="Selecciona un usuario" /></SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.uid).map((user) => (<SelectItem key={user.uid} value={user.uid!}>{user.displayName} ({user.email})</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cliente">Cliente Asignado</Label>
              <Select value={formData.clienteUid} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteUid: value }))}>
                <SelectTrigger id="cliente"><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.filter(client => client.id).map((client) => (<SelectItem key={client.id} value={client.id!}>{client.nombre} {client.apellido}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monto">Monto *</Label>
              <Input id="monto" type="number" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}/>
            </div>
            <div>
              <Label htmlFor="cuit">Comercio</Label>
              <Select value={selectedComercioId} onValueChange={handleComercioChange}>
                <SelectTrigger id="cuit"><SelectValue placeholder="Selecciona un comercio" /></SelectTrigger>
                <SelectContent>
                  {comercios.map((comercio) => (<SelectItem key={comercio.id} value={comercio.id!}>{comercio.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {formData.cuit && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                <Leaf className={`h-4 w-4 ${formData.isSustainable ? 'text-green-600' : 'text-gray-400'}`} />
                <span>
                  Este comercio es sostenible: {formData.isSustainable ? 'Sí' : 'No'}
                </span>
              </div>
            )}
            <div>
              <Label htmlFor="greenCoins">Monedas Verdes (Calculadas)</Label>
              <Input id="greenCoins" type="number" value={formData.greenCoins || 0} readOnly className="bg-muted"/>
            </div>
            <div>
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="rubro">Rubro *</Label>
              <Select value={formData.rubro} onValueChange={(value) => setFormData({ ...formData, rubro: value })}>
                <SelectTrigger id="rubro">
                  <SelectValue placeholder="Selecciona un rubro" />
                </SelectTrigger>
                <SelectContent>
                  {TODOS_LOS_RUBROS.map((rubro) => (
                    <SelectItem key={rubro} value={rubro}>
                      {rubro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pendiente' | 'approved' | 'rejected' }))}>
                <SelectTrigger id="status"><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => handleSaveRecord(!!isEditModalOpen)}>
              {isEditModalOpen ? 'Guardar Cambios' : 'Crear Transacción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!recordToUpdateStatus} onOpenChange={() => setRecordToUpdateStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de {recordToUpdateStatus?.newStatus === 'approved' ? 'aprobar' : 'rechazar'} la transacción "{recordToUpdateStatus?.record.descripcion}". ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la transacción seleccionada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
