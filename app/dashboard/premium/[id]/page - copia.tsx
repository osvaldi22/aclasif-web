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
      return "bg-white/10 text-white";
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
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-to-r from-[#181818] via-[#222222] to-[#181818] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f4c400]/30 bg-[#f4c400]/10 px-4 py-2 text-sm font-bold text-yellow-200">
                  <span>👑</span>
                  <span>AmazonPY Premium</span>
                </div>

                <h1 className="mt-4 text-3xl font-black md:text-4xl">
                  Lleva tu producto a{" "}
                  <span className="text-[#f4c400]">primera plana</span>
                </h1>

                <p className="mt-3 max-w-2xl text-white/70">
                  Consigue mas vistas, mas consultas y mayores ventas destacando
                  tu producto frente a los demas anuncios.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-[#f4c400] px-4 py-2 font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
                >
                  Mis productos
                </Link>

                <Link
                  href="/"
                  className="rounded-2xl bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Volver
                </Link>

                <button
                  onClick={logout}
                  className="rounded-2xl bg-[#2FA84F] px-4 py-2 font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {msg && (
              <div className="mb-6 rounded-2xl border border-[#f4c400]/30 bg-[#f4c400]/10 px-4 py-3 text-sm text-yellow-100 shadow-md">
                {msg}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-white/70">
                Cargando producto...
              </div>
            ) : product ? (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-3xl border border-white/10 bg-[#101010] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4c400]/15 text-2xl">
                        📦
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Producto elegido</p>
                        <h2 className="text-2xl font-black text-white">
                          {product.title}
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818]">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="h-56 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-56 items-center justify-center text-sm text-white/50">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/50">Descripcion</p>
                        <p className="mt-2 text-white/80">{product.description}</p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-black/20 p-4">
                            <p className="text-xs text-white/50">Categoria</p>
                            <p className="mt-1 font-semibold text-white">
                              {product.category}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-black/20 p-4">
                            <p className="text-xs text-white/50">Precio</p>
                            <p className="mt-1 font-bold text-[#f4c400]">
                              {formatGs(product.price_usd)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {premiumActive(product.premium_until) && (
                      <div className="mt-5 rounded-2xl border border-[#f4c400]/30 bg-[#f4c400]/10 px-4 py-3 text-sm text-yellow-100">
                        Este producto ya tiene premium activo hasta{" "}
                        <b>{new Date(product.premium_until as string).toLocaleString()}</b>
                      </div>
                    )}

                    {!premiumActive(product.premium_until) && latestRequest && (
                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-white/70">
                            Ultima solicitud: {latestRequest.plan_days} dias
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${requestStatusClass(
                              latestRequest.status
                            )}`}
                          >
                            {requestStatusLabel(latestRequest.status)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-[#f4c400]/20 bg-[linear-gradient(180deg,rgba(244,196,0,0.08),rgba(255,255,255,0.02))] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4c400]/15 text-3xl">
                        👑
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Beneficios premium</p>
                        <h3 className="text-2xl font-black text-[#f4c400]">
                          Mas alcance y mas ventas
                        </h3>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold text-white">✔ Primera plana</p>
                        <p className="mt-1 text-sm text-white/70">
                          Tu producto se destacara sobre los normales.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold text-white">✔ Mas vistas</p>
                        <p className="mt-1 text-sm text-white/70">
                          Tendras mayor exposicion frente a otros vendedores.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold text-white">✔ Mayor conversion</p>
                        <p className="mt-1 text-sm text-white/70">
                          Mas consultas y mejores posibilidades de venta.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!premiumActive(product.premium_until) && (
                  <div className="mt-8">
                    <div className="mb-4 text-center">
                      <h3 className="text-2xl font-black">
                        Elige tu plan <span className="text-[#f4c400]">premium</span>
                      </h3>
                      <p className="mt-2 text-white/70">
                        Selecciona el plan que mejor se adapte a tu estrategia de venta.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-3xl border border-[#f4c400]/40 bg-[#121212] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4c400]/20 text-3xl">
                            ⭐
                          </div>
                          <h3 className="mt-4 text-2xl font-black text-[#f4c400]">
                            7 dias
                          </h3>

                          <p className="mt-3 text-3xl font-black text-[#f4c400]">
                            {formatGs(25000)}
                          </p>

                          <p className="mt-3 text-sm text-white/70">
                            Adquiere 7 dias en primera plana, mas vistas y mayores
                            ventas para mover rapido tu producto.
                          </p>

                          <button
                            onClick={() => requestPremium(7)}
                            disabled={latestRequest?.status === "pending" || sendingPlan === 7}
                            className="mt-6 w-full rounded-2xl bg-[#f4c400] px-4 py-3 font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                          >
                            {sendingPlan === 7 ? "Enviando..." : "Premium ya"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-orange-400/40 bg-[#121212] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-3xl">
                            🚀
                          </div>
                          <h3 className="mt-4 text-2xl font-black text-orange-400">
                            15 dias
                          </h3>

                          <p className="mt-3 text-3xl font-black text-orange-400">
                            {formatGs(50000)}
                          </p>

                          <p className="mt-3 text-sm text-white/70">
                            Duplica la exposicion de tu producto por mas tiempo y
                            mantente arriba para generar mas consultas.
                          </p>

                          <button
                            onClick={() => requestPremium(15)}
                            disabled={latestRequest?.status === "pending" || sendingPlan === 15}
                            className="mt-6 w-full rounded-2xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                          >
                            {sendingPlan === 15 ? "Enviando..." : "Premium ya"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#2FA84F]/40 bg-[#121212] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2FA84F]/20 text-3xl">
                            👑
                          </div>
                          <h3 className="mt-4 text-2xl font-black text-[#2FA84F]">
                            30 dias
                          </h3>

                          <p className="mt-3 text-3xl font-black text-[#2FA84F]">
                            {formatGs(80000)}
                          </p>

                          <p className="mt-3 text-sm text-white/70">
                            Maxima visibilidad durante un mes entero para vender mas
                            rapido y destacar frente a la competencia.
                          </p>

                          <button
                            onClick={() => requestPremium(30)}
                            disabled={latestRequest?.status === "pending" || sendingPlan === 30}
                            className="mt-6 w-full rounded-2xl bg-[#2FA84F] px-4 py-3 font-bold text-black transition hover:brightness-110 disabled:opacity-60"
                          >
                            {sendingPlan === 30 ? "Enviando..." : "Premium ya"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 rounded-3xl border border-green-700 bg-[linear-gradient(180deg,rgba(47,168,79,0.22),rgba(47,168,79,0.08))] px-5 py-4 text-sm font-semibold text-yellow-100">
                  Una vez realizada tu solicitud premium, envia tu comprobante al
                  admin. Cuando el pago sea confirmado, el producto pasara a
                  primera plana automaticamente.
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-white/70">
                No se pudo cargar el producto.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}