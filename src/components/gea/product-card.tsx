'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Leaf, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';


type ProductCardProps = {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageHint?: string;
  rubro: string; // Cambiado de category a rubro
  coinsRequired: number;
  stock?: number;
  ecologicalImpact?: string;
  userCoins: number;
  onRedeemClick: () => void;
};

export function ProductCard({
  id,
  name,
  description,
  imageUrl,
  imageHint,
  rubro, // Cambiado de category a rubro
  coinsRequired,
  stock,
  ecologicalImpact,
  userCoins,
  onRedeemClick,
}: ProductCardProps) {
  const { toast } = useToast();

  const canAfford = userCoins >= coinsRequired;
  const isOutOfStock = stock !== undefined && stock <= 0;

  const handleRedeem = () => {
    if (!canAfford) {
      toast({
        title: "Monedas Insuficientes",
        description: `Necesitas ${coinsRequired - userCoins} monedas más.`,
        variant: "destructive",
      });
      return;
    }
    
    if (isOutOfStock) {
      toast({
        title: "Sin Stock",
        description: "Este producto no está disponible.",
        variant: "destructive",
      });
      return;
    }

    onRedeemClick();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Image
          src={imageUrl || '/placeholder-product.png'}
          data-ai-hint={imageHint}
          alt={name}
          width={400}
          height={250}
          className="aspect-video w-full rounded-t-lg object-cover"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Badge variant="secondary" className="mb-2">
          {rubro}
        </Badge>
        <h3 className="text-lg font-semibold font-headline">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {ecologicalImpact && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <Leaf className="h-4 w-4" />
            {ecologicalImpact}
          </p>
        )}
        {stock !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            Stock: {stock} disponibles
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Leaf className="h-5 w-5" />
          <span>{coinsRequired}</span>
        </div>
        <Button 
          onClick={handleRedeem}
          disabled={!canAfford || isOutOfStock}
          variant={canAfford && !isOutOfStock ? "default" : "outline"}
        >
          {isOutOfStock ? "Sin Stock" : !canAfford ? "Sin Monedas" : "Canjear"}
        </Button>
      </CardFooter>
    </Card>
  );
}
