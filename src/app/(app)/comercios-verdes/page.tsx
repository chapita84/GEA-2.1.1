'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllComercios } from '@/lib/comercios-verdes-crud';
import { ComercioVerdeConId } from '@/models/comercio_verde_model';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, CheckCircle, Eye } from 'lucide-react';

export default function ComerciosVerdesPage() {
  const [comercios, setComercios] = useState<ComercioVerdeConId[]>([]);
  const [filteredComercios, setFilteredComercios] = useState<ComercioVerdeConId[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadComercios = useCallback(async () => {
    try {
      setLoading(true);
      const comerciosData = await getAllComercios();
      setComercios(comerciosData);
      setFilteredComercios(comerciosData);
      
      const uniqueCategories = Array.from(new Set(comerciosData.map(c => c.rubro).filter(Boolean))); // Cambiado de category a rubro
      setCategories(uniqueCategories);
      setError(null);
    } catch (err) {
      console.error("Error fetching comercios:", err);
      setError("No se pudieron cargar los comercios. Intente de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComercios();
  }, [loadComercios]);

  useEffect(() => {
    let result = comercios;

    if (searchTerm) {
      result = result.filter(comercio =>
        comercio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.description && comercio.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(comercio => comercio.rubro === selectedCategory); // Cambiado de category a rubro
    }

    setFilteredComercios(result);
  }, [searchTerm, selectedCategory, comercios]);

  const handleViewDetails = (id: string) => {
    router.push(`/comercios-verdes/${id}`);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Nuestros Comercios Verdes
        </h1>
        <p className="text-muted-foreground">
          Explora y apoya a los negocios locales comprometidos con la sostenibilidad.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtrar Comercios
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8 h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Sostenible</TableHead>
                  <TableHead className="text-right">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComercios.length > 0 ? (
                  filteredComercios.map(comercio => (
                    <TableRow 
                      key={comercio.id} 
                      onClick={() => handleViewDetails(comercio.id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <img
                          src={comercio.imageUrl || 'https://placehold.co/64x40/E8E8E8/BDBDBD?text=GEA'}
                          alt={comercio.name}
                          className="w-16 h-10 object-cover rounded-md"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x40/E8E8E8/BDBDBD?text=Error')}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{comercio.name}</TableCell>
                      <TableCell>{comercio.rubro}</TableCell> {/* Cambiado de category a rubro */}
                      <TableCell>{comercio.address}</TableCell>
                      <TableCell>
                        {comercio.isSustainable && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Sí
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetails(comercio.id); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron comercios que coincidan con tu búsqueda.
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
