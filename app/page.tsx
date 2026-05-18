"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AclasifChat from "./components/AclasifChat";
import AclasifStickyDock from "./components/AclasifStickyDock";
import { useRouter } from "next/navigation";

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  premium_until: string | null;
  image_url?: string | null;
  article_code?: string | null;
  is_active?: boolean | null;
  moderation_status?: "pending" | "verified" | "suspended" | null;
  created_at?: string;
  stock?: number;
  condicion?: string;
  detalles_condicion?: string | null;
};

type Category = { slug: string; name: string };
type Toast = { show: boolean; text: string };

const ADMIN_WHATSAPP = "595981784334";

const iconMap: { [key: string]: string } = {
  "Electrónica": "🎧", "electronica": "🎧",
  "Hogar": "🏠", "hogar": "🏠",
  "Moda": "👕", "moda": "👕",
  "Calzados": "👟", "calzados": "👟",
  "Repuestos": "🔧", "repuestos": "🔧",
  "Mascotas": "🐶", "mascotas": "🐶",
  "Juguetes": "🧸", "juguetes": "🧸",
  "Deportes": "⚽", "deportes": "⚽",
  "Perfumes": "✨", "perfumes": "✨",
  "Accesorios": "⌚", "accesorios": "⌚",
  "Fitness": "💪", "fitness": "💪",
  "Relojes": "🕐", "relojes": "🕐",
  "Ropa": "👔", "ropa": "👔",
};

const categoryColors: { [key: string]: string } = {
  all: "#FF7A00",
  Electrónica: "#3B82F6", electronica: "#3B82F6",
  Hogar: "#10B981", hogar: "#10B981",
  Moda: "#A855F7", moda: "#A855F7",
  Calzados: "#F59E0B", calzados: "#F59E0B",
  Repuestos: "#EF4444", repuestos: "#EF4444",
  Mascotas: "#14B8A6", mascotas: "#14B8A6",
  Juguetes: "#F97316", juguetes: "#F97316",
  Deportes: "#22C55E", deportes: "#22C55E",
  Perfumes: "#EC4899", perfumes: "#EC4899",
  Accesorios: "#6366F1", accesorios: "#6366F1",
  Fitness: "#8B5CF6", fitness: "#8B5CF6",
  Relojes: "#06B67F", relojes: "#06B67F",
  Ropa: "#F43F5E", ropa: "#F43F5E"
};

function getIcon(catName: string) { return iconMap[catName] || "📦"; }

function CategoryVisualIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("electr")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M16 36v-8c0-9 7-16 16-16s16 7 16 16v8" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        <path d="M16 36v11c0 3 2 5 5 5h3V34h-3c-3 0-5 2-5 5z" fill="currentColor" />
        <path d="M48 36v11c0 3-2 5-5 5h-3V34h3c3 0 5 2 5 5z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
      <path d="M14 20 32 10l18 10v24L32 54 14 44V20z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <path d="M14 20l18 10 18-10M32 30v24" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    </svg>
  );
}

function premiumActive(premium_until: string | null) {
  if (!premium_until) return false;
  return new Date(premium_until) > new Date();
}

