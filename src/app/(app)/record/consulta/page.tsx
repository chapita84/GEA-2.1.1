'use client';

import { useEffect, useState } from "react";
import { getAllRecords } from '../../../../lib/record-crud';
// Unifica el modelo: Record debe tener status
export interface Record {
  id?: string;
  fecha: string;
  monto: number;
  descripcion: string;
  usuario: string;
  categoria: string;
  status?: 'pendiente' | 'approved' | 'rejected';
  greenCoins?: number; 
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

export default function ConsultaTransacciones() {
  const [records, setRecords] = useState<Record[]>([]);
  const [filtered, setFiltered] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [usuario, setUsuario] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [monedas, setMonedas] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const data = await getAllRecords();
        setRecords(data);
        setFiltered(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar las transacciones.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    let result = records;
    if (usuario) {
      result = result.filter(r => r.usuario?.toLowerCase().includes(usuario.toLowerCase()));
    }
    if (categoria) {
      result = result.filter(r => r.categoria?.toLowerCase().includes(categoria.toLowerCase()));
    }
    if (fecha) {
      result = result.filter(r => r.fecha === fecha);
    }
    if (monto) {
      result = result.filter(r => String(r.monto) === monto);
    }
    setFiltered(result);
    if (monedas) {
      result = result.filter(r => String(r.greenCoins) === monedas);
    }
    setFiltered(result);
  }, [usuario, categoria, fecha, monto, monedas, records]);

  // Badge variant solo acepta: 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined
  const getBadgeVariant = (status?: string) => {
    if (status === 'approved') return 'outline';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulta de Transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="usuario">Usuario</Label>
            <Input
              id="usuario"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Filtrar por usuario"
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              placeholder="Filtrar por categoría"
            />
          </div>
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Filtrar por monto"
            />
          </div>
          <div>
            <Label htmlFor="monedas">Monedas Verdes</Label>
            <Input
              id="monedas"
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Filtrar por Monedas Verdes"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Monedas Verdes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron transacciones con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.usuario}</TableCell>
                  <TableCell>{transaction.descripcion}</TableCell>
                  <TableCell>{transaction.fecha}</TableCell>
                  <TableCell>{transaction.categoria}</TableCell>
                  <TableCell>${transaction.monto}</TableCell>
                  <TableCell>{transaction.greenCoins}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(transaction.status)}>
                      {transaction.status || 'pendiente'}
                    </Badge>
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