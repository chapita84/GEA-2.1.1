import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Map, MessageCircle, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background text-foreground border-b shadow-md">
        <Link href="#" className="flex items-center justify-center">
          <Image src="/logoBig.png" alt="Logo GEA" width={48} height={48} className="mr-2" />
          <span className="text-xl font-bold font-headline">
            <span className="text-primary">GEA</span> <span className="text-secondary">BBVA</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Características
          </Link>
          <Link
            href="#vision"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Nuestra Visión
          </Link>
          <Button asChild>
            <Link href="/login">Iniciar Sesion</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Transforma Tus Acciones en un Planeta Más Verde
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    GEA es el ecosistema digital que te inspira, educa y recompensa por adoptar un estilo de vida sostenible.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Comenzar</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/Inicio.png" // <-- Asegúrate de que esta imagen esté en la carpeta public
                data-ai-hint="Estilo de Vida Sostenible"
                width={600}
                height={400}
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Características Clave
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Vive Sostenible, Obtén Recompensas
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestra plataforma te proporciona las herramientas e incentivos para generar un impacto en el mundo real.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center">
                <Star className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Gana Monedas Verdes</h3>
                <p className="text-sm text-foreground/80">
                  Registra tus acciones y transacciones sostenibles para ganar "Monedas
                  Verdes" (MV), tu recompensa por marcar la diferencia.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <CheckCircle className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Canjea Beneficios</h3>
                <p className="text-sm text-foreground/80">
                  Canjea tus Monedas Verdes por productos y descuentos exclusivos
                  de nuestra red de vendedores sostenibles.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Map className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Descubre Vendedores</h3>
                <p className="text-sm text-foreground/80">
                  Usa nuestro mapa interactivo para encontrar y apoyar a negocios locales y
                  ecológicos cerca de ti.
                </p>
              </div>
              <div className="grid gap-1 text-center lg:col-start-2">
                <MessageCircle className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">IA Chat Verde</h3>
                <p className="text-sm text-foreground/80">
                  Obtén consejos de sostenibilidad y respuestas al instante de nuestro amigable
                  asistente de IA, potenciado por Gemini de Google.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="vision" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Catalizando el Impacto Colectivo
              </h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nuestra visión es transformar las acciones individuales en una fuerza
                colectiva medible para el bien, creando una comunidad global dedicada
                a un futuro sostenible.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/50">
          &copy; 2025 GEA: Acciones por una Tierra Verde. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
