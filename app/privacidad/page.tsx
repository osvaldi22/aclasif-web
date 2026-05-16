"use client";
import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#0066FF] to-cyan-400 bg-clip-text text-transparent">
          Política de Privacidad
        </h1>
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <p>
            En <strong>Aclasif</strong>, la privacidad de tus datos personales es nuestra prioridad absoluta. Recopilamos información básica de registro (nombre, WhatsApp, correo electrónico) únicamente para gestionar tus intenciones de compra de forma ágil y segura.
          </p>
          <p>
            Garantizamos que tus datos de contacto personales jamás serán vendidos, cedidos ni expuestos directamente a terceros sin tu consentimiento explícito, salvaguardando tu seguridad comercial y personal en todo momento dentro del territorio de la República del Paraguay.
          </p>
        </div>
      </div>
    </div>
  );
}