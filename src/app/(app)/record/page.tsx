'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAllRecords, updateRecord } from '@/lib/record-crud';
import { Record } from '@/models/record_model'; // Usa solo Record

export default function ValidateTransactionsPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await getAllRecords();
        setRecords(data);
      } catch (err) {
        toast({ title: 'Error', description: 'No se pudieron cargar las transacciones.' });
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [toast]);

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateRecord(id, { status: newStatus } as Partial<Omit<Record, 'id'>>);
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === id ? { ...rec, status: newStatus } : rec
        )
      );
      toast({
        title: `Transacción ${newStatus === 'approved' ? 'Aprobada' : 'Rechazada'}`,
        description: `La transacción ID ${id} ha sido ${newStatus === 'approved' ? 'aprobada' : 'rechazada'}.`
      });
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar la transacción.' });
    }
  };

  const getBadgeVariant = (status?: string) => {
    if (status === 'approved') return 'outline';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validar Transacciones</CardTitle>
        <CardDescription>
          Revisa y aprueba o rechaza las acciones enviadas por los usuarios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Monedas Verdes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Cargando...</TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No hay transacciones para validar.</TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.usuario}</TableCell>
                  <TableCell>{record.descripcion}</TableCell>
                  <TableCell>{record.fecha}</TableCell>
                  <TableCell>{record.monto}</TableCell>
                  <TableCell>{record.greenCoins}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(record.status)}>
                      {record.status || 'pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" title="Ver Prueba">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Aprobar"
                      className="text-primary hover:text-primary"
                      onClick={() => handleAction(record.id!, 'approved')}
                      disabled={record.status === 'approved'}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Rechazar"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleAction(record.id!, 'rejected')}
                      disabled={record.status === 'rejected'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}