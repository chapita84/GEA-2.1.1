'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers } from '@/lib/users-crud-complete';
import { User } from '@/models/user_model';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function UserDebugPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      console.log('Usuarios cargados:', allUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Usuarios y Fotos de Perfil</CardTitle>
          <CardDescription>
            Herramienta para verificar el estado de las fotos de perfil de los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadUsers} disabled={loading} className="mb-4">
            {loading ? 'Cargando...' : 'Recargar usuarios'}
          </Button>
          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.uid} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoUrl || undefined} />
                    <AvatarFallback>
                      {user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <strong>UID:</strong> {user.uid}
                    </div>
                    <div>
                      <strong>Nombre:</strong> {user.displayName || 'Sin nombre'}
                    </div>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Es Admin:</strong> {user.isAdmin ? 'Sí' : 'No'}
                    </div>
                    <div>
                      <strong>photoUrl:</strong> 
                      <span className="ml-2 text-sm">
                        {user.photoUrl ? (
                          <span className="text-green-600">
                            {user.photoUrl.length > 50 
                              ? `${user.photoUrl.substring(0, 50)}...` 
                              : user.photoUrl
                            }
                          </span>
                        ) : (
                          <span className="text-red-600">No tiene foto</span>
                        )}
                      </span>
                    </div>
                    {/* @ts-ignore - Para verificar si existe la propiedad antigua */}
                    {user.photoUrl && (
                      <div>
                        <strong className="text-yellow-600">photoUrl (antigua):</strong> 
                        <span className="ml-2 text-sm text-yellow-600">
                          {/* @ts-ignore */}
                          {user.photoUrl.length > 50 
                            ? `${user.photoUrl.substring(0, 50)}...` 
                            : user.photoUrl
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {users.length === 0 && !loading && (
            <p className="text-center text-muted-foreground">No se encontraron usuarios</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
