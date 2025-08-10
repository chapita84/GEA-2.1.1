'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Leaf, Gift, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-700">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-16 flex items-center bg-white/80 backdrop-blur-md border-b">
        <Link href="#" className="flex items-center justify-center">
          <Image src="/logoBig.png" alt="Logo GEA" width={40} height={40} className="mr-2" />
          <span className="text-xl font-bold font-headline">
            <span className="text-emerald-600">GEA</span> <span className="text-blue-700">BBVA</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            ¿Cómo Funciona?
          </Link>
          <Link
            href="#impact"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Nuestro Impacto
          </Link>
          <Button asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-black tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-800">
                  Tus compras sostenibles, ahora tienen recompensa.
                </h1>
                <p className="max-w-[600px] text-slate-500 md:text-xl">
                  Únete a GEA, la comunidad donde cada acción consciente te acerca a beneficios exclusivos en comercios locales.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/signup">Crea tu cuenta gratis</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/Inicio.png"
                width={600}
                height={400}
                alt="Una persona regando una planta que crece de una moneda"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-semibold">
                El Ciclo Virtuoso
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-slate-800">
                ¿Cómo Funciona?
              </h2>
              <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                En solo tres simples pasos, comienzas a generar un impacto positivo y a disfrutar de sus beneficios.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-2 text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">1. Descubre y Compra</h3>
                <p className="text-sm text-slate-500">
                  Explora nuestro mapa de comercios verdes y realiza tus compras como siempre.
                </p>
              </div>
              <div className="grid gap-2 text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">2. Acumula Monedas Verdes</h3>
                <p className="text-sm text-slate-500">
                  Por cada compra en un comercio sostenible, ganas Monedas Verdes (MV).
                </p>
              </div>
              <div className="grid gap-2 text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">3. Canjea Beneficios</h3>
                <p className="text-sm text-slate-500">
                  Usa tus monedas para obtener descuentos y productos exclusivos en nuestro catálogo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-slate-800 mb-4">Únete a una Comunidad en Crecimiento</h2>
            <p className="max-w-3xl mx-auto text-slate-500 md:text-xl mb-12">
              Cada acción cuenta. Juntos, estamos construyendo un futuro más sostenible.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-5xl font-extrabold text-emerald-600">+1,200</p>
                <p className="text-lg text-slate-600">Usuarios Comprometidos</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-5xl font-extrabold text-emerald-600">+50</p>
                <p className="text-lg text-slate-600">Comercios Verdes Afiliados</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-5xl font-extrabold text-emerald-600">+10,000</p>
                <p className="text-lg text-slate-600">Monedas Verdes Generadas</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-5xl text-slate-800 mb-12">Lo que dicen nuestros usuarios</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                    <div>
                      <p className="font-semibold text-slate-800">Ana Pérez</p>
                      <p className="text-sm text-slate-500">Miembro desde 2024</p>
                    </div>
                  </div>
                  <p className="text-slate-600">"GEA me ayudó a descubrir tiendas locales increíbles que no conocía. ¡Y las recompensas son un gran incentivo!"</p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                    <div>
                      <p className="font-semibold text-slate-800">Carlos Gómez</p>
                      <p className="text-sm text-slate-500">Miembro desde 2025</p>
                    </div>
                  </div>
                  <p className="text-slate-600">"Es la primera vez que una app realmente me motiva a ser más consciente con mis compras. El sistema de niveles es genial."</p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                    <div>
                      <p className="font-semibold text-slate-800">Laura Fernández</p>
                      <p className="text-sm text-slate-500">Miembro desde 2024</p>
                    </div>
                  </div>
                  <p className="text-slate-600">"Canjeé mis primeras monedas por un descuento en mi cafetería orgánica favorita. ¡Funciona de maravilla!"</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-slate-800">
                ¿Listo para empezar a generar un impacto positivo?
              </h2>
              <p className="mx-auto max-w-[600px] text-slate-500 md:text-xl">
                Crea tu cuenta en menos de un minuto y comienza a ser parte del cambio.
              </p>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/signup">Únete a la Comunidad GEA ahora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-slate-500">
          &copy; 2025 GEA: Acciones por una Tierra Verde. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-slate-600">
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-slate-600">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
