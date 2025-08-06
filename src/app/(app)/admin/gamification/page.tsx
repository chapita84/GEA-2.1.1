'use client';

import { useState, useEffect, useCallback, ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Award, Loader2 } from 'lucide-react';
import { getAllLevels, createLevel, updateLevel, deleteLevel } from '@/lib/gamification-crud';
import { useToast } from '@/hooks/use-toast';
import { GamificationLevel } from '@/models/gamification_model';
import { gamificationLevels as predefinedLevels } from '@/lib/gamification';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Lista de iconos disponibles para seleccionar
const availableIcons = [
  'Sprout', 'Shield', 'HelpingHand', 'Recycle', 'Zap', 'Leaf', 
  'Globe', 'Sun', 'Gem', 'Crown', 'Star', 'Trophy'
];

// Paleta de colores predefinida para los iconos
const colorPalette = [
  { name: 'Verde', value: 'text-green-500' },
  { name: 'Azul', value: 'text-blue-500' },
  { name: 'Rosa', value: 'text-rose-500' },
  { name: 'Turquesa', value: 'text-teal-500' },
  { name: 'Ámbar', value: 'text-amber-500' },
  { name: 'Lima', value: 'text-lime-600' },
  { name: 'Índigo', value: 'text-indigo-500' },
  { name: 'Naranja', value: 'text-orange-500' },
  { name: 'Púrpura', value: 'text-purple-500' },
  { name: 'Rojo', value: 'text-red-600' },
];

export default function GamificationManagementPage() {
  const [levels, setLevels] = useState<GamificationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<GamificationLevel | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GamificationLevel | null>(null);
  const [formData, setFormData] = useState<Partial<GamificationLevel>>({});
  const { toast } = useToast();

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      const levelsData = await getAllLevels();
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading levels:', error);
      toast({ title: "Error al cargar niveles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  const handleSeedLevels = useCallback(async () => {
    if (levels.length > 0) {
      toast({
        title: "Acción no permitida",
        description: "Ya existen niveles. Elimínelos primero si desea recargar.",
        variant: "destructive",
      });
      return;
    }

    setIsSeeding(true);
    try {
      // ✅ CORRECCIÓN: Se pasa el objeto 'level' directamente a createLevel
      for (const level of predefinedLevels) {
        await createLevel(level);
      }
      toast({
        title: "Niveles Cargados",
        description: "Los 10 niveles de gamificación han sido cargados.",
      });
      loadLevels();
    } catch (error) {
      console.error("Error al cargar los niveles:", error);
      toast({
        title: "Error al Cargar",
        description: "No se pudieron cargar los niveles predefinidos.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  }, [levels.length, loadLevels, toast]);

  const handleSave = useCallback(async () => {
    try {
      if (formData.level == null || !formData.title || formData.minPoints == null || !formData.icon || !formData.color) {
        toast({ title: "Campos Incompletos", description: "Todos los campos son obligatorios.", variant: "destructive" });
        return;
      }

      const dataToSave: Omit<GamificationLevel, 'id'> = {
        level: Number(formData.level),
        title: formData.title,
        minPoints: Number(formData.minPoints),
        icon: formData.icon,
        color: formData.color,
      };

      if (selectedLevel) {
        await updateLevel(selectedLevel.id!, dataToSave);
        toast({ title: "Nivel Actualizado" });
      } else {
        await createLevel(dataToSave);
        toast({ title: "Nivel Creado" });
      }

      setIsModalOpen(false);
      loadLevels();
    } catch (error) {
      console.error('Error saving level:', error);
      toast({ title: "Error al Guardar", variant: "destructive" });
    }
  }, [formData, selectedLevel, loadLevels, toast]);

  const handleDelete = useCallback(async () => {
    if (!levelToDelete) return;
    try {
      await deleteLevel(levelToDelete.id!);
      toast({
        title: "Nivel Eliminado",
        description: `El nivel ${levelToDelete.level} ha sido eliminado.`,
      });
      setLevelToDelete(null);
      loadLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      toast({ title: "Error al Eliminar", variant: "destructive" });
    }
  }, [levelToDelete, loadLevels, toast]);

  const openModal = (level: GamificationLevel | null = null) => {
    setSelectedLevel(level);
    setFormData(level ? { ...level } : {
      level: (levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1),
      title: '',
      minPoints: 0,
      icon: 'Sprout',
      color: 'text-green-500',
    });
    setIsModalOpen(true);
  };

  const renderIcon = (iconName?: string, color?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName] as ElementType;
    return IconComponent ? <IconComponent className={cn("h-5 w-5", color)} /> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gamificación</h1>
          <p className="text-muted-foreground">
            Define los niveles y recompensas del sistema de gamificación de GEA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {levels.length === 0 && !loading && (
            <Button onClick={handleSeedLevels} disabled={isSeeding}>
              {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cargar Niveles Predefinidos
            </Button>
          )}
          <Button onClick={() => openModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Nivel
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Niveles de Gamificación ({levels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Icono</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Puntos Mínimos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.level}</TableCell>
                    <TableCell>{renderIcon(level.icon, level.color)}</TableCell>
                    <TableCell>{level.title}</TableCell>
                    <TableCell>{level.minPoints}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openModal(level)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setLevelToDelete(level)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedLevel ? 'Editar' : 'Nuevo'} Nivel</DialogTitle>
            <DialogDescription>
              Completa la información del nivel de gamificación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="level">Nivel *</Label>
              <Input id="level" type="number" value={formData.level || ''} onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}/>
            </div>
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })}/>
            </div>
            <div>
              <Label htmlFor="minPoints">Puntos Mínimos *</Label>
              <Input id="minPoints" type="number" value={formData.minPoints || 0} onChange={(e) => setFormData({ ...formData, minPoints: Number(e.target.value) })}/>
            </div>
            <div>
              <Label htmlFor="icon">Icono *</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger id="icon"><SelectValue placeholder="Selecciona un icono" /></SelectTrigger>
                <SelectContent>
                  {availableIcons.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        {renderIcon(iconName)}
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color del Icono</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger id="color"><SelectValue placeholder="Selecciona un color" /></SelectTrigger>
                <SelectContent>
                  {colorPalette.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full", color.value.replace('text-', 'bg-'))} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              {selectedLevel ? 'Guardar Cambios' : 'Crear Nivel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!levelToDelete} onOpenChange={() => setLevelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el nivel {levelToDelete?.level}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
