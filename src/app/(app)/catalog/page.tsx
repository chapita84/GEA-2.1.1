'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/gea/product-card'; // Asumimos que este componente existe
import { getAllProducts } from '@/lib/products-crud';
import { Product } from '@/models/product_model';
import { useAuth } from '@/context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase-client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToRedeem, setProductToRedeem] = useState<Product | null>(null);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleRedeem = useCallback(async () => {
    if (!user || !productToRedeem) return;

    try {
      const redeemFunction = httpsCallable(functions, 'redeemProduct');
      await redeemFunction({ userId: user.uid, productId: productToRedeem.id });
      
      // Actualizar las monedas del usuario en el contexto local
      const newCoinsAmount = (user.greenCoins || 0) - productToRedeem.coinsRequired;
      updateUser({ greenCoins: newCoinsAmount });
      
      toast({
        title: "¡Canje Exitoso!",
        description: `Has canjeado "${productToRedeem.name}". Te quedan ${newCoinsAmount} Monedas Verdes.`,
      });
      
      // Actualizar la lista de productos para reflejar el stock
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      
    } catch (error: any) {
      console.error("Error en el canje:", error);
      let errorMessage = "No se pudo completar la operación.";
      
      if (error.code === 'functions/failed-precondition') {
        if (error.message.includes('Monedas insuficientes')) {
          errorMessage = "No tienes suficientes Monedas Verdes para este canje.";
        } else if (error.message.includes('sin stock')) {
          errorMessage = "Este producto ya no está disponible.";
        }
      }
      
      toast({
        title: "Error en el Canje",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProductToRedeem(null);
    }
  }, [user, productToRedeem, updateUser, toast]);

  if (loading) return <div>Cargando catálogo...</div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Catálogo de Recompensas
          </h1>
          <p className="text-muted-foreground">
            Canjea tus Monedas Verdes por increíbles productos y beneficios sostenibles.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Tu saldo</p>
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <span>🪙</span>
            <span>{user?.greenCoins || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground">Monedas Verdes</p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            {...product} // ✅ CORRECCIÓN: Se pasan las propiedades del producto individualmente
            userCoins={user?.greenCoins || 0}
            onRedeemClick={() => setProductToRedeem(product)}
          />
        ))}
      </div>

      <AlertDialog open={!!productToRedeem} onOpenChange={() => setProductToRedeem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Canje?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de canjear "{productToRedeem?.name}" por {productToRedeem?.coinsRequired} Monedas Verdes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedeem}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
