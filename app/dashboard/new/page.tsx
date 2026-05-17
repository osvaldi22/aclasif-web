"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Category = {
  slug: string;
  name: string;
};

const COMMISSION_RATE = 0.15;

function hasContactData(text: string) {
  const normalized = text.toLowerCase();
  const blockedWords = ["whatsapp", "wpp", "telefono", "teléfono", "contacto", "contactame", "contáctame", "llamame", "llámame", "escribime", "escríbeme", "gmail", "hotmail", "outlook", "yahoo", "instagram", "facebook", "telegram", "t.me", "@"];

  for (const word of blockedWords) {
    if (normalized.includes(word)) return true;
  }
  const phoneLike = text.replace(/[.\-\s()+]/g, "");
  if (/\d{7,}/.test(phoneLike)) return true;

  return false;
}

function formatPriceInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-PY");
}

function parsePriceInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return Number(digits || "0");
}

function formatGs(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `Gs. ${n.toLocaleString("es-PY")}`;
}

function getCommissionValues(netAmount: number) {
  const commission = Math.round(netAmount * COMMISSION_RATE);
  const finalPrice = netAmount + commission;
  return { netAmount, commission, finalPrice };
}

function generateArticleCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ART-${random}`;
}

export default function NewProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  
  const [stock, setStock] = useState("1");
  const [condicion, setCondicion] = useState("nuevo");
  const [detallesCondicion, setDetallesCondicion] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [msg, setMsg] = useState("");
  const [contactError, setContactError] = useState("");
  const [loadingStep, setLoadingStep] = useState<"idle" | "saving" | "moderating">("idle");
  const [fileHover, setFileHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openingImage, setOpeningImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) window.location.href = "/login";
    }
    checkUser();
    setMounted(true);
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase.from("categories").select("slug,name").eq("is_active", true).order("name", { ascending: true });
    if (!error && data) {
      setCategories(data as Category[]);
      if (data.length > 0) setCategory(data[0].slug);
    }
  }

  const handleImageClick = () => {
    setOpeningImage(true);
    setTimeout(() => {
      fileInputRef.current?.click();
      setOpeningImage(false);
    }, 150); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        alert("⚠️ Solo puedes subir un máximo de 5 imágenes.");
        setImages(selectedFiles.slice(0, 5));
      } else {
        setImages(selectedFiles);
      }
    }
  };

  async function createUniqueArticleCode() {
    for (let i = 0; i < 20; i++) {
      const code = generateArticleCode();
      const { data } = await supabase.from("listings").select("id").eq("article_code", code).limit(1);
      if (!data || data.length === 0) return code;
    }
    throw new Error("No se pudo generar un codigo único.");
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setContactError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg("Debes iniciar sesion."); return; }
    if (!title.trim() || !description.trim() || !category.trim() || !price.trim()) { setMsg("Completa todos los campos."); return; }

    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 1) {
      setMsg("El stock debe ser de al menos 1 unidad.");
      return;
    }

    if (condicion === "usado" && !detallesCondicion.trim()) {
      setMsg("Por favor explica los detalles o defectos del artículo usado.");
      return;
    }

    if (hasContactData(title) || hasContactData(description)) {
      setContactError("⚠ Se detectaron datos de contacto.");
      alert("No se permite publicar datos de contacto en el titulo o descripcion.");
      return;
    }

    const sellerNetPrice = parsePriceInput(price);
    if (!sellerNetPrice || sellerNetPrice <= 0) { setMsg("Ingresa un precio valido."); return; }
    const { finalPrice } = getCommissionValues(sellerNetPrice);

    setLoadingStep("saving");
    setMsg(`Subiendo ${images.length > 0 ? images.length : 0} imágenes y guardando datos...`);

    let uploaded_urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const ext = img.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, img);
      if (uploadError) {
        setLoadingStep("idle");
        setMsg(`Error subiendo la imagen ${i + 1}: ${uploadError.message}`);
        return;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      uploaded_urls.push(data.publicUrl);
    }

    const cover_image = uploaded_urls.length > 0 ? uploaded_urls[0] : "";

    let articleCode = "";
    try {
      articleCode = await createUniqueArticleCode();
    } catch (err: any) {
      setLoadingStep("idle"); setMsg(err.message); return;
    }

    const { data: insertedData, error } = await supabase.from("listings").insert([
      {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        price_usd: finalPrice,
        image_url: cover_image,
        gallery_urls: uploaded_urls,
        stock: parsedStock,
        condicion: condicion,
        detalles_condicion: condicion === "usado" ? detallesCondicion.trim() : null,
        is_active: true,
        moderation_status: "pending",
        article_code: articleCode,
      },
    ]).select("id").single();

    if (error) {
      setLoadingStep("idle"); setMsg("Error publicando producto: " + error.message); return;
    }

    if (insertedData && insertedData.id) {
      setLoadingStep("moderating");
      setMsg("Producto guardado. La IA está analizando tu anuncio...");
      try {
        await fetch("https://aclasif-chatbot.onrender.com/api/moderar-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id: insertedData.id }),
        });
      } catch (error) { console.log(error); }
    }

    window.location.href = "/dashboard";
  }

  const sellerNetPrice = parsePriceInput(price);
  const { commission, finalPrice } = getCommissionValues(sellerNetPrice);

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      <style jsx global>{`
        @keyframes float { 0% { transform: translate(0,0); } 50% { transform: translate(15px, -30px); } 100% { transform: translate(0,0); } }
        .bubble-float { animation: float linear infinite; }
        .page-shell { background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%); border: 3px solid rgba(120, 177, 245, 0.95); box-shadow: 0 18px 40px rgba(58, 116, 204, 0.30), 0 0 0 2px rgba(255,255,255,0.16) inset; }
        .page-inner { background: rgba(255,255,255,0.93); border: 1px solid rgba(255,255,255,0.80); box-shadow: 0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60); }
        .field-soft { background: rgba(255,255,255,0.88); border: 2px solid rgba(47,168,79,0.75); box-shadow: 0 4px 14px rgba(47,168,79,0.10), inset 0 1px 0 rgba(255,255,255,0.65); }
        .message-soft { background: rgba(255,255,255,0.82); border: 1px solid rgba(255,255,255,0.85); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .mini-card { background: rgba(255,255,255,0.84); border: 2px solid rgba(47,168,79,0.72); box-shadow: 0 6px 16px rgba(47,168,79,0.08), inset 0 1px 0 rgba(255,255,255,0.60); }
        .mini-card-yellow { background: rgba(255, 248, 210, 0.86); border: 2px solid rgba(244, 196, 0, 0.75); box-shadow: 0 6px 16px rgba(244, 196, 0, 0.10), inset 0 1px 0 rgba(255,255,255,0.55); }
        .mini-card-green { background: rgba(225, 255, 236, 0.88); border: 2px solid rgba(47,168,79,0.78); box-shadow: 0 6px 16px rgba(47,168,79,0.10), inset 0 1px 0 rgba(255,255,255,0.55); }
        .warning-card { background: rgba(225, 255, 236, 0.90); border: 2px solid rgba(47,168,79,0.80); box-shadow: 0 6px 16px rgba(47,168,79,0.10); }
        .error-card { background: rgba(255, 232, 232, 0.92); border: 2px solid rgba(220, 38, 38, 0.75); box-shadow: 0 6px 16px rgba(220, 38, 38, 0.08); }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <div className="fixed inset-0 z-0">
        <img src="/fondo-amazonpy.jpg" alt="Fondo" className="w-full h-full object-cover" />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-30 bubble-float" style={{ background: ["#FFF", "#F4C400", "#00D084"][i % 3], width: `${25 + Math.random() * 30}px`, height: `${25 + Math.random() * 30}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${4 + Math.random() * 4}s` }} />
        ))}
      </div>

      <div className="relative z-10 min-h-screen px-4 py-10 flex items-start justify-center">
        <div className="page-shell w-full max-w-6xl rounded-[2rem] p-4">
          <div className="page-inner rounded-[1.7rem] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-4 flex justify-center">
                  <Link href="/"><img src="/aclasif-logo.png" alt="Aclasif" className="h-48 md:h-56 w-auto max-w-[920px] object-contain" /></Link>
                </div>
                <h1 className="text-2xl font-black text-slate-800">Publicar <span className="text-[#F4C400]">producto</span></h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard" className="rounded-2xl bg-[#F4C400] px-4 py-2 font-bold text-black shadow-md">Mis productos</Link>
                <Link href="/" className="rounded-2xl bg-white/70 px-4 py-2 font-semibold text-slate-700 shadow-md">Volver</Link>
              </div>
            </div>

            {msg && (
              <div className="message-soft mt-5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 flex items-center gap-2">
                {loadingStep !== "idle" && (
                  <svg className="w-5 h-5 animate-spin text-[#0066FF]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                {msg}
              </div>
            )}

            <form onSubmit={publicar} className="mt-8 grid gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo" className="field-soft rounded-2xl px-4 py-3 text-slate-800 outline-none" required />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">Cantidad en Stock</label>
                  <input type="number" min="1" value={stock} onChange={(e) => setStock(e.target.value)} className="field-soft w-full rounded-2xl px-4 py-3 text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">Condición del Artículo</label>
                  <select value={condicion} onChange={(e) => { setCondicion(e.target.value); if(e.target.value === "nuevo") setDetallesCondicion(""); }} className="field-soft w-full rounded-2xl px-4 py-3 text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30" required>
                    <option value="nuevo">Nuevo (Sin uso)</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>

              {condicion === "usado" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-orange-600 ml-2 mb-1 block">⚠ Explica los detalles de uso o defectos (Obligatorio)</label>
                  <textarea value={detallesCondicion} onChange={(e) => setDetallesCondicion(e.target.value)} placeholder="Ej: Tiene un rayón en la pantalla..." rows={2} className="field-soft w-full rounded-2xl px-4 py-3 text-slate-800 outline-none border-orange-400 focus:ring-4 focus:ring-orange-500/30 bg-orange-50" required />
                </div>
              )}

              <select value={category} onChange={(e) => setCategory(e.target.value)} className="field-soft rounded-2xl px-4 py-3 text-slate-800 outline-none" required>
                <option value="">Selecciona una categoria</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>

              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripcion General" rows={4} className="field-soft rounded-2xl px-4 py-3 text-slate-800 outline-none" required />
              <input value={price} onChange={(e) => setPrice(formatPriceInput(e.target.value))} inputMode="numeric" placeholder="Precio que quieres recibir en Gs." className="field-soft rounded-2xl px-4 py-3 text-slate-800 outline-none" required />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mt-2">
                <div className="mini-card rounded-2xl p-4"><p className="text-xs text-slate-500">Tu ganancia</p><p className="mt-1 text-lg font-bold text-slate-800">{formatGs(sellerNetPrice)}</p></div>
                <div className="mini-card-green rounded-2xl p-4"><p className="text-xs text-green-800/80">Comision ({Math.round(COMMISSION_RATE * 100)}%)</p><p className="mt-1 text-lg font-bold text-[#2FA84F]">{formatGs(commission)}</p></div>
                <div className="mini-card-yellow rounded-2xl p-4"><p className="text-xs text-yellow-800/80">Precio publicado</p><p className="mt-1 text-lg font-bold text-[#F4C400]">{formatGs(finalPrice)}</p></div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

              <button type="button" onClick={handleImageClick} onMouseEnter={() => setFileHover(true)} onMouseLeave={() => setFileHover(false)} disabled={openingImage || loadingStep !== "idle"} className={`rounded-2xl px-4 py-4 text-left transition border-2 border-dashed ${fileHover ? "border-[#F4C400] bg-yellow-50/50 text-[#F4C400]" : "border-slate-300 bg-white/50 text-slate-700"}`}>
                {openingImage ? "⏳ Abriendo galería..." : images.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-green-600">✅ {images.length} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}</span>
                    <span className="text-xs text-slate-500">(Haz clic de nuevo para cambiar las fotos)</span>
                  </div>
                ) : "🖼️ Clic aquí para seleccionar hasta 5 fotos"}
              </button>

              <div className="warning-card rounded-2xl px-4 py-3 text-sm font-semibold text-yellow-700">⚠ Advertencia: no se permite datos de contacto en el titulo o descripcion.</div>
              {contactError && <div className="error-card rounded-2xl px-4 py-3 text-sm font-semibold text-red-700">{contactError}</div>}

              <button type="submit" disabled={loadingStep !== "idle"} className="mt-2 rounded-2xl bg-[#F4C400] px-4 py-4 font-bold text-black shadow-lg hover:brightness-110 flex justify-center items-center gap-2 transition-all">
                {loadingStep === "saving" && (
                  <>
                    <svg className="w-5 h-5 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Paso 1: Guardando producto...
                  </>
                )}
                {loadingStep === "moderating" && (
                  <>
                    <svg className="w-5 h-5 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Moderando Favor espere
                  </>
                )}
                {loadingStep === "idle" && "Publicar producto"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}