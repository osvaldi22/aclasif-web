"use client";
import Link from "next/link";

export default function SerPremiumPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Planes Premium Aclasif
        </h1>
        <p className="text-slate-400 text-center mb-12">Hacé que tus anuncios vuelen y vendé mucho más rápido destacando tus productos.</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Plan Normal */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Plan Estándar</h3>
              <p className="text-3xl font-extrabold mb-4">Gratis</p>
              <ul className="space-y-2 text-sm text-slate-400 mb-6">
                <li>✓ Publicaciones ilimitadas</li>
                <li>✓ Soporte del Asistente Virtual</li>
                <li>✓ Transacciones 100% Intermediadas</li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-bold text-sm transition">Plan Activo</button>
          </div>

          {/* Plan Destacado Oro */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/30 p-6 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider float-right">Popular</span>
              <h3 className="text-xl font-bold mb-2 text-amber-400">Destacado Oro</h3>
              <p className="text-3xl font-extrabold mb-4">Gs. 50.000 <span className="text-xs font-normal text-slate-400">/ artículo</span></p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li>⭐ Posición superior en búsquedas</li>
                <li>⭐ Etiqueta dorada de artículo Premium</li>
                <li>⭐ Mayor alcance en redes de Aclasif</li>
                <li>✓ Transacciones 100% Intermediadas</li>
              </ul>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 py-2.5 rounded-xl font-extrabold text-sm transition">Adquirir Oro</button>
          </div>
        </div>
      </div>
    </div>
  );
}