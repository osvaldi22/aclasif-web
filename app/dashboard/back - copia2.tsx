"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Category = {
  slug: string;
  name: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  image_url?: string | null;
  premium_until?: string | null;
  created_at?: string | null;
  moderation_status?: "pending" | "verified" | "suspended" | null;
  moderation_note?: string | null;
  verified_at?: string | null;
  last_reviewed_at?: string | null;
  is_active?: boolean | null;
  article_code?: string | null;
};

type Order = {
  id: string;
  created_at: string | null;
  listing_id: string | null;
  listing_title: string | null;
  buyer_name: string | null;
  buyer_city: string | null;
  price_usd: number | null;
  status: string | null;
  order_number: number | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
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

function premiumActive(premium_until?: string | null) {
  if (!premium_until) return false;
  return new Date(premium_until).getTime() > Date.now();
}

function formatGs(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

function formatOrderStatus(status?: string | null) {
  switch (status) {
    case "pending_payment":
      return "Pendiente de pago";
    case "paid":
      return "Pagado";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Recibido";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status || "Sin estado";
  }
}

function statusBadgeClass(status?: string | null) {
  switch (status) {
    case "pending_payment":
      return "bg-yellow-400 text-black";
    case "paid":
      return "bg-[#2FA84F] text-black";
    case "shipped":
      return "bg-blue-500 text-white";
    case "delivered":
      return "bg-purple-500 text-white";
    case "completed":
      return "bg-[#f4c400] text-black";
    case "cancelled":
      return "bg-red-500 text-white";
    default:
      return "bg-white/10 text-white";
  }
}

function premiumRequestBadgeClass(status: PremiumRequest["status"]) {
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

function premiumRequestLabel(status: PremiumRequest["status"]) {
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

function moderationBadgeClass(status?: Product["moderation_status"]) {
  switch (status) {
    case "pending":
      return "bg-yellow-400 text-black";
    case "verified":
      return "bg-[#2FA84F] text-black";
    case "suspended":
      return "bg-red-500 text-white";
    default:
      return "bg-white/10 text-white";
  }
}

function moderationLabel(status?: Product["moderation_status"]) {
  switch (status) {
    case "pending":
      return "Pendiente de revision";
    case "verified":
      return "Verificada";
    case "suspended":
      return "Suspendida";
    default:
      return "Sin revision";
  }
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<PremiumRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [msg, setMsg] = useState("");
  const [ordersMsg, setOrdersMsg] = useState("");
  const [premiumMsg, setPremiumMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadCategories();
    loadProductsOrdersAndPremiumRequests();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("slug,name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(error.message);
      return;
    }

    setCategories((data ?? []) as Category[]);
  }

  async function loadProductsOrdersAndPremiumRequests() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMsg("Debes iniciar sesion.");
      return;
    }

    const { data: listingsData, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (listingsError) {
      setMsg("Error cargando productos: " + listingsError.message);
      return;
    }

    const sellerProducts = (listingsData ?? []) as Product[];
    setProducts(sellerProducts);

    const listingIds = sellerProducts.map((item) => item.id);

    if (listingIds.length === 0) {
      setOrders([]);
      setPremiumRequests([]);
      setOrdersMsg("");
      setPremiumMsg("");
      return;
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id,created_at,listing_id,listing_title,buyer_name,buyer_city,price_usd,status,order_number,paid_at,shipped_at,delivered_at,completed_at"
      )
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    if (ordersError) {
      setOrders([]);
      setOrdersMsg("Error cargando pedidos: " + ordersError.message);
    } else {
      setOrders((ordersData ?? []) as Order[]);
      setOrdersMsg("");
    }

    const { data: premiumData, error: premiumError } = await supabase
      .from("premium_requests")
      .select(
        "id,created_at,user_id,listing_id,listing_title,plan_days,status,approved_at,rejected_at"
      )
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    if (premiumError) {
      setPremiumRequests([]);
      setPremiumMsg(
        "Error cargando solicitudes premium: " + premiumError.message
      );
    } else {
      setPremiumRequests((premiumData ?? []) as PremiumRequest[]);
      setPremiumMsg("");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function categoryNameFromSlug(slug: string) {
    const found = categories.find((c) => c.slug === slug);
    return found ? found.name : slug;
  }

  function getLatestPremiumRequest(listingId: string) {
    return premiumRequests.find((req) => req.listing_id === listingId) ?? null;
  }

  async function deleteProduct(id: string) {
    const ok = window.confirm("¿Seguro que deseas borrar este producto?");
    if (!ok) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      setMsg("Error borrando producto: " + error.message);
      return;
    }

    setMsg("Producto borrado correctamente.");
    await loadProductsOrdersAndPremiumRequests();
  }

  const pendingPremiumCount = useMemo(() => {
    return premiumRequests.filter((req) => req.status === "pending").length;
  }, [premiumRequests]);

  const stats = useMemo(() => {
    const totalProductos = products.length;
    const activas = products.filter((p) => p.is_active).length;
    const pendientes = products.filter(
      (p) => p.moderation_status === "pending"
    ).length;
    const suspendidas = products.filter(
      (p) => p.moderation_status === "suspended"
    ).length;
    const premiumActivas = products.filter((p) =>
      premiumActive(p.premium_until)
    ).length;
    const pedidosRecibidos = orders.length;

    return {
      totalProductos,
      activas,
      pendientes,
      suspendidas,
      premiumActivas,
      pedidosRecibidos,
    };
  }, [products, orders]);

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

        .shell-card {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(10px);
          border: 3px solid rgba(47,168,79,0.70);
          box-shadow:
            0 18px 40px rgba(86, 139, 255, 0.10),
            0 10px 24px rgba(47,168,79,0.12),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }

        .panel-card {
          background: rgba(255,255,255,0.90);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 10px 30px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }

        .stat-card {
          background: rgba(255,255,255,0.92);
          border: 3px solid rgba(47,168,79,0.75);
          box-shadow:
            0 12px 26px rgba(0,0,0,0.07),
            0 6px 18px rgba(47,168,79,0.10),
            inset 0 1px 0 rgba(255,255,255,0.65);
        }

        .product-shell {
          position: relative;
          padding: 14px;
          background: linear-gradient(180deg, #bddcff 0%, #9ecbfd 100%);
          box-shadow:
            0 18px 40px rgba(74, 136, 230, 0.28),
            0 0 0 2px rgba(255,255,255,0.28) inset;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
          clip-path: polygon(
            8% 2%, 18% 0%, 32% 3%, 50% 1%, 68% 4%, 82% 0%, 92% 3%, 98% 10%,
            100% 22%, 98% 34%, 100% 50%, 97% 66%, 100% 80%, 95% 92%, 84% 98%,
            70% 100%, 54% 98%, 38% 100%, 22% 97%, 10% 100%, 2% 92%, 0% 78%,
            3% 62%, 0% 48%, 2% 34%, 0% 20%, 4% 8%
          );
        }

        .product-shell:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 26px 54px rgba(74, 136, 230, 0.36),
            0 0 0 2px rgba(255,255,255,0.38) inset;
        }

        .product-inner {
          background: rgba(255,255,255,0.94);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
          clip-path: polygon(
            8% 2%, 18% 0%, 32% 3%, 50% 1%, 68% 4%, 82% 0%, 92% 3%, 98% 10%,
            100% 22%, 98% 34%, 100% 50%, 97% 66%, 100% 80%, 95% 92%, 84% 98%,
            70% 100%, 54% 98%, 38% 100%, 22% 97%, 10% 100%, 2% 92%, 0% 78%,
            3% 62%, 0% 48%, 2% 34%, 0% 20%, 4% 8%
          );
        }

        .image-card {
          background: linear-gradient(180deg, #ececec 0%, #e2e2e2 100%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow:
            inset 0 2px 8px rgba(255,255,255,0.55),
            0 2px 8px rgba(0,0,0,0.06);
        }

        .glass-block {
          background: rgba(255,255,255,0.70);
          border: 1px solid rgba(255,255,255,0.45);
          box-shadow: 0 8px 18px rgba(0,0,0,0.06);
        }

        .mini-soft {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(255,255,255,0.38);
        }

        .chip-green {
          background: rgba(255,255,255,0.90);
          border: 2px solid #2FA84F;
          color: #1f2937;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(47,168,79,0.10);
        }

        .info-bubble {
          background: rgba(255,255,255,0.88);
          border: 2px solid #2FA84F;
          border-radius: 1.25rem;
          box-shadow: 0 6px 16px rgba(47,168,79,0.08);
        }
      `}</style>

      <div className="fixed inset-0 z-0">
        <img
          src="/fondo-amazonpy.jpg"
          alt="Fondo AmazonPY"
          className="w-full h-full object-cover"
        />
      </div>

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

      <div className="relative z-10 px-4 py-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex justify-center">
            <Link href="/" className="block">
              <img
                src="/aclasif-logo.png"
                alt="Aclasif"
                style={{ width: "440px", height: "auto" }}
                className="object-contain drop-shadow-xl"
              />
            </Link>
          </div>

          <div className="shell-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-800">
                  Mis <span className="text-[#F4C400]">productos</span>
                </h1>
                <p className="mt-2 text-slate-600">
                  Aquí ves las publicaciones que hiciste desde tu cuenta.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/new"
                  className="rounded-2xl bg-[#F4C400] px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Publicar otro articulo
                </Link>

                <Link
                  href="/"
                  className="rounded-2xl bg-white/70 px-4 py-3 font-bold text-slate-700 shadow-md transition hover:bg-white active:scale-[0.98]"
                >
                  Volver
                </Link>

                <button
                  onClick={logout}
                  className="rounded-2xl bg-[#2FA84F] px-4 py-3 font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>

            {msg && (
              <div className="mt-5 rounded-2xl glass-block px-4 py-3 text-sm text-slate-700">
                {msg}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Total productos</p>
              <p className="mt-2 text-3xl font-black text-slate-800">
                {stats.totalProductos}
              </p>
            </div>

            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Activas</p>
              <p className="mt-2 text-3xl font-black text-[#2FA84F]">
                {stats.activas}
              </p>
            </div>

            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="mt-2 text-3xl font-black text-yellow-500">
                {stats.pendientes}
              </p>
            </div>

            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Suspendidas</p>
              <p className="mt-2 text-3xl font-black text-red-500">
                {stats.suspendidas}
              </p>
            </div>

            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Premium activas</p>
              <p className="mt-2 text-3xl font-black text-[#F4C400]">
                {stats.premiumActivas}
              </p>
            </div>

            <div className="stat-card rounded-[2rem] p-5">
              <p className="text-sm text-slate-500">Pedidos recibidos</p>
              <p className="mt-2 text-3xl font-black text-blue-500">
                {stats.pedidosRecibidos}
              </p>
            </div>
          </div>

          <div className="mt-6 shell-card rounded-[2rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Solicitudes <span className="text-[#F4C400]">premium</span>
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Si quieres destacar un producto, entra a la pantalla premium y
                  envía tu solicitud.
                </p>
              </div>

              <div className="chip-green px-4 py-2 text-sm font-semibold">
                Pendientes: <b>{pendingPremiumCount}</b>
              </div>
            </div>

            {premiumMsg && (
              <div className="mt-4 rounded-2xl glass-block px-4 py-3 text-sm text-slate-700">
                {premiumMsg}
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="mt-8 shell-card rounded-[2rem] p-6">
              <p className="text-slate-600">
                Todavía no tienes productos publicados.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const isPremium = premiumActive(p.premium_until);
                const latestPremiumRequest = getLatestPremiumRequest(p.id);

                return (
                  <div key={p.id} className="product-shell">
                    <article className="group product-inner">
                      {p.image_url ? (
                        <div className="image-card mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-[1.5rem]">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="image-card mb-3 flex h-48 w-full items-center justify-center rounded-[1.5rem] text-sm text-slate-500">
                          Sin imagen
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <span className="chip-green px-3 py-1 text-xs font-bold">
                          {categoryNameFromSlug(p.category)}
                        </span>

                        {isPremium ? (
                          <span className="rounded-full bg-[#F4C400] px-3 py-1 text-xs font-black text-black">
                            PREMIUM
                          </span>
                        ) : (
                          <span className="chip-green px-3 py-1 text-xs font-bold">
                            NORMAL
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${moderationBadgeClass(
                            p.moderation_status
                          )}`}
                        >
                          {moderationLabel(p.moderation_status)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            p.is_active
                              ? "bg-[#2FA84F]/20 text-[#167733]"
                              : "bg-red-500/20 text-red-600"
                          }`}
                        >
                          {p.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </div>

                      {p.article_code && (
                        <p className="mt-2 text-xs font-black text-[#F4C400]">
                          Artículo: {p.article_code}
                        </p>
                      )}

                      <h3 className="mt-3 text-lg font-black text-slate-800">
                        {p.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                        {p.description}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">Precio</p>
                          <p className="text-xl font-black text-[#0066FF]">
                            {formatGs(p.price_usd)}
                          </p>
                        </div>

                        <div className="text-right text-xs text-slate-500">
                          <p>Fecha</p>
                          <p>
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {p.moderation_status === "pending" && (
                        <div className="mt-4 rounded-2xl border border-yellow-400/50 bg-yellow-100 px-4 py-3 text-sm text-yellow-900">
                          Esta publicación está <b>pendiente de revisión</b> por
                          AmazonPY. Hasta ser verificada puede quedar oculta o
                          inactiva.
                        </div>
                      )}

                      {p.moderation_status === "verified" && (
                        <div className="mt-4 rounded-2xl border border-green-400/50 bg-green-100 px-4 py-3 text-sm text-green-900">
                          Tu publicación fue <b>verificada</b> y está aprobada por
                          AmazonPY.
                        </div>
                      )}

                      {p.moderation_status === "suspended" && (
                        <div className="mt-4 rounded-2xl border border-red-400/50 bg-red-100 px-4 py-3 text-sm text-red-900">
                          <p className="font-bold">Publicación suspendida</p>
                          <p className="mt-1">
                            Tu publicación fue suspendida por infringir las normas
                            de AmazonPY. Corrige el contenido y vuelve a editarla
                            para nueva revisión.
                          </p>
                          {p.moderation_note && (
                            <p className="mt-2">
                              <b>Motivo:</b> {p.moderation_note}
                            </p>
                          )}
                        </div>
                      )}

                      {isPremium && p.premium_until && (
                        <div className="mt-4 rounded-2xl border border-[#F4C400]/40 bg-[#FFF6C4] px-4 py-3 text-sm text-yellow-900">
                          Premium activo hasta:{" "}
                          <b>{new Date(p.premium_until).toLocaleString()}</b>
                        </div>
                      )}

                      {!isPremium && latestPremiumRequest && (
                        <div className="mt-4 rounded-2xl mini-soft px-4 py-3 text-sm text-slate-700">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>
                              Última solicitud: {latestPremiumRequest.plan_days} días
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${premiumRequestBadgeClass(
                                latestPremiumRequest.status
                              )}`}
                            >
                              {premiumRequestLabel(latestPremiumRequest.status)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href={`/dashboard/edit/${p.id}`}
                          className="flex h-12 items-center justify-center rounded-2xl bg-[#F4C400] px-4 text-center text-sm font-black text-black shadow-md transition hover:brightness-110 active:scale-[0.98]"
                        >
                          Editar
                        </Link>

                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="flex h-12 items-center justify-center rounded-2xl bg-red-500 px-4 text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
                        >
                          Borrar
                        </button>
                      </div>

                      {!isPremium && (
                        <div className="mt-3">
                          <Link
                            href={`/dashboard/premium/${p.id}`}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2FA84F] px-4 text-center text-sm font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                          >
                            <span className="text-base leading-none">👑</span>
                            <span className="leading-none">Hacer premium</span>
                          </Link>
                        </div>
                      )}
                    </article>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 shell-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  Pedidos <span className="text-[#F4C400]">recibidos</span>
                </h2>
                <p className="mt-1 text-slate-600">
                  Aquí ves los pedidos que entraron en tus productos.
                </p>
              </div>

              <div className="chip-green px-4 py-2 text-sm font-semibold">
                Total pedidos: <b>{orders.length}</b>
              </div>
            </div>

            {ordersMsg && (
              <div className="mt-5 rounded-2xl glass-block px-4 py-3 text-sm text-slate-700">
                {ordersMsg}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="mt-6 rounded-2xl panel-card p-5 text-slate-600">
                Todavía no tienes pedidos recibidos.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="panel-card rounded-[1.8rem] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="info-bubble px-4 py-3">
                        <p className="text-xs text-slate-500">Orden</p>
                        <h3 className="text-lg font-black text-slate-800">
                          #{order.order_number ?? "-"}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(
                          order.status
                        )}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="info-bubble p-4">
                        <p className="text-xs text-slate-500">Comprador</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {order.buyer_name || "-"}
                        </p>
                      </div>

                      <div className="info-bubble p-4">
                        <p className="text-xs text-slate-500">Ciudad</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {order.buyer_city || "-"}
                        </p>
                      </div>

                      <div className="info-bubble p-4">
                        <p className="text-xs text-slate-500">Producto</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {order.listing_title || "Producto sin titulo"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="info-bubble p-4">
                          <p className="text-xs text-slate-500">
                            Monto que recibirás
                          </p>
                          <p className="mt-1 font-black text-[#2FA84F]">
                            {formatGs(order.price_usd)}
                          </p>
                        </div>

                        <div className="info-bubble p-4">
                          <p className="text-xs text-slate-500">Estado actual</p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {formatOrderStatus(order.status)}
                          </p>
                        </div>
                      </div>

                      <div className="info-bubble flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="text-xs text-slate-500">Fecha del pedido</p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {order.status === "paid" && (
                        <div className="rounded-2xl border border-green-400/50 bg-green-100 px-4 py-3 text-sm font-semibold text-green-900">
                          AmazonPY ya confirmó el pago del comprador.
                        </div>
                      )}

                      {order.status === "shipped" && (
                        <div className="rounded-2xl border border-blue-400/50 bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-900">
                          AmazonPY marcó este pedido como enviado.
                        </div>
                      )}

                      {order.status === "delivered" && (
                        <div className="rounded-2xl border border-purple-400/50 bg-purple-100 px-4 py-3 text-sm font-semibold text-purple-900">
                          AmazonPY marcó este pedido como recibido.
                        </div>
                      )}

                      {order.status === "completed" && (
                        <div className="rounded-2xl border border-[#F4C400]/50 bg-[#FFF6C4] px-4 py-3 text-sm font-semibold text-yellow-900">
                          Pedido completado por AmazonPY.
                        </div>
                      )}

                      <div className="rounded-2xl border border-green-400/50 bg-green-100 px-4 py-3 text-sm font-semibold text-yellow-900">
                        AmazonPY intermedia la venta. Los datos completos del
                        comprador los maneja solo el admin.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}