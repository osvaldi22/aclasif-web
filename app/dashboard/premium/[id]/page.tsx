"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type ProductRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  user_id: string;
  premium_until: string | null;
  image_url?: string | null;
};

type PremiumRequest = {
  id: string;
  created_at: string | null;
  user_id: string;
  listing_id: string;
  listing_title: string;
  plan_days: number;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  rejected_at: string | null;
};

function formatGs(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

function premiumActive(premium_until?: string | null) {
  if (!premium_until) return false;
  return new Date(premium_until).getTime() > Date.now();
}

function requestStatusLabel(status: PremiumRequest["status"]) {
  switch (status) {
    case "pending":
      return "Solicitud pendiente";
    case "approved":
      return "Premium aprobado";
    case "rejected":
      return "Solicitud rechazada";
    default:
      return status;
  }
}

function requestStatusClass(status: PremiumRequest["status"]) {
  switch (status) {
    case "pending":
      return "bg-orange-500 text-white";
    case "approved":
      return "bg-[#2FA84F] text-black";
    case "rejected":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function getPlanPrice(planDays: 7 | 15 | 30) {
  switch (planDays) {
    case 7:
      return 25000;
    case 15:
      return 50000;
    case 30:
      return 80000;
    default:
      return 0;
  }
}

export default function PremiumProductPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [latestRequest, setLatestRequest] = useState<PremiumRequest | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingPlan, setSendingPlan] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setMsg("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMsg("Debes iniciar sesion.");
      setLoading(false);
      return;
    }

    const { data: productData, error: productError } = await supabase
      .from("listings")
      .select("id,title,description,category,price_usd,user_id,premium_until,image_url")
      .eq("id", id)
      .single();

    if (productError || !productData) {
      setMsg("No se pudo cargar el producto.");
      setLoading(false);
      return;
    }

    const currentProduct = productData as ProductRow;

    if (currentProduct.user_id !== user.id) {
      setMsg("No tienes permiso para este producto.");
      setLoading(false);
      return;
    }

    setProduct(currentProduct);

    const { data: requestData } = await supabase
      .from("premium_requests")
      .select(
        "id,created_at,user_id,listing_id,listing_title,plan_days,status,approved_at,rejected_at"
      )
      .eq("listing_id", id)
      .order("created_at", { ascending: false })
      .limit(1);

    setLatestRequest((requestData?.[0] as PremiumRequest) ?? null);
    setLoading(false);
  }

  async function requestPremium(planDays: 7 | 15 | 30) {
    if (!product) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMsg("Debes iniciar sesion.");
      return;
    }

    if (premiumActive(product.premium_until)) {
      alert("Este producto ya tiene premium activo.");
      return;
    }

    if (latestRequest?.status === "pending") {
      alert("Este producto ya tiene una solicitud premium pendiente.");
      return;
    }

    const planPrice = getPlanPrice(planDays);

    const ok = window.confirm(
      `¿Enviar solicitud premium de ${planDays} dias por ${formatGs(
        planPrice
      )} para "${product.title}"?`
    );
    if (!ok) return;

    setSendingPlan(planDays);

    const { error } = await supabase.from("premium_requests").insert([
      {
        user_id: user.id,
        listing_id: product.id,
        listing_title: product.title,
        plan_days: planDays,
        status: "pending",
      },
    ]);

    setSendingPlan(null);

    if (error) {
      setMsg("Error enviando solicitud premium: " + error.message);
      return;
    }

    setMsg(
      `Tu solicitud premium de ${planDays} dias por ${formatGs(
        planPrice
      )} ha sido enviada a los moderadores. Una vez realizado el pago y verificado el comprobante, tu premium estara activo.`
    );

    await loadData();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-fixed px-4 py-6 font-sans text-gray-800"
      style={{ backgroundImage: "url('/fondo-amazonpy.jpg')" }}
    >
      <div className="mx-auto max-w-5xl">
        
        {/* LOGO ENCABEZADO */}
        <div className="flex justify-center mb-6 mt-2">
          <img src="/aclasif-logo.png" alt="Aclasif Logo" className="h-28 object-contain drop-shadow-xl" />
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="rounded-[2.5rem] border-[4px] border-[#c8e6c9]/60 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700 shadow-sm">
                <span>👑</span>
                <span>Aclasif Premium</span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-gray-800 md:text-4xl">
                Lleva tu producto a <span className="text-[#f4c400]">primera plana</span>
              </h1>
              <p className="mt-2 text-gray-600 font-medium max-w-2xl">
                Consigue más vistas, más consultas y mayores ventas destacando tu producto frente a los demás anuncios.
              </p>
            </div>

            {/* BOTONES SUPERIORES */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-[#f4c400] px-5 py-2.5 font-bold text-black shadow-md transition hover:scale-105 active:scale-95">
                Mis productos
              </Link>
              <Link href="/" className="rounded-full bg-white border-2 border-gray-200 px-5 py-2.5 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95">
                Volver
              </Link>
              <button onClick={logout} className="rounded-full bg-[#2FA84F] px-5 py-2.5 font-bold text-white shadow-md transition hover:scale-105 active:scale-95">
                Cerrar sesión
              </button>
            </div>
          </div>

          {msg && (
            <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm font-bold text-yellow-800 shadow-sm">
              {msg}
            </div>
          )}

          {loading ? (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 font-medium shadow-sm">
              Cargando producto...
            </div>
          ) : product ? (
            <>
              {/* DETALLES DEL PRODUCTO */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4c400]/20 text-2xl">
                      📦
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Producto elegido</p>
                      <h2 className="text-2xl font-black text-gray-800">
                        {product.title}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                    <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center text-sm font-medium text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border-[3px] border-[#2FA84F] bg-white p-5 shadow-inner">
                      <p className="text-sm font-semibold text-gray-500">Descripción</p>
                      <p className="mt-2 text-gray-700">{product.description}</p>

                      {/* ACÁ ESTÁ LA NUEVA CORRECCIÓN: flex-col en lugar de row para apilar categoría arriba y precio abajo */}
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="w-full rounded-xl bg-gray-50 p-4 border border-gray-100 overflow-hidden">
                          <p className="text-xs font-semibold text-gray-500">Categoría</p>
                          <p className="mt-1 text-base font-bold text-gray-800 break-words">
                            {product.category}
                          </p>
                        </div>
                        <div className="w-full rounded-xl bg-yellow-50 p-4 border border-yellow-100 overflow-hidden">
                          <p className="text-xs font-semibold text-yellow-700">Precio</p>
                          <p className="mt-1 text-lg font-black text-[#d4a800] break-words">
                            {formatGs(product.price_usd)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {premiumActive(product.premium_until) && (
                    <div className="mt-6 rounded-2xl border border-[#2FA84F] bg-green-50 px-5 py-4 text-sm font-bold text-green-800 shadow-sm">
                      ✅ Este producto ya tiene premium activo hasta{" "}
                      <b>{new Date(product.premium_until as string).toLocaleString()}</b>
                    </div>
                  )}

                  {!premiumActive(product.premium_until) && latestRequest && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-gray-700">
                          Última solicitud: {latestRequest.plan_days} días
                        </span>
                        <span
                          className={`rounded-full px-4 py-1.5 text-xs font-bold shadow-sm ${requestStatusClass(
                            latestRequest.status
                          )}`}
                        >
                          {requestStatusLabel(latestRequest.status)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* BENEFICIOS */}
                <div className="rounded-3xl border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-3xl">
                      👑
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-700">Beneficios premium</p>
                      <h3 className="text-2xl font-black text-gray-800">
                        Más alcance y más ventas
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
                      <p className="font-black text-gray-800">✔ Primera plana</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        Tu producto se destacará sobre los normales.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
                      <p className="font-black text-gray-800">✔ Más vistas</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        Tendrás mayor exposición frente a otros vendedores.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
                      <p className="font-black text-gray-800">✔ Mayor conversión</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        Más consultas y mejores posibilidades de venta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PLANES PREMIUM */}
              {!premiumActive(product.premium_until) && (
                <div className="mt-10">
                  <div className="mb-6 text-center">
                    <h3 className="text-3xl font-black text-gray-800">
                      Elige tu plan <span className="text-[#f4c400]">premium</span>
                    </h3>
                    <p className="mt-2 font-medium text-gray-600">
                      Selecciona el plan que mejor se adapte a tu estrategia de venta.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Plan 7 Días */}
                    <div className="rounded-3xl border-[3px] border-[#f4c400] bg-white p-6 text-center shadow-lg transition hover:-translate-y-1">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-3xl shadow-inner">
                        ⭐
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-gray-800">7 días</h3>
                      <p className="mt-2 text-3xl font-black text-[#d4a800]">
                        {formatGs(25000)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-600 h-16">
                        Adquiere 7 días en primera plana para mover rápido tu producto.
                      </p>
                      <button
                        onClick={() => requestPremium(7)}
                        disabled={latestRequest?.status === "pending" || sendingPlan === 7}
                        className="mt-4 w-full rounded-full bg-[#f4c400] px-4 py-3.5 font-black text-black shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {sendingPlan === 7 ? "Enviando..." : "Premium ya"}
                      </button>
                    </div>

                    {/* Plan 15 Días */}
                    <div className="rounded-3xl border-[3px] border-orange-400 bg-white p-6 text-center shadow-lg transition hover:-translate-y-1">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl shadow-inner">
                        🚀
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-gray-800">15 días</h3>
                      <p className="mt-2 text-3xl font-black text-orange-500">
                        {formatGs(50000)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-600 h-16">
                        Duplica la exposición y mantente arriba para generar más consultas.
                      </p>
                      <button
                        onClick={() => requestPremium(15)}
                        disabled={latestRequest?.status === "pending" || sendingPlan === 15}
                        className="mt-4 w-full rounded-full bg-orange-400 px-4 py-3.5 font-black text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {sendingPlan === 15 ? "Enviando..." : "Premium ya"}
                      </button>
                    </div>

                    {/* Plan 30 Días */}
                    <div className="rounded-3xl border-[3px] border-[#2FA84F] bg-white p-6 text-center shadow-lg transition hover:-translate-y-1">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl shadow-inner">
                        👑
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-gray-800">30 días</h3>
                      <p className="mt-2 text-3xl font-black text-[#2FA84F]">
                        {formatGs(80000)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-gray-600 h-16">
                        Máxima visibilidad durante un mes entero para vender más rápido.
                      </p>
                      <button
                        onClick={() => requestPremium(30)}
                        disabled={latestRequest?.status === "pending" || sendingPlan === 30}
                        className="mt-4 w-full rounded-full bg-[#2FA84F] px-4 py-3.5 font-black text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {sendingPlan === 30 ? "Enviando..." : "Premium ya"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 rounded-2xl border-[3px] border-green-200 bg-green-50 px-6 py-5 text-sm font-bold text-green-800 shadow-sm text-center">
                Una vez realizada tu solicitud premium, envía tu comprobante al administrador. Cuando el pago sea confirmado, el producto pasará a primera plana automáticamente.
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 font-medium shadow-sm">
              No se pudo cargar el producto.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}