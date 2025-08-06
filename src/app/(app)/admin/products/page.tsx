'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/lib/products-crud';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/models/product_model';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setFormData(product ? { ...product } : { name: '', category: '', coinsRequired: 0, stock: 0 });
    setSelectedFile(null);
    setPreviewUrl(product?.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for products
        toast({
          title: "Archivo muy grande",
          description: "Por favor, selecciona una imagen de menos de 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.category || !formData.coinsRequired) {
      toast({
        title: "Error de Validación",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = formData.imageUrl;

      // Si hay un archivo seleccionado, subirlo
      if (selectedFile) {
        imageUrl = await uploadProductImage(selectedFile);
      }

      const productData = { ...formData, imageUrl };

      if (selectedProduct) {
        // Actualizar producto existente
        await updateProduct(selectedProduct.id!, productData);
        toast({
          title: "Producto Actualizado",
          description: `${formData.name} ha sido actualizado exitosamente.`,
        });
      } else {
        // Crear nuevo producto
        await createProduct(productData as Product);
        toast({
          title: "Producto Creado",
          description: `${formData.name} ha sido creado exitosamente.`,
        });
      }
      
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error al Guardar",
        description: error.message || "No se pudo guardar el producto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [formData, selectedProduct, selectedFile, loadProducts, toast]);

  const handleDelete = useCallback(async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id!);
      toast({
        title: "Producto Eliminado",
        description: `${product.name} ha sido eliminado exitosamente.`,
      });
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error al Eliminar",
        description: error.message || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  }, [loadProducts, toast]);

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
        <CardContent>
          {loading ? <p>Cargando...</p> :
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Costo (MV)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.coinsRequired}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openModal(p)} className="mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Categoría del producto"
              />
            </div>
            <div>
              <Label htmlFor="coinsRequired">Monedas Verdes Requeridas</Label>
              <Input
                id="coinsRequired"
                type="number"
                value={formData.coinsRequired || 0}
                onChange={(e) => setFormData({ ...formData, coinsRequired: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Disponible</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Imagen del Producto</Label>
              <div className="space-y-3">
                {previewUrl && (
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona una imagen (máximo 5MB). La imagen se comprimirá automáticamente.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
