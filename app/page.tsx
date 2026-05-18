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
        .brand-3d:hover { transform: translateY(-3px) scale(1.04) rotate(-1deg); filter: saturate(1.18) brightness(1.06); }
        .brand-by { font-size: 13px; font-weight: 950; color: #0f172a; margin-left: 4px; margin-bottom: 2px; text-shadow: 0 1px 0 rgba(255,255,255,0.85), 0 2px 4px rgba(0,0,0,0.22); }
        .brand-amazon { font-size: 31px; font-weight: 950; font-style: italic; letter-spacing: -1.4px; color: #0066FF; text-shadow: 0 1px 0 #ffffff, 0 2px 0 #9bc7ff, 0 4px 0 #004bbd, 0 7px 14px rgba(0,102,255,0.45); }
        .brand-py { color: #F4C400; text-shadow: 0 1px 0 #ffffff, 0 2px 0 #ffe98a, 0 4px 0 #cc8d00, 0 7px 14px rgba(244,196,0,0.50); }
        .search-hero { background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.86)); border: 2px solid rgba(255,255,255,0.72); box-shadow: inset 0 3px 8px rgba(0,0,0,0.10), 0 8px 18px rgba(0,0,0,0.12); transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .search-hero:focus { transform: translateY(-2px); box-shadow: inset 0 3px 8px rgba(0,0,0,0.10), 0 0 0 5px rgba(0,102,255,0.22), 0 12px 24px rgba(0,102,255,0.16); }
        .nav-action-btn { position: relative; overflow: hidden; cursor: pointer; border: 3px solid rgba(255,255,255,0.62); border-radius: 999px; padding: 10px 18px; font-size: 12px; font-weight: 950; color: white; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; text-decoration: none; box-shadow: 0 7px 0 rgba(0,0,0,0.20), 0 14px 22px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.42), inset 0 -6px 10px rgba(0,0,0,0.18); text-shadow: 0 2px 2px rgba(0,0,0,0.40), 0 0 8px rgba(255,255,255,0.32); transition: transform 0.22s ease, filter 0.22s ease, box-shadow 0.22s ease; }
        @media (max-width: 767px) {
          .nav-action-btn {
            padding: 6px 7px;
            font-size: 9px;
            gap: 3px;
            border-width: 2px;
          }

          .nav-action-btn .nav-icon-dot {
            width: 16px;
            height: 16px;
            font-size: 10px;
          }

          .brand-by {
            font-size: 9px;
          }

          .brand-amazon {
            font-size: 23px;
            letter-spacing: -1px;
          }
        }
        .nav-action-btn::before { content: ""; position: absolute; top: 5px; left: 14px; right: 14px; height: 35%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.05)); pointer-events: none; }
        .nav-action-btn:hover { transform: translateY(-4px) scale(1.06); filter: brightness(1.14) saturate(1.2); }
        .nav-action-btn:active { transform: translateY(2px) scale(0.98); }
        .nav-panel-btn { background: linear-gradient(135deg, #1F8BFF 0%, #0066FF 48%, #1437D9 100%); }
        .nav-login-btn { background: linear-gradient(135deg, #12D88F 0%, #0BAF73 45%, #066A48 100%); }
        .nav-register-btn { background: linear-gradient(135deg, #FFB000 0%, #FF6A00 45%, #FF2D00 100%); }
        .nav-logout-btn { background: linear-gradient(135deg, #FF5D7A 0%, #EF174B 48%, #B90F35 100%); padding: 9px 14px; font-size: 11px; }
        .nav-icon-dot { position: relative; z-index: 1; width: 22px; height: 22px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.20) 38%, rgba(0,0,0,0.12) 100%); box-shadow: inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.16), 0 2px 5px rgba(0,0,0,0.20); font-size: 13px; }
        .nav-label { position: relative; z-index: 1; }
        .card-shell { position: relative; padding: 14px; background: linear-gradient(180deg, #bddcff 0%, #9ecbfd 100%); box-shadow: 0 18px 40px rgba(74, 136, 230, 0.28), 0 0 0 2px rgba(255,255,255,0.28) inset; transition: transform 0.25s ease, box-shadow 0.25s ease; overflow: hidden; clip-path: polygon(8% 2%, 18% 0%, 32% 3%, 50% 1%, 68% 4%, 82% 0%, 92% 3%, 98% 10%, 100% 22%, 98% 34%, 100% 50%, 97% 66%, 100% 80%, 95% 92%, 84% 98%, 70% 100%, 54% 98%, 38% 100%, 22% 97%, 10% 100%, 2% 92%, 0% 78%, 3% 62%, 0% 48%, 2% 34%, 0% 20%, 4% 8%); }
        .card-shell:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 26px 54px rgba(116, 173, 255, 0.28), 0 0 0 2px rgba(255,255,255,0.45) inset; }
        .card-shell > * { position: relative; z-index: 1; }
        .card-inner-wave { background: rgba(255,255,255,0.92); padding: 1.25rem; display: flex; flex-direction: column; height: 100%; box-shadow: 0 10px 24px rgba(0,0,0,0.08); clip-path: polygon(8% 2%, 18% 0%, 32% 3%, 50% 1%, 68% 4%, 82% 0%, 92% 3%, 98% 10%, 100% 22%, 98% 34%, 100% 50%, 97% 66%, 100% 80%, 95% 92%, 84% 98%, 70% 100%, 54% 98%, 38% 100%, 22% 97%, 10% 100%, 2% 92%, 0% 78%, 3% 62%, 0% 48%, 2% 34%, 0% 20%, 4% 8%); }
        .login-shell { background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%); border: 3px solid rgba(120, 177, 245, 0.95); box-shadow: 0 18px 40px rgba(58, 116, 204, 0.30), 0 0 0 2px rgba(255,255,255,0.16) inset; }
        .login-inner { background: rgba(255,255,255,0.93); border: 1px solid rgba(255,255,255,0.80); box-shadow: 0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60); }
        .field-soft { background: rgba(255,255,255,0.88); border: 2px solid rgba(47,168,79,0.75); box-shadow: 0 4px 14px rgba(47,168,79,0.10), inset 0 1px 0 rgba(255,255,255,0.65); }
        .cat-menu-glow { background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07)), radial-gradient(circle at top left, rgba(255,122,0,0.25), transparent 35%), radial-gradient(circle at top right, rgba(0,209,255,0.20), transparent 35%); border: 2px solid rgba(255,255,255,0.30); box-shadow: 0 18px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.35); border-radius: 34px; }
        .cat-btn-glow { position: relative; overflow: hidden; min-width: 118px; height: 96px; border-radius: 28px; border: 3px solid rgba(255,255,255,0.55); box-shadow: 0 9px 0 rgba(0,0,0,0.20), 0 18px 26px rgba(0,0,0,0.30), inset 0 5px 9px rgba(255,255,255,0.48), inset 0 -8px 12px rgba(0,0,0,0.22); text-shadow: 0 2px 2px rgba(0,0,0,0.45), 0 0 8px rgba(255,255,255,0.45); }
        .cat-btn-glow::before { content: ""; position: absolute; top: 7px; left: 12px; right: 12px; height: 35%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.06)); pointer-events: none; }
        .cat-icon-bubble { width: 48px; height: 48px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.95), rgba(255,255,255,0.18) 35%, rgba(0,0,0,0.10) 100%); box-shadow: inset 0 4px 8px rgba(255,255,255,0.45), inset 0 -6px 10px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.25); }
        .cat-title-glow { font-size: 13px; line-height: 1; font-weight: 950; letter-spacing: -0.2px; color: white; text-align: center; text-shadow: 0 2px 2px rgba(0,0,0,0.55), 0 0 9px rgba(255,255,255,0.45); }
        .cat-btn-glow:hover { transform: translateY(-4px) scale(1.06); filter: brightness(1.18) saturate(1.28); }
        .cat-btn-selected { transform: translateY(-5px) scale(1.08); border-color: white; box-shadow: 0 0 0 5px rgba(255,255,255,0.32), 0 0 28px rgba(255,255,255,0.45), 0 10px 0 rgba(0,0,0,0.22), 0 22px 34px rgba(0,0,0,0.35), inset 0 5px 9px rgba(255,255,255,0.52), inset 0 -8px 12px rgba(0,0,0,0.22); }
        .footer-magic { position: relative; overflow: hidden; background: radial-gradient(circle at 12% 18%, rgba(255,122,0,0.24), transparent 28%), radial-gradient(circle at 82% 20%, rgba(0,209,255,0.25), transparent 30%), radial-gradient(circle at 55% 88%, rgba(168,85,247,0.20), transparent 34%), linear-gradient(180deg, rgba(5,10,30,0.96), rgba(7,15,42,0.98)); border-top: 3px solid rgba(255,255,255,0.18); box-shadow: 0 -20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20); }
        .footer-magic::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 35%, transparent 70%), radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px); background-size: 100% 100%, 34px 34px; opacity: 0.42; pointer-events: none; }
        .footer-glow-line { height: 5px; background: linear-gradient(90deg, #ff7a00, #f4c400, #00d084, #00aaff, #a855f7, #ff2d75); box-shadow: 0 0 18px rgba(255,255,255,0.45), 0 0 30px rgba(0,209,255,0.35); }
        .footer-brand-card { position: relative; overflow: hidden; border-radius: 34px; padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07)), radial-gradient(circle at top left, rgba(255,180,0,0.28), transparent 35%); border: 2px solid rgba(255,255,255,0.22); box-shadow: 0 18px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.35); }
        .footer-brand-card::before { content: ""; position: absolute; top: 10px; left: 18px; right: 18px; height: 32%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.20), transparent); pointer-events: none; }
        .footer-title-3d { font-size: 28px; font-weight: 950; font-style: italic; letter-spacing: -1px; color: #1f8bff; text-shadow: 0 1px 0 #fff, 0 2px 0 #9bc7ff, 0 4px 0 #004bbd, 0 8px 18px rgba(0,102,255,0.55); }
        .footer-title-py { color: #f4c400; text-shadow: 0 1px 0 #fff, 0 2px 0 #ffe98a, 0 4px 0 #b88700, 0 8px 18px rgba(244,196,0,0.55); }
        .footer-box { position: relative; overflow: hidden; border-radius: 30px; padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07)); border: 2px solid rgba(255,255,255,0.20); box-shadow: 0 16px 34px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25); }
        .footer-box::before { content: ""; position: absolute; top: 8px; left: 16px; right: 16px; height: 28%; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,0.17), transparent); pointer-events: none; }
        .footer-heading { position: relative; z-index: 1; font-size: 15px; font-weight: 950; color: white; text-transform: uppercase; letter-spacing: -0.3px; text-shadow: 0 2px 2px rgba(0,0,0,0.45), 0 0 10px rgba(255,255,255,0.30); }
        .footer-pill-link { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.88); font-weight: 850; font-size: 13px; padding: 10px 12px; border-radius: 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease; }
        .footer-pill-link:hover { transform: translateX(6px) scale(1.02); background: rgba(255,255,255,0.14); color: white; }
        .footer-mini-dot { width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.92), rgba(255,255,255,0.20), rgba(0,0,0,0.10)); box-shadow: inset 0 2px 4px rgba(255,255,255,0.38), inset 0 -3px 5px rgba(0,0,0,0.18); }
        .footer-contact-btn { position: relative; overflow: hidden; display: flex; align-items: center; gap: 14px; border-radius: 24px; padding: 14px; border: 2px solid rgba(255,255,255,0.22); color: white; transition: transform 0.22s ease, filter 0.22s ease; box-shadow: 0 8px 0 rgba(0,0,0,0.18), 0 16px 26px rgba(0,0,0,0.22), inset 0 3px 7px rgba(255,255,255,0.28), inset 0 -5px 8px rgba(0,0,0,0.18); }
        .footer-contact-btn:hover { transform: translateY(-4px) scale(1.03); filter: brightness(1.12) saturate(1.15); }
        .footer-contact-btn:active { transform: translateY(2px) scale(0.98); }
        .footer-contact-blue { background: linear-gradient(135deg, #1f8bff, #0066ff, #1437d9); }
        .footer-contact-cyan { background: linear-gradient(135deg, #00b7ff, #0088cc, #005f99); }
        .footer-contact-green { background: linear-gradient(135deg, #2dd46f, #13a852, #08753a); }
        .footer-social { width: 48px; height: 48px; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06)); border: 2px solid rgba(255,255,255,0.22); box-shadow: 0 8px 18px rgba(0,0,0,0.24), inset 0 3px 7px rgba(255,255,255,0.30); transition: transform 0.22s ease, filter 0.22s ease; }
        .footer-social:hover { transform: translateY(-5px) rotate(-3deg) scale(1.08); filter: brightness(1.18); }
        .footer-bottom-glass { border-radius: 999px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); box-shadow: inset 0 1px 0 rgba(255,255,255,0.18); }
      `}</style>

      {/* FONDO NUEVO ILUSTRADO */}
      <div className="fixed inset-0 z-0">
        <img
          src="/fondo-amazonpy.jpg"
          alt="Fondo AmazonPY"
          className="w-full h-full object-cover"
        />
      </div>

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
        <header className="sticky top-0 z-50 topbar-hero">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-2 gap-2 md:px-6 md:py-3 md:gap-4">
            <Link href="/" className="brand-3d scale-[0.82] origin-left md:scale-100 flex-shrink-0">
              <span className="brand-by">by:</span>
              <span className="brand-amazon">
                AMAZON<span className="brand-py">PY</span>
              </span>
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

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {!sessionUser ? (
                <>
                  <Link href="/login" className="nav-action-btn nav-login-btn">
                    <span className="nav-icon-dot">➜</span>
                    <span className="nav-label">Entrar</span>
                  </Link>
                  <Link href="/register" className="nav-action-btn nav-register-btn">
                    <span className="nav-icon-dot">★</span>
                    <span className="nav-label">Registrarme</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="nav-action-btn nav-panel-btn">
                    <span className="nav-icon-dot">●</span>
                    <span className="nav-label">Mi Panel</span>
                  </Link>
                  <button onClick={logout} className="nav-action-btn nav-logout-btn">
                    <span className="nav-icon-dot">↩</span>
                    <span className="nav-label">Salir</span>
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

        {/* --- BOTÓN DE INSTALAR APP ESTATICO --- */}
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
        {/* -------------------------------------- */}

        {/* MENÚ DE CATEGORÍAS */}
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
        <section className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <div
                      className="inline-flex items-center gap-1 font-black text-[9px] uppercase rounded-full px-2 py-1 border border-white shadow-sm text-white"
                      style={{ backgroundColor: categoryColors[it.category] || "#64748B" }}
                    >
                      <span>{getIcon(it.category)}</span> {it.category}
                    </div>

                    {it.condicion === "usado" ? (
                      <div className="inline-flex items-center gap-1">
                        <span className="bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">
                          Usado
                        </span>
                        {it.detalles_condicion && (
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              setDefectModal({show: true, text: it.detalles_condicion || ""}); 
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full text-[9px] font-bold uppercase transition shadow-sm"
                          >
                            Ver detalles 🔍
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">
                        Nuevo
                      </span>
                    )}
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

                {it.stock !== undefined && it.stock <= 0 ? (
                  <div className="w-full mt-4 flex items-center justify-center rounded-2xl bg-red-100 border border-red-300 py-4 text-red-600 font-black text-xs uppercase shadow-sm cursor-not-allowed opacity-80">
                    ❌ Agotado
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelected(it);
                      setBuyOpen(true);
                    }}
                    className="w-full mt-4 rounded-2xl bg-[#2FA84F] py-4 text-white font-black text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Comprar ya
                  </button>
                )}

              </article>
            </div>
          ))}
        </section>

        {/* FOOTER PREMIUM */}
        <footer className="footer-magic mt-20">
          <div className="footer-glow-line" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
              <div className="footer-brand-card lg:col-span-1">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="footer-title-3d mb-4">
                    AMAZON<span className="footer-title-py">PY</span>
                  </div>

                  <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-full bg-yellow-300/30 blur-2xl" />
                    <img
                      src="/amazonpy-footer.png"
                      alt="AmazonPy"
                      className="relative z-10 h-36 w-auto object-contain drop-shadow-2xl"
                    />
                  </div>

                  <p className="text-white/90 text-sm font-bold leading-relaxed drop-shadow">
                    La plataforma de clasificados más divertida y segura de Paraguay.
                    Comprá y vendé de todo con un solo clic. 🇵🇾
                  </p>

                  <div className="mt-5 inline-flex rounded-full bg-white/10 border border-white/20 px-4 py-2 text-[11px] font-black text-white/90 uppercase tracking-widest">
                    Seguro • Rápido • Fácil
                  </div>
                </div>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Navegación</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/sobre-nosotros" className="footer-pill-link">
                      <span className="footer-mini-dot">🏠</span>
                      <span>Sobre Nosotros</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/como-vender" className="footer-pill-link">
                      <span className="footer-mini-dot">🛒</span>
                      <span>¿Cómo vender?</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/ser-premium" className="footer-pill-link">
                      <span className="footer-mini-dot">⭐</span>
                      <span>Ser Premium</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/centro-ayuda" className="footer-pill-link">
                      <span className="footer-mini-dot">💬</span>
                      <span>Centro de Ayuda</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Legales</h4>
                <ul className="space-y-3 mb-7">
                  <li>
                    <Link href="/terminos" className="footer-pill-link">
                      <span className="footer-mini-dot">📜</span>
                      <span>Términos y Condiciones</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="footer-pill-link">
                      <span className="footer-mini-dot">🔒</span>
                      <span>Política de Privacidad</span>
                    </Link>
                  </li>
                </ul>

                <h4 className="footer-heading mb-4 text-[13px]">Síguenos</h4>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/amazon.paraguay" target="_blank" className="footer-social">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#3B82F6">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a href="https://instagram.com/amazon_paraguay" target="_blank" className="footer-social">
                    <svg width="30" height="30" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="footer-insta-color-premium" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: "#f09433" }} />
                          <stop offset="25%" style={{ stopColor: "#e6683c" }} />
                          <stop offset="50%" style={{ stopColor: "#dc2743" }} />
                          <stop offset="75%" style={{ stopColor: "#cc2366" }} />
                          <stop offset="100%" style={{ stopColor: "#bc1888" }} />
                        </linearGradient>
                      </defs>
                      <path fill="url(#footer-insta-color-premium)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="footer-box">
                <h4 className="footer-heading mb-5">Contacto Directo</h4>

                <div className="space-y-4">
                  <a href="/chat" className="footer-contact-btn footer-contact-blue">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                      💬
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Chat en vivo</p>
                      <p className="text-xs text-white/80">Consultas, reclamos, ayuda</p>
                    </div>
                  </a>

                  <a href="https://t.me/Aclasif_Bot" target="_blank" className="footer-contact-btn footer-contact-cyan">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.478 8.156l-1.831 8.628c-.136.612-.496.764-1.006.476l-2.778-2.047-1.34 1.288c-.148.148-.272.272-.56.272l.2-2.822 5.14-4.644c.224-.2-.048-.312-.348-.112L9.09 13.37l-2.6-.812c-.564-.176-.576-.564.12-.836L16.77 7.84c.54-.2 1.016.132.708.316z"/>
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Telegram</p>
                      <p className="text-xs text-white/80">@Aclasif_Bot</p>
                    </div>
                  </a>

                  <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" className="footer-contact-btn footer-contact-green">
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                      🟢
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-white">Urgencias</p>
                      <p className="text-xs text-white/80">Solo para casos importantes</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="footer-bottom-glass mt-12 px-6 py-5 text-center">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[5px]">
                © 2026 AMAZONPY CLASIFICADOS — TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* --- MODAL PARA DETALLES DE USO (POP-UP) --- */}
      {defectModal.show && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDefectModal({show: false, text: ""})}
        >
          <div 
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 transition-transform relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setDefectModal({show: false, text: ""})}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl font-black"
            >
              ✕
            </button>
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Detalles del artículo</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-4">
              {defectModal.text}
            </p>
            <button 
              onClick={() => setDefectModal({show: false, text: ""})} 
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 rounded-xl transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

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

      {/* BARRA DE BOTONES FIJA EN EL INICIO */}
      <AclasifStickyDock />

      {/* ASISTENTE VIRTUAL */}
      <AclasifChat />
    </main>
  );
}