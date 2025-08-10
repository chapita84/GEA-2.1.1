'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Leaf } from 'lucide-react';
import { getAllRecords } from '@/lib/record-crud';
import { getAllClients } from '@/lib/client-crud';
import { getAllComercios } from '@/lib/comercios-verdes-crud';
import { useAuth } from '@/context/AuthContext';
import { Record } from '@/models/record_model';
import { Client } from '@/models/client_model';
import { ComercioVerde } from '@/models/comercio_verde_model';
import { Badge } from '@/components/ui/badge';

export default function ConsultaTransaccionesPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [comercios, setComercios] = useState<ComercioVerde[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [recordsData, clientsData, comerciosData] = await Promise.all([
        getAllRecords(),
        getAllClients(),
        getAllComercios(),
      ]);

      const userRecords = recordsData.filter(record => record.clienteUid === user.uid);
      setRecords(userRecords);
      setClients(clientsData as Client[]);
      setComercios(comerciosData as ComercioVerde[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getClientNameById = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.nombre} ${client.apellido}` : clientId;
  }, [clients]);

  const getComercioNameByCuit = useCallback((cuit?: string) => {
    if (!cuit) return 'N/A';
    const comercio = comercios.find(c => c.cuit === cuit);
    return comercio ? comercio.name : 'N/A';
  }, [comercios]);

  const filteredRecords = records.filter(record =>
    record.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getComercioNameByCuit(record.cuit).toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.rubro?.toLowerCase().includes(searchTerm.toLowerCase()) // Cambiado de categoria a rubro
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getBadgeVariant = (status?: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Transacciones</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver el historial de tus acciones sostenibles registradas.
        </p>
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
            placeholder="Buscar por descripción, comercio o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Historial ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8 h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Comercio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Importe</TableHead> {/* ✅ Nueva columna */}
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monedas Verdes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.descripcion}</TableCell>
                      <TableCell>{getClientNameById(record.clienteUid!)}</TableCell>
                      <TableCell>{getComercioNameByCuit(record.cuit)}</TableCell>
                      <TableCell>{formatDate(record.fecha)}</TableCell>
                      <TableCell className="font-medium">${record.monto.toLocaleString('es-AR')}</TableCell> {/* ✅ Se añade el dato */}
                      <TableCell>
                        <Badge variant={getBadgeVariant(record.status)}>
                          {record.status || 'pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 font-semibold text-green-600">
                          <Leaf className="h-4 w-4" />
                          <span>{record.greenCoins || 0}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center"> {/* ✅ Se actualiza el colSpan */}
                      No se encontraron transacciones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
