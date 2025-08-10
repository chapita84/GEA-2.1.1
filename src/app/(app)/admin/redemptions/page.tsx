'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import { getAllRedemptions } from '@/lib/redemptions-crud';
import { getAllUsers } from '@/lib/users-crud-complete';
import { Redemption } from '@/models/redemption_model';
import { User } from '@/models/user_model';

type RedemptionWithUserData = Redemption & { userName?: string };

export default function RedemptionsManagementPage() {
  const [redemptions, setRedemptions] = useState<RedemptionWithUserData[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<RedemptionWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [redemptionsData, usersData] = await Promise.all([
        getAllRedemptions(),
        getAllUsers(),
      ]);
      
      const usersMap = new Map(usersData.map(u => [u.uid, u.displayName]));

      const redemptionsWithUser = redemptionsData.map(r => ({
        ...r,
        userName: usersMap.get(r.userId) || r.userId,
      }));

      setRedemptions(redemptionsWithUser);
      setFilteredRedemptions(redemptionsWithUser);
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
    const results = redemptions.filter(r =>
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRedemptions(results);
  }, [searchTerm, redemptions]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Canjes</h1>
        <p className="text-muted-foreground">
          Visualiza todos los canjes de productos realizados por los usuarios.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Canjes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre de producto o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Total de Canjes ({filteredRedemptions.length})
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
                  <TableHead>Producto Canjeado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha del Canje</TableHead>
                  <TableHead className="text-right">Costo (MV)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRedemptions.length > 0 ? (
                  filteredRedemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-medium">{redemption.productName}</TableCell>
                      <TableCell>{redemption.userName}</TableCell>
                      <TableCell>{formatDate(redemption.redeemedAt)}</TableCell>
                      <TableCell className="text-right">{redemption.coinsSpent}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron canjes.
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
