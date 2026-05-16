"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AclasifChat from "./components/AclasifChat";
import { useRouter } from "next/navigation";

// --- TIPOS Y CONFIGURACIÓN ---
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

  if (n.includes("fitness")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M12 36h7V24h8v12h10V24h8v12h7v8h-7v8h-8v-8H27v8h-8v-8h-7v-8z" fill="currentColor" />
      </svg>
    );
  }

  if (n.includes("hogar")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M10 31 32 13l22 18" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 29v24h30V29" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
        <path d="M27 53V39h10v14" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    );
  }

  if (n.includes("perfume")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M26 10h12v10H26V10z" fill="currentColor" />
        <path d="M22 22h20c5 0 9 4 9 9v16c0 5-4 9-9 9H22c-5 0-9-4-9-9V31c0-5 4-9 9-9z" stroke="currentColor" strokeWidth="6" />
        <path d="M25 36h14" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M48 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="currentColor" />
      </svg>
    );
  }

  if (n.includes("reloj")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="7" />
        <path d="M32 20v13l9 6" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (n.includes("ropa") || n.includes("moda")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M23 13h18l8 7 8 4-6 11-7-3v20H20V32l-7 3-6-11 8-4 8-7z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        <path d="M25 14c1 5 4 8 7 8s6-3 7-8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (n.includes("calzado")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M12 39c10 2 16-4 20-14l8 12h8c6 0 10 4 10 9v5H14c-5 0-8-4-8-8v-5l6 1z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      </svg>
    );
  }

  if (n.includes("accesorio")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <circle cx="32" cy="32" r="17" stroke="currentColor" strokeWidth="7" />
        <path d="M32 17V8M32 56v-9M47 32h9M8 32h9" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M32 23v10l7 5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (n.includes("suplemento")) {
    return (
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <path d="M22 15h20l4 7v28c0 4-3 7-7 7H25c-4 0-7-3-7-7V22l4-7z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        <path d="M24 30h16M32 22v16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
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
      setBuyOpen(false);
      setToast({ show: true, text: `Pedido #${data.order_number} listo. Redirigiendo al chat...` });
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("order", data.order_number);
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
      .sort(
        (a, b) =>
          (premiumActive(b.premium_until) ? 1 : 0) - (premiumActive(a.premium_until) ? 1 : 0)
      );
  }, [items, q, selectedCategory]);

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

        /* BORDE CELESTE ONDULADO */
        .card-shell {
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

        .card-shell:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow:
            0 26px 54px rgba(116, 173, 255, 0.28),
            0 0 0 2px rgba(255,255,255,0.45) inset;
        }

        .card-shell > * {
          position: relative;
          z-index: 1;
        }

        /* FONDO BLANCO GRANDE TAMBIEN ONDULADO */
        .card-inner-wave {
          background: rgba(255,255,255,0.92);
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

        /* ESTILOS DEL MODAL DE COMPRA (igual que el login) */
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

        /* MENÚ DE CATEGORÍAS ESTILO HERO CON ICONOS SVG */
        .cat-menu-glow {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07)),
            radial-gradient(circle at top left, rgba(255,122,0,0.25), transparent 35%),
            radial-gradient(circle at top right, rgba(0,209,255,0.20), transparent 35%);
          border: 2px solid rgba(255,255,255,0.30);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.35);
          border-radius: 34px;
        }

        .cat-btn-glow {
          position: relative;
          overflow: hidden;
          min-width: 118px;
          height: 96px;
          border-radius: 28px;
          border: 3px solid rgba(255,255,255,0.55);
          box-shadow:
            0 9px 0 rgba(0,0,0,0.20),
            0 18px 26px rgba(0,0,0,0.30),
            inset 0 5px 9px rgba(255,255,255,0.48),
            inset 0 -8px 12px rgba(0,0,0,0.22);
          text-shadow:
            0 2px 2px rgba(0,0,0,0.45),
            0 0 8px rgba(255,255,255,0.45);
        }

        .cat-btn-glow::before {
          content: "";
          position: absolute;
          top: 7px;
          left: 12px;
          right: 12px;
          height: 35%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.06));
          pointer-events: none;
        }

        .cat-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.18) 35%, rgba(0,0,0,0.10) 100%);
          box-shadow:
            inset 0 4px 8px rgba(255,255,255,0.45),
            inset 0 -6px 10px rgba(0,0,0,0.18),
            0 4px 10px rgba(0,0,0,0.25);
        }

        .cat-title-glow {
          font-size: 13px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -0.2px;
          color: white;
          text-align: center;
          text-shadow:
            0 2px 2px rgba(0,0,0,0.55),
            0 0 9px rgba(255,255,255,0.45);
        }

        .cat-btn-glow:hover {
          transform: translateY(-4px) scale(1.06);
          filter: brightness(1.18) saturate(1.28);
        }

        .cat-btn-selected {
          transform: translateY(-5px) scale(1.08);
          border-color: white;
          box-shadow:
            0 0 0 5px rgba(255,255,255,0.32),
            0 0 28px rgba(255,255,255,0.45),
            0 10px 0 rgba(0,0,0,0.22),
            0 22px 34px rgba(0,0,0,0.35),
            inset 0 5px 9px rgba(255,255,255,0.52),
            inset 0 -8px 12px rgba(0,0,0,0.22);
        }
      `}</style>

      {/* FONDO NUEVO ILUSTRADO */}
      <div className="fixed inset-0 z-0">
        <img
          src="/fondo-amazonpy.jpg"
          alt="Fondo AmazonPY"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Burbujas flotantes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 bubble-float"
            style={{
              background: ["#FFF", "#F4C400", "#00D084"][i % 3],
              width: `${25 + Math.random() * 30}px`,
              height: `${25 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-4">
            <Link href="/" className="relative inline-block leading-none">
              <span className="absolute -top-3 left-1 text-[15px] font-black text-black not-italic">
                by:
              </span>
              <span className="text-3xl font-black italic text-[#0066FF]">
                AMAZON<span className="text-[#F4C400]">PY</span>
              </span>
            </Link>

            <div className="flex-1 max-w-md hidden md:block">
              <input
                type="text"
                placeholder="¿Qué buscas hoy?"
                className="w-full rounded-full bg-white/90 px-6 py-2 shadow-inner outline-none focus:ring-4 focus:ring-blue-300"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              {!sessionUser ? (
                <>
                  <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600">
                    Entrar
                  </Link>
                  <Link href="/register" className="rounded-full bg-black px-6 py-2 text-sm font-black text-white hover:scale-105 transition">
                    REGISTRARME
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="rounded-full bg-[#0066FF] px-6 py-2 text-sm font-black text-white shadow-lg">
                    MI PANEL
                  </Link>
                  <button onClick={logout} className="text-xs font-bold text-red-500 underline">
                    Salir
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-8 flex items-center justify-center gap-6">
          <div className="hidden lg:flex flex-col items-center group transition-transform hover:scale-110">
            <a href="https://www.facebook.com/amazon.paraguay" target="_blank" className="bg-white/80 p-4 rounded-full shadow-lg mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest drop-shadow-sm">
              Síguenos
            </span>
          </div>

          <div
            className="flex-1 max-w-5xl overflow-hidden bg-transparent shadow-none"
            style={{
              borderRadius: "55px",
            }}
          >
            <img
              src="/hero-amazonpy-6.png"
              alt="Banner"
              className="block w-full h-auto"
              style={{
                borderRadius: "55px",
                display: "block",
              }}
            />
          </div>

          <div className="hidden lg:flex flex-col items-center group transition-transform hover:scale-110">
            <a href="https://instagram.com/amazon_paraguay" target="_blank" className="bg-white/80 p-4 rounded-full shadow-lg mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="hero-insta" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#f09433" }} />
                    <stop offset="25%" style={{ stopColor: "#e6683c" }} />
                    <stop offset="50%" style={{ stopColor: "#dc2743" }} />
                    <stop offset="75%" style={{ stopColor: "#cc2366" }} />
                    <stop offset="100%" style={{ stopColor: "#bc1888" }} />
                  </linearGradient>
                </defs>
                <path fill="url(#hero-insta)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <span className="text-[11px] font-black text-pink-600 uppercase tracking-widest drop-shadow-sm">
              Síguenos
            </span>
          </div>
        </section>

        {/* MENÚ DE CATEGORÍAS CON ICONOS CREADOS */}
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="cat-menu-glow p-5 flex gap-5 overflow-x-auto pb-5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${
                selectedCategory === "all" ? "cat-btn-selected" : ""
              }`}
              style={{
                background: "linear-gradient(135deg, #FFB000 0%, #FF6A00 45%, #FF2D00 100%)",
                color: "#FFFFFF",
              }}
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
              const isSelected = selectedCategory === c.slug;

              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`cat-btn-glow flex flex-col items-center justify-center gap-2 text-white transition-all duration-300 whitespace-nowrap ${
                    isSelected ? "cat-btn-selected" : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${catColor} 0%, ${catColor} 45%, #111827 140%)`,
                    color: "#FFFFFF",
                  }}
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

        {/* GRILLA DE PRODUCTOS */}
        <section className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((it) => (
            <div key={it.id} className="card-shell">
              <article className="group card-inner-wave">
                <Link
                  href={`/producto/${it.article_code || "#"}`}
                  className="relative h-52 w-full overflow-hidden rounded-[2rem] bg-gray-50 mb-4 flex items-center justify-center border-2 border-white"
                >
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
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
                  <div
                    className="inline-flex items-center gap-1.5 mb-2 font-black text-[10px] uppercase rounded-full px-3 py-1 border-2 border-white shadow-sm text-white"
                    style={{ backgroundColor: categoryColors[it.category] || "#64748B" }}
                  >
                    <span>{getIcon(it.category)}</span> {it.category}
                  </div>

                  {it.article_code && (
                    <p className="mb-2 text-[11px] font-black text-[#F4C400]">
                      Articulo: {it.article_code}
                    </p>
                  )}

                  <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-tight mb-2">
                    {it.title}
                  </h3>

                  {it.description && (
                    <div className="mb-3 rounded-2xl bg-black/10 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">Descripcion</p>
                      <p className="text-sm text-slate-800 line-clamp-2">
                        {it.description}
                      </p>
                    </div>
                  )}

                  <p className="text-2xl font-black text-[#0066FF]">
                    {formatGs(it.price_usd)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelected(it);
                    setBuyOpen(true);
                  }}
                  className="w-full mt-4 rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Comprar ya
                </button>
              </article>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="relative mt-20 bg-[#E0F7FA] border-t border-white/20 pt-16 pb-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 items-start">
              <div className="space-y-4 -mt-10">
                <img src="/amazonpy-footer.png" alt="AmazonPy" className="h-50 w-auto object-contain" />
                <p className="text-slate-700 text-sm font-bold leading-relaxed">
                  La plataforma de clasificados más divertida y segura de Paraguay.
                  Comprá y vendé de todo con un solo clic. 🇵🇾
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter mb-6">Navegación</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-600">
                  <li><Link href="/nosotros" className="hover:text-[#0066FF]">Sobre Nosotros</Link></li>
                  <li><Link href="/como-vender" className="hover:text-[#0066FF]">¿Cómo vender?</Link></li>
                  <li><Link href="/premium" className="hover:text-[#0066FF]">Ser Premium ⭐</Link></li>
                  <li><Link href="/ayuda" className="hover:text-[#0066FF]">Centro de Ayuda</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter mb-6">Legales</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-600 mb-8">
                  <li><Link href="/terminos" className="hover:text-[#0066FF]">Términos y Condiciones</Link></li>
                  <li><Link href="/privacidad" className="hover:text-[#0066FF]">Política de Privacidad</Link></li>
                </ul>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">SÍGUENOS</p>
                  <div className="flex gap-4">
                    <a href="https://www.facebook.com/amazon.paraguay" target="_blank" className="transition-transform hover:scale-110">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a href="https://instagram.com/amazon_paraguay" target="_blank" className="transition-transform hover:scale-110">
                      <svg width="40" height="40" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="footer-insta-color" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "#f09433" }} />
                            <stop offset="25%" style={{ stopColor: "#e6683c" }} />
                            <stop offset="50%" style={{ stopColor: "#dc2743" }} />
                            <stop offset="75%" style={{ stopColor: "#cc2366" }} />
                            <stop offset="100%" style={{ stopColor: "#bc1888" }} />
                          </linearGradient>
                        </defs>
                        <path fill="url(#footer-insta-color)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791-4 4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter mb-6">Contacto Directo</h4>
                <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border-2 border-white space-y-4">
                  {/* CHAT EN VIVO */}
                  <a
                    href="/chat"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#0066FF]/10 hover:bg-[#0066FF]/20 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-lg">💬</div>
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-[#0066FF] transition">Chat en vivo</p>
                      <p className="text-xs text-slate-500">Consultas, reclamos, ayuda</p>
                    </div>
                  </a>

                  {/* TELEGRAM */}
                  <a
                    href="https://t.me/Aclasif_Bot"
                    target="_blank"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.478 8.156l-1.831 8.628c-.136.612-.496.764-1.006.476l-2.778-2.047-1.34 1.288c-.148.148-.272.272-.56.272l.2-2.822 5.14-4.644c.224-.2-.048-.312-.348-.112L9.09 13.37l-2.6-.812c-.564-.176-.576-.564.12-.836L16.77 7.84c.54-.2 1.016.132.708.316z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-[#0088cc] transition">Telegram</p>
                      <p className="text-xs text-slate-500">@Aclasif_Bot</p>
                    </div>
                  </a>

                  {/* WHATSAPP ADMIN (solo urgencias) */}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400 mb-2">⚠️ Solo Para Urgencias </p>
                    <a
                      href={`https://wa.me/${ADMIN_WHATSAPP}`}
                      target="_blank"
                      className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#2FA84F] transition"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#2FA84F">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      URGENCIAS 
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900/10 pt-8 mt-8 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[4px]">
                © 2026 AMAZONPY CLASIFICADOS - TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* MODAL DE COMPRA CON ESTILO LOGIN */}
      {buyOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 relative">
              <div className="mb-4 flex justify-center">
                <img
                  src="/aclasif-logo.png"
                  alt="Aclasif"
                  style={{ width: "220px", height: "auto" }}
                  className="object-contain"
                />
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-1">
                Finalizar <span className="text-[#2FA84F]">Pedido</span>
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {selected.title}
              </p>

              <button
                onClick={() => setBuyOpen(false)}
                className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-2xl"
              >
                ✕
              </button>

              <div className="space-y-3">
                <input
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
                  required
                />
                <input
                  value={buyerWhatsapp}
                  onChange={e => setBuyerWhatsapp(e.target.value)}
                  placeholder="Tu WhatsApp (obligatorio)"
                  className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
                  required
                />
                <input
                  value={buyerCity}
                  onChange={e => setBuyerCity(e.target.value)}
                  placeholder="Ciudad (obligatorio)"
                  className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
                  required
                />
                <textarea
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                  placeholder="Dirección de entrega (obligatorio)"
                  className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30 h-20 resize-none"
                  required
                />
                <div>
                  <input
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="Correo electrónico (no obligatorio)"
                    className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 ml-2">No obligatorio</p>
                </div>

                <button
                  onClick={createOrder}
                  disabled={buyLoading}
                  className="mt-4 w-full rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-sm uppercase shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
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

      {/* ASISTENTE VIRTUAL */}
      <AclasifChat />
    </main>
  );
}