'use client';

import { useEffect } from 'react';
import Head from 'next/head';

// Declarar tipos globales para Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

export default function AboutGeaPage() {
  useEffect(() => {
    // Cargar Chart.js desde CDN
    if (typeof window !== 'undefined' && !window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        initCharts();
      };
      document.head.appendChild(script);
    } else if (window.Chart) {
      initCharts();
    }

    function initCharts() {
      const Chart = window.Chart;
      
      // Prevenimos la creación de gráficos duplicados si el componente se re-renderiza
      let gamificationChartInstance = Chart.getChart('gamificationChart');
      if (gamificationChartInstance) {
        gamificationChartInstance.destroy();
      }
      let rewardsChartInstance = Chart.getChart('rewardsChart');
      if (rewardsChartInstance) {
        rewardsChartInstance.destroy();
      }
    
    const processLabel = (label: string): string | string[] => {
        if (label.length <= 16) {
            return label;
        }
        const words = label.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            if ((currentLine + word).length > 16) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
            currentLine += `${word} `;
        }
        lines.push(currentLine.trim());
        return lines;
    };

    const tooltipTitleCallback = (tooltipItems: any[]): string => {
        const item = tooltipItems[0];
        let label = item.chart.data.labels[item.dataIndex];
        return Array.isArray(label) ? label.join(' ') : label;
    };

    // Gamification Chart
    const gamificationCtx = (document.getElementById('gamificationChart') as HTMLCanvasElement)?.getContext('2d');
    if (gamificationCtx) {
        new Chart(gamificationCtx, {
            type: 'bar',
            data: {
                labels: [
                    'Nivel 1: Explorador Ecológico', 'Nivel 2: Guardián Verde', 'Nivel 3: Activista Sostenible',
                    'Nivel 4: Héroe del Reciclaje', 'Nivel 5: Eco-Guerrero', 'Nivel 6: Maestro Compostador',
                    'Nivel 7: Embajador del Planeta', 'Nivel 8: Visionario Verde', 'Nivel 9: Campeón de la Sostenibilidad',
                    'Nivel 10: Leyenda de GEA'
                ].map(processLabel),
                datasets: [{
                    label: 'Puntos Mínimos Requeridos',
                    data: [0, 500, 1500, 3000, 5000, 7500, 10000, 15000, 20000, 30000],
                    backgroundColor: '#10b981', // emerald-500
                    borderColor: '#047857', // emerald-700
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { title: tooltipTitleCallback } }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: 'rgba(100, 116, 139, 0.1)' },
                        ticks: { color: '#334155' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#334155' }
                    }
                }
            }
        });
    }

    // Rewards Chart
    const rewardsCtx = (document.getElementById('rewardsChart') as HTMLCanvasElement)?.getContext('2d');
    if (rewardsCtx) {
        new Chart(rewardsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Productos Sostenibles', 'Descuentos', 'Donaciones', 'Transporte', 'Jardinería'],
                datasets: [{
                    label: 'Tipos de Recompensa',
                    data: [3, 1, 1, 1, 1],
                    backgroundColor: ['#047857', '#10b981', '#6ee7b7', '#a7f3d0', '#d1fae5'],
                    borderColor: '#FFFFFF',
                    borderWidth: 4,
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#334155' }
                    },
                    tooltip: { callbacks: { title: tooltipTitleCallback } }
                }
            }
        });
      }
    }
  }, []);

  return (
    <>
      <Head>
        <style>{`
          .chart-container {
            position: relative;
            width: 100%;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            height: 400px;
          }
          @media (max-width: 768px) {
            .chart-container {
              height: 350px;
            }
          }
        `}</style>
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 text-slate-700">
        <header className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
                     <span className="text-white text-4xl font-black">G</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-800">
                    Aplicación <span className="text-emerald-600">GEA</span> <span className="text-blue-700">BBVA</span>
                </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto">Una plataforma integral que recompensa las acciones sostenibles, conectando a usuarios conscientes con comercios verdes a través de un innovador sistema de gamificación.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <p className="text-6xl font-extrabold text-emerald-600">10</p>
                <p className="text-lg text-slate-600 font-semibold">Niveles de Gamificación</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <p className="text-6xl font-extrabold text-emerald-600">2</p>
                <p className="text-lg text-slate-600 font-semibold">Roles Principales</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                <p className="text-6xl font-extrabold text-emerald-600">6+</p>
                <p className="text-lg text-slate-600 font-semibold">Módulos de Gestión</p>
            </div>
        </section>
        
        <section className="mb-16">
            <h2 className="text-4xl font-bold text-center text-slate-800 mb-8">El Ecosistema GEA</h2>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
                <div className="flex flex-col md:flex-row justify-around items-center text-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <span className="text-4xl">🧑‍💻</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Usuario Final</h3>
                        <p className="text-slate-500">Participa y Gana</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-lg bg-slate-800 text-white flex flex-col items-center justify-center p-4 shadow-2xl">
                            <span className="text-4xl">🌍</span>
                            <span className="font-bold">Plataforma GEA</span>
                            <span className="text-xs">(Next.js + Firebase)</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                         <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <span className="text-4xl">⚙️</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Administrador</h3>
                        <p className="text-slate-500">Gestiona y Controla</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="mb-16">
            <h2 className="text-4xl font-bold text-center text-slate-800 mb-8">El Viaje del Usuario</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Progreso y Gamificación</h3>
                    <p className="text-slate-500 mb-6">Los usuarios acumulan "Monedas Verdes" (MV) por sus acciones, subiendo de nivel para obtener nuevos títulos y reconocimiento.</p>
                    <div className="chart-container">
                        <canvas id="gamificationChart"></canvas>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Catálogo de Recompensas</h3>
                    <p className="text-slate-500 mb-6">Las monedas pueden ser canjeadas por una variedad de beneficios, incentivando un ciclo continuo de participación sostenible.</p>
                    <div className="chart-container">
                        <canvas id="rewardsChart"></canvas>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="mb-16">
            <h2 className="text-4xl font-bold text-center text-slate-800 mb-8">El Panel del Administrador</h2>
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
                 <p className="text-center text-slate-500 mb-8 max-w-2xl mx-auto">El administrador tiene control total sobre el ecosistema a través de módulos de gestión específicos, asegurando la integridad y el dinamismo de la plataforma.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                    <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">👥</span>
                        <span className="font-semibold text-slate-700">Usuarios</span>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">👤</span>
                        <span className="font-semibold text-slate-700">Clientes</span>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">💳</span>
                        <span className="font-semibold text-slate-700">Transacciones</span>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">🏪</span>
                        <span className="font-semibold text-slate-700">Comercios</span>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">🏆</span>
                        <span className="font-semibold text-slate-700">Gamificación</span>
                    </div>
                     <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
                        <span className="text-3xl mb-2">🎁</span>
                        <span className="font-semibold text-slate-700">Productos</span>
                    </div>
                </div>
            </div>
        </section>

        <section>
             <h2 className="text-4xl font-bold text-center text-slate-800 mb-8">Tecnología y Seguridad</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Arquitectura Tecnológica</h3>
                    <p className="text-slate-500 mb-6">GEA utiliza una arquitectura serverless moderna para garantizar escalabilidad y eficiencia.</p>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-slate-800">Frontend</h4>
                            <p className="text-sm text-slate-500">Next.js 14, TypeScript, Tailwind CSS, shadcn/ui</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Backend</h4>
                            <p className="text-sm text-slate-500">Firebase Cloud Functions (Node.js)</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Base de Datos</h4>
                            <p className="text-sm text-slate-500">Google Firestore (NoSQL)</p>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Inteligencia Artificial</h4>
                            <p className="text-sm text-slate-500">Google Gemini API</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Pilares de Seguridad</h3>
                    <p className="text-slate-500 mb-6">La seguridad se implementa en múltiples capas para proteger los datos de los usuarios y la integridad de la plataforma.</p>
                     <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                            <span className="text-xl mr-3 text-emerald-600">🔐</span>
                            <div>
                                <span className="font-semibold">Firebase Authentication:</span>
                                <span className="text-slate-500"> Gestión segura de contraseñas (hashing y salting) y sesiones.</span>
                            </div>
                        </li>
                        <li className="flex items-start">
                             <span className="text-xl mr-3 text-emerald-600">🛡️</span>
                            <div>
                                <span className="font-semibold">Autorización por Roles:</span>
                                 <span className="text-slate-500"> El acceso a los paneles de administración está restringido a usuarios con el flag `isAdmin`.</span>
                            </div>
                        </li>
                         <li className="flex items-start">
                             <span className="text-xl mr-3 text-emerald-600">🔑</span>
                            <div>
                                <span className="font-semibold">Seguridad de API:</span>
                                 <span className="text-slate-500"> Los endpoints para integraciones externas (n8n) están protegidos con API Keys secretas.</span>
                            </div>
                        </li>
                    </ul>
                </div>
             </div>
        </section>
      </div>
    </>
  );
}
