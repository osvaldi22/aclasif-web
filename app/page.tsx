"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  description: string;
  price_usd: number;
  image_url: string;
  moderation_status: string;
  is_active: boolean;
  category: string;
  article_code: string;
};

type Category = {
  slug: string;
  name: string;
};

// Paleta de colores para las burbujas
const bubbleColors = [
  "bg-[#9fcbff]", // Azul claro del logo
  "bg-[#FFF]", // Blanco
  "bg-[#F4C400]", // Amarillo AmazonPY
  "bg-[#00D084]", // Verde brillante
];

function formatGs(value: number) {
  return `Gs. ${value.toLocaleString("es-PY")}`;
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  useEffect(() => {
    setMounted(true);
    checkUser();
    loadCategories();
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [search, selectedCategory, listings]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function loadCategories() {
    const { data, error } = await supabase.from("categories").select("slug,name").eq("is_active", true).order("name", { ascending: true });
    if (!error && data) {
      setCategories(data as Category[]);
    }
  }

  async function loadListings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("is_active", true)
      .eq("moderation_status", "verified")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setListings(data as Listing[]);
      setFilteredListings(data as Listing[]);
    }
    setLoading(false);
  }

  function filterListings() {
    let temp = [...listings];

    if (selectedCategory !== "todos") {
      temp = temp.filter(l => l.category === selectedCategory);
    }

    if (search.trim()) {
      const s = search.toLowerCase().trim();
      temp = temp.filter(l => 
        l.title.toLowerCase().includes(s) || 
        (l.article_code && l.article_code.toLowerCase().includes(s))
      );
    }

    setFilteredListings(temp);
  }

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      {/* Estilos globales para animaciones */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(15px, -30px); }
          100% { transform: translate(0, 0); }
        }
        .bubble-float {
          animation: float linear infinite;
        }
        @keyframes subtleZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        .hero-bg-animate {
          animation: subtleZoom 20s arial infinite alternate;
        }
        .header-soft {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .page-inner {
          background: rgba(255, 255, 255, 0.93);
          border: 1px solid rgba(255, 255, 255, 0.80);
          box-shadow: 0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60);
        }
        .field-soft {
          background: rgba(255, 255, 255, 0.88);
          border: 2px solid rgba(47, 168, 79, 0.75);
          box-shadow: 0 4px 14px rgba(47, 168, 79, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.65);
        }
        .mini-card-yellow {
          background: rgba(255, 248, 210, 0.86);
          border: 2px solid rgba(244, 196, 0, 0.75);
          box-shadow: 0 6px 16px rgba(244, 196, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
      `}</style>

      {/* Fondo de imagen de la página completa */}
      <div className="fixed inset-0 z-0">
        <img src="/fondo-amazonpy.jpg" alt="Fondo" className="w-full h-full object-cover" />
      </div>

      {/* Burbujas Flotantes de Fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-40 bubble-float ${bubbleColors[i % bubbleColors.length]}`}
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 7}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido Relativo */}
      <div className="relative z-10 min-h-screen pb-10">
        
        {/* HEADER CORREGIDO PARA CELULAR ( gap-2 y p-2) */}
        <header className="header-soft sticky top-0 z-50 p-2 md:p-4">
          <div className="flex items-center justify-between gap-2 max-w-[1900px] mx-auto">
            {/* Logo CORREGIDO (h-10 para celular) */}
            <Link href="/" className="flex-shrink-0">
              <img src="/aclasif-logo.png" alt="Aclasif" className="h-10 md:h-16 w-auto object-contain" />
            </Link>

            <div className="flex-grow max-w-lg hidden md:block">
              <input 
                type="search" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por título o código ART..." 
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 outline-none focus:border-[#F4C400] focus:ring-1 focus:ring-[#F4C400]" 
              />
            </div>

            <div className="flex gap-2 md:gap-3 flex-shrink-0 items-center">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-semibold text-slate-700 md:text-base">Panel</Link>
                  <Link href="/dashboard/new" className="rounded-full bg-[#F4C400] px-3 md:px-5 py-2.5 text-xs md:text-sm font-bold text-black shadow hover:brightness-105">Publicar</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-slate-700 md:text-base">Entrar</Link>
                  {/* Botón Registro CORREGIDO (text-xs y px-3 para celular) */}
                  <Link href="/registro" className="rounded-full bg-slate-800 px-3 md:px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow hover:bg-slate-700">Registrarme</Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative h-[60vh] min-h-[350px] overflow-hidden bg-slate-800">
          <img src="/hero-amazonpy.jpg" alt="Aclasif Hero" className="hero-bg-animate absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <h2 className="text-4xl font-black text-white md:text-6xl lg:text-7xl">Compras <span className="text-[#F4C400]">Seguras</span></h2>
            <p className="mt-3 text-lg font-medium text-slate-100 md:mt-4 md:text-xl lg:text-2xl">En Paraguay, Aclasif es tu intermediario de confianza.</p>
            
            {/* Buscador Mobile CORREGIDO (pr-12 y text-xs en botón) */}
            <div className="mt-8 flex w-full max-w-xl items-center md:hidden">
              <div className="relative w-full flex-grow flex items-center p-1.5 bg-white rounded-full">
                <input 
                  type="search" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Título o ART..." 
                  className="w-full rounded-full bg-transparent pl-4 pr-12 text-sm text-slate-800 outline-none placeholder:text-slate-400" 
                />
                <button className="absolute right-0 top-0 h-full px-3 text-xs md:px-5 py-2.5 bg-[#F4C400] text-black font-bold flex items-center gap-1.5 active:scale-95 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL CORREGIDO (px-2 para más espacio en celular) */}
        <div className="relative z-20 -mt-16 px-2 md:px-6">
          <div className="page-inner w-full max-w-[1900px] mx-auto rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 lg:p-8">
            
            {/* Categorías y Filtros */}
            <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl mini-card-yellow text-slate-800">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 md:text-2xl">Explorar <span className="text-[#0066FF]">Anuncios</span></h3>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
                <button onClick={() => setSelectedCategory("todos")} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === "todos" ? "bg-slate-800 text-white shadow-md" : "bg-white/70 text-slate-600 hover:bg-white"}`}>Todos</button>
                {categories.map(cat => (
                  <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === cat.slug ? "bg-slate-800 text-white shadow-md" : "bg-white/70 text-slate-600 hover:bg-white"}`}>{cat.name}</button>
                ))}
              </div>
            </div>

            {/* GRILLA DE PRODUCTOS CORREGIDA (grid-cols-1 para celular) */}
            {loading ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-20 text-center">
                <svg className="w-12 h-12 animate-spin text-[#0066FF]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-lg font-bold text-slate-700">Cargando productos seguros...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-20 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
                <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                <p className="mt-4 text-lg font-bold text-slate-600">No encontramos productos en esta búsqueda.</p>
                <p className="text-slate-500 text-sm">Prueba otra categoría o limpia el buscador.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pb-10">
                {filteredListings.map((listing) => (
                  <Link href={`/producto/${listing.article_code}`} key={listing.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ring-1 ring-slate-100">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
                      <img 
                        src={listing.image_url || "/placeholder-img.jpg"} 
                        alt={listing.title} 
                        className="h-full w-full object-cover transition group-hover:scale-105" 
                      />
                    </div>
                    <div className="flex flex-1 flex-col pt-3 pb-1">
                      {listing.article_code && (
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{listing.article_code}</span>
                      )}
                      {/* Precio CORREGIDO (text-xl en celular) */}
                      <p className="mt-1 text-xl font-bold md:text-2xl lg:text-3xl text-orange-600">{formatGs(listing.price_usd)}</p>
                      {/* Título CORREGIDO (min-h-[38px] y text-base en celular) */}
                      <p className="mt-2 text-base font-bold md:text-lg lg:text-xl text-slate-900 line-clamp-2 min-h-[38px] md:min-h-[48px]">{listing.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{categories.find(c => c.slug === listing.category)?.name || "Sin Categoría"}</p>
                      
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Verificado
                        </span>
                        <span className="text-xs font-bold text-[#0066FF] group-hover:underline">Ver más →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
