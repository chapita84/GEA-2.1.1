'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckSquare, ShoppingBag, Leaf, Award, Loader2 } from 'lucide-react';
import { getAllUsers } from '@/lib/users-crud-complete';
import { getAllRecords } from '@/lib/record-crud';
import { getAllProducts } from '@/lib/products-crud';
import { getAllRedemptions } from '@/lib/redemptions-crud';
import { User } from '@/models/user_model';
import { Record as RecordModel } from '@/models/record_model';
import { Product } from '@/models/product_model';
import { Redemption } from '@/models/redemption_model';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApprovedTransactions: 0,
    totalRedemptions: 0,
  });
  const [userChartData, setUserChartData] = useState<any[]>([]);
  const [transactionChartData, setTransactionChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const processDataForCharts = useCallback((users: User[], records: RecordModel[], redemptions: Redemption[]) => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }).reverse();

    // Procesar nuevos usuarios por día
    const newUsersByDay = last7Days.map(day => {
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        return userDate === day;
      }).length;
      return { name: day, usuarios: count };
    });
    setUserChartData(newUsersByDay);

    // Procesar transacciones aprobadas por día
    const approvedTransactionsByDay = last7Days.map(day => {
      const count = records.filter(record => {
        if (record.status !== 'approved' || !record.fecha) return false;
        const recordDate = new Date(record.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        return recordDate === day;
      }).length;
      return { name: day, transacciones: count };
    });
    setTransactionChartData(approvedTransactionsByDay);

    // Procesar productos más canjeados
    const productCounts = redemptions.reduce((acc, redemption) => {
      acc[redemption.productName] = (acc[redemption.productName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    setTopProducts(sortedProducts);

    // Procesar top 5 usuarios por GreenCoins
    const sortedUsers = [...users]
      .sort((a, b) => (b.greenCoins || 0) - (a.greenCoins || 0))
      .slice(0, 5);
    setTopUsers(sortedUsers);

  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, recordsData, redemptionsData] = await Promise.all([
          getAllUsers(),
          getAllRecords(),
          getAllRedemptions()
        ]);
        
        setStats({
          totalUsers: usersData.length,
          totalApprovedTransactions: recordsData.filter(r => r.status === 'approved').length,
          totalRedemptions: redemptionsData.length,
        });

        processDataForCharts(usersData as User[], recordsData as RecordModel[], redemptionsData as Redemption[]);

      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [processDataForCharts]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Aprobadas</CardTitle>
            <CheckSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.totalApprovedTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Canjes</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.totalRedemptions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nuevos Usuarios (Últimos 7 Días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="usuarios" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Aprobadas (Últimos 7 Días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="transacciones" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Productos Canjeados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Canjes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Usuarios por Monedas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Monedas Verdes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell className="text-right">{user.greenCoins}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
