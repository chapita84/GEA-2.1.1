'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Loader2, Leaf } from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/lib/products-crud';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/models/product_model';
import { RUBROS_PRODUCTOS } from '@/data/rubros';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({ title: "Error al cargar productos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    const today = new Date().toISOString().split('T')[0];
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    setFormData(product ? { ...product } : { 
      name: '', 
      description: '',
      rubro: '', 
      coinsRequired: 0, 
      stock: 1,
      status: 'active',
      validFrom: today,
      validTo: oneMonthLater.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSave = useCallback(async () => {
    try {
      if (!formData.name || !formData.rubro || formData.coinsRequired == null || formData.stock == null || !formData.validFrom || !formData.validTo) {
        toast({ title: "Campos Incompletos", description: "Por favor, completa todos los campos obligatorios.", variant: "destructive" });
        return;
      }

      const dataToSave: Omit<Product, 'id'> = {
        name: formData.name,
        description: formData.description || '',
        rubro: formData.rubro,
        coinsRequired: Number(formData.coinsRequired),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl || '',
        status: formData.status || 'active',
        validFrom: formData.validFrom,
        validTo: formData.validTo,
      };

      if (selectedProduct) {
        await updateProduct(selectedProduct.id!, dataToSave);
        toast({ title: "Producto Actualizado" });
      } else {
        await createProduct(dataToSave);
        toast({ title: "Producto Creado" });
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      toast({ title: "Error al Guardar", variant: "destructive" });
    }
  }, [formData, selectedProduct, loadProducts, toast]);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await deleteProduct(id);
        loadProducts();
        toast({ title: "Producto Eliminado" });
      } catch (error) {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { timeZone: 'UTC' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos del Catálogo</h1>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Costo (MV)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600">
                        <Leaf className="h-4 w-4" />
                        <span>{p.coinsRequired}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{formatDate(p.validFrom)} - {formatDate(p.validTo)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'active' ? 'default' : 'destructive'}>
                        {p.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openModal(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id!)}>
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
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar' : 'Nuevo'} Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles del producto o beneficio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre *</Label>
              <Input id="name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descripción</Label>
              <Textarea id="description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rubro" className="text-right">Rubro *</Label>
              <div className="col-span-3">
                <Select value={formData.rubro || ''} onValueChange={(value) => setFormData({...formData, rubro: value})}>
                  <SelectTrigger id="rubro">
                    <SelectValue placeholder="Selecciona un rubro" />
                  </SelectTrigger>
                  <SelectContent>
                    {RUBROS_PRODUCTOS.map((rubro) => (
                      <SelectItem key={rubro} value={rubro}>
                        {rubro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coinsRequired" className="text-right">Costo (MV) *</Label>
              <Input id="coinsRequired" type="number" value={formData.coinsRequired || 0} onChange={e => setFormData({...formData, coinsRequired: Number(e.target.value)})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stock *</Label>
              <Input id="stock" type="number" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validFrom" className="text-right">Vigente Desde *</Label>
              <Input id="validFrom" type="date" value={formData.validFrom || ''} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validTo" className="text-right">Vigente Hasta *</Label>
              <Input id="validTo" type="date" value={formData.validTo || ''} onChange={e => setFormData({...formData, validTo: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Estado</Label>
              <Switch id="status" checked={formData.status === 'active'} onCheckedChange={checked => setFormData({...formData, status: checked ? 'active' : 'inactive'})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
