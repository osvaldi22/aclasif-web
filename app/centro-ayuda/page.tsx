"use client";
import Link from "next/link";

export default function CentroAyudaPage() {
  const faqs = [
    { q: "¿Es seguro comprar acá?", a: "Absolutamente. Aclasif retiene los fondos del pago de manera segura. El vendedor no recibe el dinero hasta que vos verifiques y confirmes que el producto llegó tal como se prometió." },
    { q: "¿Puedo coordinar el pago directo con el vendedor?", a: "No. Por estrictas políticas de seguridad para evitar fraudes, todos los pagos deben ser procesados obligatoriamente de forma centralizada por la administración de Aclasif." },
    { q: "¿Qué pasa si el producto no es lo que pedí?", a: "Podés iniciar un reclamo inmediato con nuestro asistente. Al estar el dinero congelado en nuestra cuenta, si se comprueba el fallo, te devolvemos el 100% de tu dinero." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#0066FF] hover:underline text-sm font-bold flex items-center gap-2 mb-8">
          ← Volver al Inicio
        </Link>
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#0066FF] to-cyan-400 bg-clip-text text-transparent">
          Centro de Ayuda
        </h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 p-5 rounded-xl">
              <h4 className="font-bold text-slate-200 mb-2">❓ {faq.q}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}