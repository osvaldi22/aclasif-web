"use client";
import Link from "next/link";

export default function ComoVenderPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#0066FF] to-cyan-400 bg-clip-text text-transparent">
          ¿Cómo vender en Aclasif?
        </h1>
        <p className="text-slate-300 mb-8">Vender tus artículos de forma segura y garantizada es muy simple siguiendo estos pasos:</p>
        
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
            <h3 className="font-bold text-lg text-orange-400 mb-2">1. Publicá tu artículo</h3>
            <p className="text-slate-300 text-sm">Subí las fotos de tu producto, ponéle un título claro, descripción detallada y el precio en Guaraníes.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
            <h3 className="font-bold text-lg text-indigo-400 mb-2">2. Aclasif asegura el pago</h3>
            <p className="text-slate-300 text-sm">Cuando un cliente se interese en tu producto, nuestro asistente virtual gestionará el cobro. Nosotros resguardamos el dinero del comprador de forma segura.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
            <h3 className="font-bold text-lg text-emerald-400 mb-2">3. Despacho y Entrega</h3>
            <p className="text-slate-300 text-sm">Una vez verificado el pago en nuestra cuenta intermediaria, te avisamos para proceder con el envío o retiro del artículo.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-white/5">
            <h3 className="font-bold text-lg text-blue-400 mb-2">4. ¡Recibí tu dinero!</h3>
            <p className="text-slate-300 text-sm">Una vez que el comprador confirme la recepción conforme del artículo, te transferimos tus fondos de manera directa e inmediata.</p>
          </div>
        </div>
      </div>
    </div>
  );
}