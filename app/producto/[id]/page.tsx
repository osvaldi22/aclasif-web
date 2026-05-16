"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  image_url: string | null;
  gallery_urls?: string[] | null;
  article_code: string | null;
  premium_until?: string | null;
  is_active?: boolean | null;
  moderation_status?: "pending" | "verified" | "suspended" | null;
  // NUEVAS COLUMNAS
  stock?: number;
  condicion?: string;
  detalles_condicion?: string | null;
};

type Toast = { show: boolean; text: string };

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
  const router = useRouter();
  const articleCode = String(params?.id ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [msg, setMsg] = useState("Cargando producto...");
  const [mounted, setMounted] = useState(false);
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, text: "" });
  const [defectModal, setDefectModal] = useState<{ show: boolean; text: string }>({ show: false, text: "" });

  useEffect(() => {
    setMounted(true);
    if (!articleCode) return;
    loadProduct();
  }, [articleCode]);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,description,category,price_usd,image_url,gallery_urls,article_code,premium_until,is_active,moderation_status,stock,condicion,detalles_condicion"
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
    setCurrentImage(item.image_url);
    setMsg("");
  }

  // --- MAGIA: CREAR PEDIDO Y DESCONTAR STOCK AUTOMÁTICAMENTE ---
  async function createOrder() {
    if (!product || !buyerName || !buyerWhatsapp || !buyerCity || !buyerAddress) return;
    setBuyLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .insert([{
        listing_id: product.id,
        listing_title: product.title,
        price_usd: product.price_usd,
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
      // SI EL PEDIDO SE CREÓ BIEN, LE RESTAMOS 1 AL STOCK EN LA BASE DE DATOS
      const currentStock = product.stock || 1;
      const newStock = Math.max(0, currentStock - 1);
      
      await supabase
        .from("listings")
        .update({ stock: newStock })
        .eq("id", product.id);

      setBuyOpen(false);
      setToast({ show: true, text: `Pedido #${data.order_number} listo. Redirigiendo al chat...` });
      
      setTimeout(() => {
        const urlParams = new URLSearchParams();
        urlParams.set("order", data.order_number);
        urlParams.set("producto", product.title);
        urlParams.set("nombre", buyerName);
        urlParams.set("whatsapp", buyerWhatsapp);
        if (buyerEmail) urlParams.set("email", buyerEmail);
        router.push(`/chat?${urlParams.toString()}`);
        setToast({ show: false, text: "" });
      }, 2000);
    }

    setBuyLoading(false);
  }

  const allImages = product?.gallery_urls && product.gallery_urls.length > 0 
    ? product.gallery_urls 
    : (product?.image_url ? [product.image_url] : []);

  const shellClass = "login-shell w-full rounded-[2rem] p-4";
  const innerClass = "login-inner rounded-[1.7rem] p-6 relative flex flex-col h-full";

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      <style jsx global>{`
        @keyframes float { 0% { transform: translate(0,0); } 50% { transform: translate(15px, -30px); } 100% { transform: translate(0,0); } }
        .bubble-float { animation: float linear infinite; }
        .login-shell { background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%); border: 3px solid rgba(120, 177, 245, 0.95); box-shadow: 0 18px 40px rgba(58, 116, 204, 0.30), 0 0 0 2px rgba(255,255,255,0.16) inset; }
        .login-inner { background: rgba(255,255,255,0.93); border: 1px solid rgba(255,255,255,0.80); box-shadow: 0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60); }
        .field-soft { background: rgba(255,255,255,0.88); border: 2px solid rgba(47,168,79,0.75); box-shadow: 0 4px 14px rgba(47,168,79,0.10), inset 0 1px 0 rgba(255,255,255,0.65); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 z-0">
        <img src="/fondo-amazonpy.jpg" alt="Fondo" className="w-full h-full object-cover" />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-30 bubble-float" style={{ background: ["#FFF", "#F4C400", "#00D084"][i % 3], width: `${25 + Math.random() * 30}px`, height: `${25 + Math.random() * 30}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${4 + Math.random() * 4}s` }} />
        ))}
      </div>

      <div className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
        {msg ? (
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 text-center">
              <div className="mb-5 flex justify-center"><img src="/aclasif-logo.png" alt="Aclasif" style={{ width: "220px", height: "auto" }} className="object-contain" /></div>
              <h1 className="text-2xl font-black text-slate-800">Producto <span className="text-[#F4C400]">AmazonPY</span></h1>
              <div className="mt-6 rounded-2xl bg-white/5 px-4 py-6 text-slate-700 font-bold">{msg}</div>
              <div className="mt-6"><Link href="/" className="inline-flex rounded-2xl bg-[#2FA84F] px-6 py-3 text-sm font-black text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition">Volver al inicio</Link></div>
            </div>
          </div>
        ) : product ? (
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
              
              {/* COLUMNA IMAGEN */}
              <div className={shellClass}>
                <div className={innerClass}>
                  {currentImage ? (
                    <div className="group relative flex h-full min-h-[380px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border-2 border-white mb-4" onClick={() => setIsZoomed(true)}>
                      <img src={currentImage} alt={product.title} className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 text-slate-800 rounded-full px-5 py-2 font-black text-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0">🔍 Clic para ampliar</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[380px] w-full items-center justify-center rounded-2xl bg-gray-50 border-2 border-white text-sm text-slate-400 font-bold mb-4">Sin imagen</div>
                  )}

                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar w-full">
                      {allImages.map((imgUrl, index) => (
                        <div key={index} onClick={() => setCurrentImage(imgUrl)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 bg-white ${currentImage === imgUrl ? "border-[#F4C400] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"}`}>
                          <img src={imgUrl} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMNA INFO */}
              <div className={shellClass}>
                <div className={innerClass}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="rounded-full bg-[#0066FF]/10 px-3 py-1 text-xs font-semibold text-[#0066FF]">{product.category}</span>
                      
                      {/* ETIQUETAS DE CONDICIÓN Y STOCK */}
                      {product.condicion === "usado" ? (
                        <div className="inline-flex items-center gap-1">
                          <span className="bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">Usado</span>
                          {product.detalles_condicion && (
                            <button onClick={(e) => { e.preventDefault(); setDefectModal({show: true, text: product.detalles_condicion || ""}); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full text-[9px] font-bold uppercase transition shadow-sm">Ver detalles 🔍</button>
                          )}
                        </div>
                      ) : (
                        <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">Nuevo</span>
                      )}
                      
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm">
                        📦 Stock: {product.stock || 0}
                      </span>

                      {premiumActive(product.premium_until) && (
                        <span className="rounded-full bg-[#F4C400] px-3 py-1 text-xs font-black text-black animate-pulse">⭐ PREMIUM</span>
                      )}
                    </div>

                    {product.article_code && <p className="text-sm font-bold text-[#F4C400] mb-2">Articulo: {product.article_code}</p>}
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">{product.title}</h1>
                    <div className="mt-5"><p className="text-sm font-bold text-slate-500">Precio</p><p className="text-4xl font-black text-[#0066FF]">{formatGs(product.price_usd)}</p></div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
                    </div>
                  </div>

                  {/* LÓGICA DE BOTÓN SEGÚN STOCK */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {product.stock && product.stock > 0 ? (
                      <button onClick={() => setBuyOpen(true)} className="flex-1 rounded-2xl bg-[#F4C400] px-6 py-4 text-sm font-black text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition uppercase tracking-wide flex items-center justify-center gap-2 border-2 border-transparent hover:border-yellow-200">
                        🛒 Comprar ahora
                      </button>
                    ) : (
                      <div className="flex-1 rounded-2xl bg-red-100 border-2 border-red-300 px-6 py-4 text-sm font-black text-red-600 shadow-md uppercase tracking-wide flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                        ❌ AGOTADO (Sin Stock)
                      </div>
                    )}

                    <Link href="/" className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-600 shadow-md border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] transition flex items-center justify-center">
                      ← Volver
                    </Link>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#0066FF]/5 border border-[#0066FF]/20 px-4 py-3 text-xs font-bold text-[#0066FF] text-center">
                    🔒 AmazonPY intermedia toda la venta entre comprador y vendedor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {isZoomed && currentImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out" onClick={() => setIsZoomed(false)}>
          <img src={currentImage} alt={product?.title} className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-xl" />
          <button className="absolute top-6 right-8 text-white text-4xl font-black hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}>✕</button>
        </div>
      )}

      {defectModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDefectModal({show: false, text: ""})}>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 transition-transform relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDefectModal({show: false, text: ""})} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl font-black">✕</button>
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 text-2xl">⚠️</div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Detalles del artículo</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-4">{defectModal.text}</p>
            <button onClick={() => setDefectModal({show: false, text: ""})} className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 rounded-xl transition">Entendido</button>
          </div>
        </div>
      )}

      {buyOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
            <div className="login-inner rounded-[1.7rem] p-6 relative">
              <div className="mb-4 flex justify-center"><img src="/aclasif-logo.png" alt="Aclasif" style={{ width: "220px", height: "auto" }} className="object-contain" /></div>
              <h2 className="text-xl font-black text-slate-800 mb-1">Finalizar <span className="text-[#2FA84F]">Pedido</span></h2>
              <p className="text-sm text-slate-500 mb-4 line-clamp-1">{product.title}</p>
              <button onClick={() => setBuyOpen(false)} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-2xl font-bold">✕</button>

              <div className="space-y-3">
                <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Nombre y Apellido" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none" required />
                <input value={buyerWhatsapp} onChange={e => setBuyerWhatsapp(e.target.value)} placeholder="Tu WhatsApp (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none" required />
                <input value={buyerCity} onChange={e => setBuyerCity(e.target.value)} placeholder="Ciudad (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none" required />
                <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Dirección de entrega (obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none h-20 resize-none" required />
                <div>
                  <input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="Correo electrónico (no obligatorio)" className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none" />
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[101] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-bounce">{toast.text}</div>
      )}
    </main>
  );
}