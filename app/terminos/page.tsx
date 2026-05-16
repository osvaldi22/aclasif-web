"use client";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#0066FF] to-cyan-400 bg-clip-text text-transparent">
          Términos y Condiciones de Uso
        </h1>
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed max-h-[500px] overflow-y-auto border border-white/10 p-4 rounded-xl bg-slate-900/40">
          <p className="text-sm font-bold text-slate-200">1. Rol Exclusivo de Intermediación</p>
          <p>Aclasif opera estrictamente como un intermediario tecnológico y financiero de resguardo seguro. Al utilizar la plataforma, tanto compradores como vendedores aceptan de forma irrevocable que todas las transacciones comerciales deben ser liquidadas a través de los canales de cobro autorizados por la administración central de Aclasif.</p>
          
          <p className="text-sm font-bold text-slate-200">2. Prohibición de Trato Directo</p>
          <p>Queda terminantemente prohibido el intercambio de datos de contacto personales con fines de eludir la intermediación de pagos de la plataforma. El incumplimiento de esta norma derivará en la suspensión definitiva de la cuenta del usuario.</p>

          <p className="text-sm font-bold text-slate-200">3. Retención y Liberación de Fondos</p>
          <p>Aclasif congelará el dinero remitido por el comprador. La liberación definitiva hacia el vendedor se ejecutará únicamente tras la validación física del producto por parte del comprador o el transcurso del tiempo de garantía preestablecido.</p>
        </div>
      </div>
    </div>
  );
}