function formatGs(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

export default function Home() {
  const router = useRouter();

  const [items, setItems] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Cargando...");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, text: "" });

  const [defectModal, setDefectModal] = useState<{ show: boolean; text: string }>({ show: false, text: "" });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    setMounted(true);
    async function load() {
      setStatus("Cargando...");
      const { data: listData } = await supabase
        .from("listings")
        .select("*")
        .eq("is_active", true)
        .eq("moderation_status", "verified");

      if (listData) setItems(listData as Listing[]);

      const { data: catData } = await supabase
        .from("categories")
        .select("slug,name")
        .eq("is_active", true)
        .order("name");

      if (catData) setCategories(catData as Category[]);

      const { data: user } = await supabase.auth.getUser();
      setSessionUser(user.user ?? null);
      setStatus("");
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function createOrder() {
    if (!selected || !buyerName || !buyerWhatsapp || !buyerCity || !buyerAddress) return;
    setBuyLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .insert([{
        listing_id: selected.id,
        listing_title: selected.title,
        price_usd: selected.price_usd,
        buyer_name: buyerName,
        buyer_whatsapp: buyerWhatsapp,
        buyer_email: buyerEmail,
        buyer_city: buyerCity,
        buyer_address: buyerAddress,
        status: "pending_payment"
      }])
      .select("order_number")
      .single();

    if (!error) {
      const currentStock = selected.stock || 1;
      const newStock = Math.max(0, currentStock - 1);
      
      await supabase
        .from("listings")
        .update({ stock: newStock })
        .eq("id", selected.id);

      // --- AVISO A TELEGRAM VÍA RENDER ---
      try {
        await fetch("https://aclasif-chatbot.onrender.com/api/notificar-compra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto: selected.title,
            article_code: selected.article_code || "Sin código",
            nombre: buyerName,
            whatsapp: buyerWhatsapp,
            email: buyerEmail || "No proporcionado",
            order: data.order_number.toString(),
            session_id: "compra_" + Date.now()
          }),
        });
      } catch (err) {
        console.log("Error al avisar a Telegram:", err);
      }
      // ------------------------------------

      setBuyOpen(false);
      setToast({ show: true, text: `Pedido #${data.order_number} listo. Redirigiendo al chat...` });
      
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("order", data.order_number.toString());
        params.set("producto", selected.title);
        params.set("nombre", buyerName);
        params.set("whatsapp", buyerWhatsapp);
        if (buyerEmail) params.set("email", buyerEmail);
        router.push(`/chat?${params.toString()}`);
        setToast({ show: false, text: "" });
      }, 2000);
    }

    setBuyLoading(false);
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  const filtered = useMemo(() => {
    return items
      .filter(
        (x) =>
          (selectedCategory === "all" || x.category === selectedCategory) &&
          (x.title.toLowerCase().includes(q.toLowerCase()) ||
            (x.article_code || "").toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => {
        const aPrem = premiumActive(a.premium_until);
        const bPrem = premiumActive(b.premium_until);
        if (aPrem && !bPrem) return -1;
        if (!aPrem && bPrem) return 1;
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; 
      });
  }, [items, q, selectedCategory]);

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      <style jsx global>{`
        @keyframes float { 0% { transform: translate(0,0); } 50% { transform: translate(15px, -30px); } 100% { transform: translate(0,0); } }
        .bubble-float { animation: float linear infinite; }
        .topbar-hero { background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.62)), radial-gradient(circle at top left, rgba(0,102,255,0.18), transparent 32%), radial-gradient(circle at top right, rgba(255,180,0,0.20), transparent 34%); backdrop-filter: blur(18px); border-bottom: 2px solid rgba(255,255,255,0.45); box-shadow: 0 12px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.72); }
        .brand-3d { position: relative; display: inline-flex; flex-direction: column; line-height: 0.88; text-decoration: none; cursor: pointer; transform-style: preserve-3d; transition: transform 0.25s ease, filter 0.25s ease; }
        .brand-amazon { font-size: 31px; font-weight: 950; font-style: italic; letter-spacing: -1.4px; color: #0066FF; text-shadow: 0 1px 0 #ffffff, 0 2px 0 #9bc7ff, 0 4px 0 #004bbd, 0 7px 14px rgba(0,102,255,0.45); }
        .brand-py { color: #F4C400; text-shadow: 0 1px 0 #ffffff, 0 2px 0 #ffe98a, 0 4px 0 #cc8d00, 0 7px 14px rgba(244,196,0,0.50); }
        .search-hero { background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.86)); border: 2px solid rgba(255,255,255,0.72); box-shadow: inset 0 3px 8px rgba(0,0,0,0.10), 0 8px 18px rgba(0,0,0,0.12); transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .nav-action-btn { position: relative; overflow: hidden; cursor: pointer; border: 3px solid rgba(255,255,255,0.62); border-radius: 999px; padding: 10px 18px; font-size: 12px; font-weight: 950; color: white; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; text-decoration: none; }
        .nav-panel-btn { background: linear-gradient(135deg, #1F8BFF 0%, #0066FF 48%, #1437D9 100%); }
        .nav-login-btn { background: linear-gradient(135deg, #12D88F 0%, #0BAF73 45%, #066A48 100%); }
        .nav-register-btn { background: linear-gradient(135deg, #FFB000 0%, #FF6A00 45%, #FF2D00 100%); }
        .nav-logout-btn { background: linear-gradient(135deg, #FF5D7A 0%, #EF174B 48%, #B90F35 100%); padding: 9px 14px; font-size: 11px; }
        .card-shell { position: relative; padding: 14px; background: linear-gradient(180deg, #bddcff 0%, #9ecbfd 100%); box-shadow: 0 18px 40px rgba(74, 136, 230, 0.28), 0 0 0 2px rgba(255,255,255,0.28) inset; transition: transform 0.25s ease, box-shadow 0.25s ease; overflow: hidden; border-radius: 2rem; }
        .card-inner-wave { background: rgba(255,255,255,0.92); padding: 1.25rem; display: flex; flex-direction: column; height: 100%; border-radius: 1.5rem; }
        .login-shell { background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%); border: 3px solid rgba(120, 177, 245, 0.95); box-shadow: 0 18px 40px rgba(58, 116, 204, 0.30), 0 0 0 2px rgba(255,255,255,0.16) inset; }
        .login-inner { background: rgba(255,255,255,0.93); border: 1px solid rgba(255,255,255,0.80); box-shadow: 0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60); }
        .field-soft { background: rgba(255,255,255,0.88); border: 2px solid rgba(47,168,79,0.75); box-shadow: 0 4px 14px rgba(47,168,79,0.10), inset 0 1px 0 rgba(255,255,255,0.65); }
        .cat-menu-glow { background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07)), radial-gradient(circle at top left, rgba(255,122,0,0.25), transparent 35%), radial-gradient(circle at top right, rgba(0,209,255,0.20), transparent 35%); border: 2px solid rgba(255,255,255,0.30); border-radius: 34px; }
        .cat-btn-glow { position: relative; overflow: hidden; min-width: 118px; height: 96px; border-radius: 28px; border: 3px solid rgba(255,255,255,0.55); box-shadow: 0 9px 0 rgba(0,0,0,0.20); }
        .cat-icon-bubble { width: 48px; height: 48px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.18) 35%, rgba(0,0,0,0.10) 100%); }
        .cat-title-glow { font-size: 13px; line-height: 1; font-weight: 950; letter-spacing: -0.2px; color: white; text-align: center; text-shadow: 0 2px 2px rgba(0,0,0,0.55); }
        .cat-btn-selected { transform: translateY(-5px) scale(1.08); border-color: white; box-shadow: 0 0 0 5px rgba(255,255,255,0.32); }
      `}</style>

      {/* FONDO */}
      <div className="fixed inset-0 z-0">
        <img src="/fondo-amazonpy.jpg" alt="Fondo" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 topbar-hero">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 gap-4">
            <Link href="/" className="brand-3d">
              <span className="brand-amazon">AMAZON<span className="brand-py">PY</span></span>
            </Link>

            <div className="flex-1 max-w-md hidden md:block">
              <input
                type="text"
                placeholder="¿Qué buscas hoy?"
                className="search-hero w-full rounded-full px-6 py-2.5 outline-none text-sm text-slate-700"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              {!sessionUser ? (
                <>
                  <Link href="/login" className="nav-action-btn nav-login-btn">Entrar</Link>
                  <Link href="/register" className="nav-action-btn nav-register-btn hidden sm:flex">Registrarme</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="nav-action-btn nav-panel-btn">Mi Panel</Link>
                  <button onClick={logout} className="nav-action-btn nav-logout-btn">Salir</button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 pt-8 flex justify-center">
          <div className="flex-1 max-w-5xl overflow-hidden rounded-[40px] md:rounded-[55px] shadow-2xl">
            <img src="/hero-amazonpy-6.png" alt="Banner" className="block w-full h-auto" />
          </div>
        </section>

        {/* --- APP INSTALL --- */}
        {isInstallable && (
          <section className="mx-auto max-w-4xl px-4 pt-6 flex justify-center">
            <button
              onClick={handleInstallClick}
              className="w-full md:w-auto rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 font-black text-white shadow-lg border-2 border-white hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📲</span> Instalar App Aclasif
            </button>
          </section>
        )}

        {/* CATEGORÍAS */}
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="cat-menu-glow p-5 flex gap-5 overflow-x-auto pb-5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${selectedCategory === "all" ? "cat-btn-selected" : ""}`}
              style={{ background: "linear-gradient(135deg, #FFB000 0%, #FF6A00 45%, #FF2D00 100%)", color: "#FFFFFF" }}
            >
              <span className="relative z-10 cat-icon-bubble text-white">
                <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
                  <path d="M12 38c0-12 9-22 20-22s20 10 20 22" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                  <path d="M20 38c0-7 5-14 12-14s12 7 12 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                  <path d="M28 38c0-3 2-6 4-6s4 3 4 6" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
              <span className="relative z-10 cat-title-glow">Todas</span>
            </button>

            {categories.map((c) => {
              const catColor = categoryColors[c.name] || categoryColors[c.slug] || "#64748B";
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${selectedCategory === c.slug ? "cat-btn-selected" : ""}`}
                  style={{ background: `linear-gradient(135deg, ${catColor} 0%, ${catColor} 45%, #111827 140%)`, color: "#FFFFFF" }}
                >
                  <span className="relative z-10 cat-icon-bubble text-white">
                    <CategoryVisualIcon name={c.name} />
                  </span>
                  <span className="relative z-10 cat-title-glow">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS - CELULAR ARREGLADO (grid-cols-1) */}
        <section className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((it) => (
            <div key={it.id} className="card-shell">
              <article className="group card-inner-wave">
                <Link href={`/producto/${it.article_code || "#"}`} className="relative h-52 w-full overflow-hidden rounded-[1.5rem] bg-gray-50 mb-4 flex items-center justify-center border-2 border-white">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title} className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="text-blue-100 font-black italic text-2xl">AmazonPy</div>
                  )}
                  {premiumActive(it.premium_until) && (
                    <div className="absolute top-4 right-4 bg-[#F4C400] text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-white animate-pulse">
                      ⭐ PREMIUM
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <div className="inline-flex items-center gap-1 font-black text-[9px] uppercase rounded-full px-2 py-1 border border-white shadow-sm text-white" style={{ backgroundColor: categoryColors[it.category] || "#64748B" }}>
                      <span>{getIcon(it.category)}</span> {it.category}
                    </div>

                    {it.condicion === "usado" ? (
                      <div className="inline-flex items-center gap-1">
                        <span className="bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">Usado</span>
                        {it.detalles_condicion && (
                          <button onClick={(e) => { e.preventDefault(); setDefectModal({show: true, text: it.detalles_condicion || ""}); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full text-[9px] font-bold uppercase shadow-sm">Ver detalles</button>
                        )}
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">Nuevo</span>
                    )}
                  </div>

                  {it.article_code && (
                    <p className="mb-2 text-[11px] font-black text-[#F4C400]">Articulo: {it.article_code}</p>
                  )}

                  <h3 className="font-extrabold text-slate-800 text-base md:text-sm line-clamp-2 leading-tight mb-2">
                    {it.title}
                  </h3>

                  <p className="text-2xl font-black text-[#0066FF]">{formatGs(it.price_usd)}</p>
                </div>

                {it.stock !== undefined && it.stock <= 0 ? (
                  <div className="w-full mt-4 flex items-center justify-center rounded-2xl bg-red-100 border border-red-300 py-4 text-red-600 font-black text-xs uppercase shadow-sm cursor-not-allowed opacity-80">
                    ❌ Agotado
                  </div>
                ) : (
                  <button onClick={() => { setSelected(it); setBuyOpen(true); }} className="w-full mt-4 rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    Comprar ya
                  </button>
                )}
              </article>
            </div>
          ))}
        </section>
      </div>

      {/* MODAL DETALLES */}
      {defectModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDefectModal({show: false, text: ""})}>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDefectModal({show: false, text: ""})} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl font-black">✕</button>
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 text-2xl">⚠️</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Detalles del artículo</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-4">{defectModal.text}</p>
          </div>
        </div>
      )}

      {/* MODAL DE COMPRA */}
      {buyOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 relative">
              <h2 className="text-xl font-black text-slate-800 mb-1">Finalizar <span className="text-[#2FA84F]">Pedido</span></h2>
              <p className="text-sm text-slate-500 mb-4">{selected.title}</p>
              <button onClick={() => setBuyOpen(false)} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-2xl">✕</button>

              <div className="space-y-3">
                <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Nombre y Apellido" className="field-soft w-full rounded-2xl px-4 py-3 text-sm outline-none" required />
                <input value={buyerWhatsapp} onChange={e => setBuyerWhatsapp(e.target.value)} placeholder="Tu WhatsApp (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm outline-none" required />
                <input value={buyerCity} onChange={e => setBuyerCity(e.target.value)} placeholder="Ciudad (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm outline-none" required />
                <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Dirección de entrega" className="field-soft w-full rounded-2xl px-4 py-3 text-sm outline-none h-20 resize-none" required />
                <div>
                  <input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="Correo electrónico (no obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm outline-none" />
                  <p className="text-[11px] text-gray-400 mt-1 ml-2">No obligatorio</p>
                </div>
                
                <button onClick={createOrder} disabled={buyLoading} className="mt-4 w-full rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-sm uppercase shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                  {buyLoading ? "Procesando..." : "Confirmar y enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[101] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-bounce">
          {toast.text}
        </div>
      )}

      <AclasifStickyDock />
      <AclasifChat />
    </main>
  );
}