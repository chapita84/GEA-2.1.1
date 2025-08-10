'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Award, Edit, Gift, Shield, Star, Trophy, Loader2, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadProfileImage, updateUser as updateUserInDb, updateUserPassword } from '@/lib/users-crud-complete';
import { useAuth, CustomUser } from '@/context/AuthContext';
import { gamificationLevels, calculateLevel } from '@/lib/gamification';
import Link from 'next/link';
import { updateClient } from '@/lib/client-crud';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { app } from '@/lib/firebase-client';
import { User } from '@/models/user_model';
import { Client } from '@/models/client_model';


// Datos estáticos mantenidos para las insignias y historial
const badges = [
  { name: 'Iniciador de Reciclaje', icon: <Star className="h-5 w-5 text-accent" /> },
  { name: '5 Acciones Registradas', icon: <Trophy className="h-5 w-5 text-accent" /> },
  { name: 'Ayudante Comunitario', icon: <Shield className="h-5 w-5 text-accent" /> },
];

const redemptionHistory = [
  { item: 'Cupón 10% Descuento', date: '2025-06-15', cost: '100 MV' },
  { item: 'Taza de Café de Bambú', date: '2025-05-20', cost: '250 MV' },
  { item: 'Bolsa de Tela', date: '2025-04-10', cost: '150 MV' },
];


export default function ProfilePage() {
  const { user, isLoading, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CustomUser>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        photoUrl: user.photoUrl || '',
      });
    }
  }, [user, isEditDialogOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Archivo muy grande",
                description: "Por favor, selecciona una imagen de menos de 2MB.",
                variant: "destructive",
            });
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleProfileUpdate = async () => {
      if (!user) return;

      setIsUploading(true);
      try {
          let newPhotoUrl = user.photoUrl;

          if (selectedFile) {
            newPhotoUrl = await uploadProfileImage({ userId: user.uid, file: selectedFile });
          }

          const userDataToUpdate: Partial<User> = {
            displayName: formData.displayName ?? undefined,
            photoUrl: newPhotoUrl ?? undefined,
          };
          
          const clientDataToUpdate: Partial<Client> = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            direccion: formData.direccion,
          };

          await updateUserInDb(user.uid, userDataToUpdate);
          await updateClient(user.uid, clientDataToUpdate);
          
          updateUser({ ...userDataToUpdate, ...clientDataToUpdate });

          toast({
              title: "¡Éxito!",
              description: "Tu perfil ha sido actualizado.",
              className: "bg-green-500 text-white",
          });
          
          setIsEditDialogOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);

      } catch (error) {
          console.error("Error al actualizar el perfil:", error);
          toast({
              title: "Error",
              description: "No se pudo actualizar tu perfil.",
              variant: "destructive",
          });
      } finally {
          setIsUploading(false);
      }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (passwordData.new.length < 6) {
      toast({ title: "Contraseña nueva muy corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: "Las contraseñas nuevas no coinciden", variant: "destructive" });
      return;
    }

    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No hay usuario autenticado.");

      const credential = EmailAuthProvider.credential(user.email!, passwordData.current);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, passwordData.new);

      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada con éxito." });
      setIsPasswordModalOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error("Error al cambiar la contraseña:", error);
      if (error.code === 'auth/wrong-password') {
        toast({ title: "Error", description: "La contraseña actual es incorrecta.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "No se pudo cambiar la contraseña.", variant: "destructive" });
      }
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (createdAt: any): string => {
    if (!createdAt) return 'Fecha no disponible';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No se pudieron cargar los datos del usuario.</p>
            <Button variant="outline" onClick={() => window.location.href = '/login'} className="mt-4">
              Ir a Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userGreenCoins = user.greenCoins || 0;
  const currentLevel = calculateLevel(userGreenCoins);
  const nextLevel = gamificationLevels.find(l => l.level === currentLevel.level + 1);
  
  const pointsForCurrentLevel = currentLevel.minPoints;
  const pointsForNextLevel = nextLevel ? nextLevel.minPoints : currentLevel.minPoints;
  
  const pointsRange = pointsForNextLevel - pointsForCurrentLevel;
  const userProgressInLevel = userGreenCoins - pointsForCurrentLevel;
  
  const progressValue = pointsRange > 0
    ? (userProgressInLevel / pointsRange) * 100
    : 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary">
            {user.photoUrl && user.photoUrl !== 'https://via.placeholder.com/150' ? (
              <AvatarImage 
                src={user.photoUrl} 
                alt={user.displayName || 'Avatar'}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {/* ✅ CORRECCIÓN: Se asegura que el valor sea 'null' si es 'undefined' */}
              {getInitials(user.displayName || null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold font-headline">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <p className="text-sm">
                Se unió el {formatJoinDate(user.createdAt)}
              </p>
              {user.isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-sm">
                {userGreenCoins} Monedas Verdes
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Actualiza tu información personal y tu foto de perfil.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto p-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nombre a Mostrar</Label>
                    <Input id="displayName" value={formData.displayName || ''} onChange={(e) => setFormData({...formData, displayName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" value={formData.nombre || ''} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" value={formData.apellido || ''} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" value={formData.telefono || ''} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" value={formData.direccion || ''} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5 pt-4 border-t">
                    <Label htmlFor="picture">Nueva Foto de Perfil</Label>
                    <Input id="picture" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleFileSelect} />
                  </div>
                  {previewUrl && (
                    <div className="flex justify-center">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={previewUrl} alt="Previsualización" className="object-cover" />
                        <AvatarFallback>Previsualización</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleProfileUpdate} 
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Cambiar Contraseña
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Cambiar Contraseña</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                    <Input id="confirm-password" type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePasswordChange}>Guardar Contraseña</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Link href="/gamification" className="hover:opacity-80 transition-opacity">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Gamificación
              </CardTitle>
            </Link>
            <CardDescription>
              Tu progreso en la comunidad de GEA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium">
                  Nivel {currentLevel.level}: {currentLevel.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userGreenCoins} / {pointsForNextLevel} XP
                </p>
              </div>
              <Progress value={progressValue} />
            </div>
            <div>
              <h4 className="font-medium mb-3">Insignias Ganadas</h4>
              <div className="flex flex-wrap gap-4">
                {badges.map((badge) => (
                  <div key={badge.name} className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-accent/10 rounded-full border-2 border-accent/20">
                      {badge.icon}
                    </div>
                    <span className="text-xs text-center text-muted-foreground">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Monedas Verdes:</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {userGreenCoins} MV
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Historial de Canjes
            </CardTitle>
            <CardDescription>
              Tus recompensas canjeadas recientemente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptionHistory.map((item) => (
                  <TableRow key={item.item}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right font-mono">{item.cost}</TableCell>
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
