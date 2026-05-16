"use client";
import Link from "next/link";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#0066FF] to-cyan-400 bg-clip-text text-transparent">
          Sobre Nosotros
        </h1>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            ¡Bienvenido a <strong>Aclasif</strong>! Somos la plataforma líder en clasificados virtuales de Paraguay, diseñada para que puedas comprar y vender de forma 100% segura.
          </p>
          <p>
            A diferencia de los clasificados tradicionales donde te exponés a fraudes o estafas al tratar con desconocidos, en Aclasif actuamos como el <strong>único intermediario oficial</strong> en cada transacción. Nosotros nos encargamos de recibir y resguardar el pago hasta que el producto esté en tus manos, garantizando total tranquilidad tanto al comprador como al vendedor.
          </p>
          <p>
            Nuestra misión es modernizar el comercio electrónico en el país, ofreciendo un entorno transparente, rápido y confiable para todos los paraguayos.
          </p>
        </div>
      </div>
    </div>
  );
}