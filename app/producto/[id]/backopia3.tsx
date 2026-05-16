"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  image_url: string | null;
  article_code: string | null;
  premium_until?: string | null;
  is_active?: boolean | null;
  moderation_status?: "pending" | "verified" | "suspended" | null;
};

function formatGs(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

function premiumActive(premium_until?: string | null) {
  if (!premium_until) return false;
  return new Date(premium_until).getTime() > Date.now();
}

export default function ProductPage() {
  const params = useParams();
  const articleCode = String(params?.id ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState("Cargando producto...");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!articleCode) return;
    loadProduct();
  }, [articleCode]);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,description,category,price_usd,image_url,article_code,premium_until,is_active,moderation_status"
      )
      .eq("article_code", articleCode)
      .single();

    if (error || !data) {
      setMsg("Producto no encontrado.");
      setProduct(null);
      return;
    }

    const item = data as Product;

    if (!item.is_active || item.moderation_status !== "verified") {
      setMsg("Este producto no está disponible.");
      setProduct(null);
      return;
    }

    setProduct(item);
    setMsg("");
  }

  // --- ESTILOS VISUALES IGUALES AL LOGIN ---
  const shellClass = "login-shell w-full rounded-[2rem] p-4";
  const innerClass = "login-inner rounded-[1.7rem] p-6 relative";

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0,0); }
          50% { transform: translate(15px, -30px); }
          100% { transform: translate(0,0); }
        }
        .bubble-float {
          animation: float linear infinite;
        }

        .login-shell {
          background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%);
          border: 3px solid rgba(120, 177, 245, 0.95);
          box-shadow:
            0 18px 40px rgba(58, 116, 204, 0.30),
            0 0 0 2px rgba(255,255,255,0.16) inset;
        }

        .login-inner {
          background: rgba(255,255,255,0.93);
          border: 1px solid rgba(255,255,255,0.80);
          box-shadow:
            0 10px 24px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.60);
        }

        .field-soft {
          background: rgba(255,255,255,0.88);
          border: 2px solid rgba(47,168,79,0.75);
          box-shadow:
            0 4px 14px rgba(47,168,79,0.10),
            inset 0 1px 0 rgba(255,255,255,0.65);
        }
      `}</style>

      {/* FONDO ILUSTRADO */}
      <div className="fixed inset-0 z-0">
        <img
          src="/fondo-amazonpy.jpg"
          alt="Fondo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* BURBUJAS FLOTANTES */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted &&
          Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-30 bubble-float"
              style={{
                background: ["#FFF", "#F4C400", "#00D084"][i % 3],
                width: `${25 + Math.random() * 30}px`,
                height: `${25 + Math.random() * 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
        {msg ? (
          // --- ESTADO DE ERROR O CARGA ---
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 text-center">
              <div className="mb-5 flex justify-center">
                <img
                  src="/aclasif-logo.png"
                  alt="Aclasif"
                  style={{ width: "220px", height: "auto" }}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-black text-slate-800">
                Producto <span className="text-[#F4C400]">AmazonPY</span>
              </h1>
              <div className="mt-6 rounded-2xl bg-white/5 px-4 py-6 text-slate-700 font-bold">
                {msg}
              </div>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex rounded-2xl bg-[#2FA84F] px-6 py-3 text-sm font-black text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        ) : product ? (
          // --- PRODUCTO ENCONTRADO ---
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* COLUMNA IMAGEN */}
              <div className={shellClass}>
                <div className={innerClass}>
                  {product.image_url ? (
                    <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border-2 border-white">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-gray-50 border-2 border-white text-sm text-slate-400 font-bold">
                      Sin imagen
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMNA INFO */}
              <div className={shellClass}>
                <div className={innerClass}>
                  {/* CATEGORÍA Y PREMIUM */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-[#0066FF]/10 px-3 py-1 text-xs font-semibold text-[#0066FF]">
                      {product.category}
                    </span>
                    {premiumActive(product.premium_until) && (
                      <span className="rounded-full bg-[#F4C400] px-3 py-1 text-xs font-black text-black animate-pulse">
                        ⭐ PREMIUM
                      </span>
                    )}
                  </div>

                  {/* CÓDIGO */}
                  {product.article_code && (
                    <p className="text-sm font-bold text-[#F4C400] mb-2">
                      Articulo: {product.article_code}
                    </p>
                  )}

                  {/* TÍTULO */}
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                    {product.title}
                  </h1>

                  {/* PRECIO */}
                  <div className="mt-5">
                    <p className="text-sm font-bold text-slate-500">Precio</p>
                    <p className="text-4xl font-black text-[#0066FF]">
                      {formatGs(product.price_usd)}
                    </p>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Descripción
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* BOTONES */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/"
                      className="rounded-2xl bg-[#2FA84F] px-6 py-3 text-sm font-black text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition"
                    >
                      ← Volver al inicio
                    </Link>
                  </div>

                  {/* AVISO */}
                  <div className="mt-5 rounded-2xl bg-[#0066FF]/5 border border-[#0066FF]/20 px-4 py-3 text-sm font-bold text-[#0066FF]">
                    AmazonPY intermedia toda la venta entre comprador y vendedor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}