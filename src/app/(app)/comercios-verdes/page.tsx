'use client';

import { useState, useEffect, useRef } from 'react';
import {
  createComercioVerde,
  getAllComercios,
  updateComercioVerde,
  deleteComercioVerde,
} from '@/lib/comercios-verdes-crud';
import {
  ComercioVerde,
  ComercioVerdeConId,
} from '@/models/comercio_verde_model';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { AlertTriangle, CheckCircle, Pencil, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { validarCuit } from '@/lib/cuit-validator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; // ✅ Se importa useToast

export default function AdminComerciosVerdes() {
  const [comercios, setComercios] = useState<ComercioVerdeConId[]>([]);
  const [currentComercio, setCurrentComercio] =
    useState<Partial<ComercioVerdeConId> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cuitWarning, setCuitWarning] = useState<string>('');
  const { toast } = useToast(); // ✅ Se inicializa toast

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setCurrentComercio(prev => ({
          ...prev,
          address: place.formatted_address,
        }));
      }
    }
  };

  useEffect(() => {
    const fetchComercios = async () => {
      try {
        setIsLoading(true);
        const comerciosData = await getAllComercios();
        setComercios(comerciosData);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error de Carga",
          description: "No se pudieron cargar los comercios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchComercios();
  }, [toast]);

  useEffect(() => {
    if (currentComercio?.cuit && currentComercio.cuit.length >= 11) {
      if (!validarCuit(currentComercio.cuit)) {
        setCuitWarning('El formato del CUIT parece ser inválido.');
      } else {
        setCuitWarning('');
      }
    } else {
      setCuitWarning('');
    }
  }, [currentComercio?.cuit]);

  const handleEdit = (comercio: ComercioVerdeConId) => {
    setCurrentComercio(comercio);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setCurrentComercio({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este comercio?')) {
      try {
        await deleteComercioVerde(id);
        setComercios(comercios.filter(c => c.id !== id));
        toast({ title: "Comercio Eliminado" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    }
  };

  const geocodeAddress = (address: string): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!isLoaded) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(new Error('Geocoding failed with status: ' + status));
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ✅ CORRECCIÓN: Se usa toast para la validación
    if (!currentComercio?.name || !currentComercio?.address || !currentComercio?.category) {
      toast({
        title: "Campos Incompletos",
        description: "Nombre, dirección y categoría son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { lat, lng } = await geocodeAddress(currentComercio.address);

      const comercioData: Omit<ComercioVerde, 'location' | 'id'> = {
        name: currentComercio.name,
        address: currentComercio.address,
        phone: currentComercio.phone || '',
        description: currentComercio.description || '',
        imageUrl: currentComercio.imageUrl || '',
        tags: currentComercio.tags || [],
        category: currentComercio.category,
        cuit: currentComercio.cuit || '',
        isSustainable: currentComercio.isSustainable || false,
      };

      if (currentComercio.id) {
        await updateComercioVerde(currentComercio.id, {
          ...comercioData,
          latitude: lat,
          longitude: lng,
        });
        toast({ title: "Comercio Actualizado" });
      } else {
        await createComercioVerde({
          ...comercioData,
          latitude: lat,
          longitude: lng,
        });
        toast({ title: "Comercio Creado" });
      }

      setIsDialogOpen(false);
      setCurrentComercio(null);
      const updatedComercios = await getAllComercios();
      setComercios(updatedComercios);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al Guardar",
        description: "Verifique la dirección e intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentComercio(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loadError) return <div>Error al cargar Google Maps.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administrar Comercios Verdes</h1>
        <Button onClick={handleCreateNew}>Crear Nuevo Comercio</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>CUIT</TableHead>
                  <TableHead>Sostenible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comercios.map(comercio => (
                  <TableRow key={comercio.id}>
                    <TableCell className="font-medium">{comercio.name}</TableCell>
                    <TableCell>{comercio.category}</TableCell>
                    <TableCell>{comercio.cuit || '-'}</TableCell>
                    <TableCell>
                      {comercio.isSustainable && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Sí
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(comercio)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(comercio.id)}>
                          Eliminar
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentComercio?.id ? 'Editar' : 'Crear'} Comercio Verde
            </DialogTitle>
          </DialogHeader>
          {isLoaded && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={currentComercio?.name || ''}
                  onChange={e =>
                    setCurrentComercio(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  value={currentComercio?.category || ''}
                  onChange={e =>
                    setCurrentComercio(prev => ({ ...prev, category: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    types: ['address'],
                    componentRestrictions: { country: 'ar' },
                  }}
                >
                  <Input
                    id="address"
                    value={currentComercio?.address || ''}
                    onChange={e =>
                      setCurrentComercio(prev => ({ ...prev, address: e.target.value }))
                    }
                    required
                    placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                  />
                </Autocomplete>
              </div>
              <div>
                <Label htmlFor="cuit">CUIT</Label>
                <Input
                  id="cuit"
                  value={currentComercio?.cuit || ''}
                  onChange={e =>
                    setCurrentComercio(prev => ({ ...prev, cuit: e.target.value }))
                  }
                  placeholder="XX-XXXXXXXX-X"
                />
                {cuitWarning && (
                  <div className="mt-2 flex items-center text-sm text-yellow-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>{cuitWarning}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={currentComercio?.phone || ''}
                  onChange={e =>
                    setCurrentComercio(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={currentComercio?.description || ''}
                  onChange={e =>
                    setCurrentComercio(prev => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="image">Imagen</Label>
                <Input id="image" type="file" onChange={handleFileChange} />
                {currentComercio?.imageUrl && (
                  <img
                    src={currentComercio.imageUrl}
                    alt="Preview"
                    className="mt-2 h-32 w-32 object-cover"
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSustainable"
                  checked={currentComercio?.isSustainable || false}
                  onCheckedChange={checked =>
                    setCurrentComercio(prev => ({ ...prev, isSustainable: checked }))
                  }
                />
                <Label htmlFor="isSustainable">Es un Comercio Sostenible</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
