"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

type Category = {
  slug: string;
  name: string;
};

type ProductRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  price_usd: number;
  user_id: string;
};

const COMMISSION_RATE = 0.15;

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

function getNetFromPublishedPrice(publishedPrice: number) {
  if (!publishedPrice || publishedPrice <= 0) return 0;
  return Math.round(publishedPrice / (1 + COMMISSION_RATE));
}

function hasContactData(text: string) {
  const normalized = text.toLowerCase();
  const blockedWords = [
    "whatsapp", "wpp", "telefono", "teléfono", "contacto",
    "contactame", "contáctame", "llamame", "llámame", "escribime",
    "escríbeme", "gmail", "hotmail", "outlook", "yahoo", "instagram",
    "facebook", "telegram", "t.me", "@"
  ];

  for (const word of blockedWords) {
    if (normalized.includes(word)) return true;
  }

  const phoneLike = text.replace(/[.\-\s()+]/g, "");
  if (/\d{7,}/.test(phoneLike)) return true;

  return false;
}

export default function EditProductPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [msg, setMsg] = useState("");
  const [contactError, setContactError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadInitialData();
  }, [id]);

  async function loadInitialData() {
    setLoading(true);
    setMsg("");
    await Promise.all([loadCategories(), loadProduct()]);
    setLoading(false);
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("slug,name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!error) setCategories((data ?? []) as Category[]);
  }

  async function loadProduct() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setMsg("Debes iniciar sesión.");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,description,category,price_usd,user_id")
      .eq("id", id)
      .single();

    if (error || !data) {
      setMsg("Error cargando producto.");
      return;
    }

    const product = data as ProductRow;
    if (product.user_id !== user.id) {
      setMsg("No tienes permiso para editar este producto.");
      return;
    }

    const netPrice = getNetFromPublishedPrice(Number(product.price_usd));
    setTitle(product.title ?? "");
    setDescription(product.description ?? "");
    setCategory(product.category ?? "");
    setPrice(formatPriceInput(String(netPrice)));
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setContactError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setMsg("Debes iniciar sesión.");
      return;
    }

    if (!title.trim() || !description.trim() || !category.trim() || !price.trim()) {
      setMsg("Completa todos los campos para editar.");
      return;
    }

    if (hasContactData(title) || hasContactData(description)) {
      const warning =
        "⚠ Se detectaron datos de contacto. Elimina teléfonos, WhatsApp, correos o redes sociales del título o descripción.";
      setContactError(warning);
      alert(
        "No se permite guardar datos de contacto en el título o descripción.\n\nElimina teléfonos, WhatsApp, correos o redes sociales y vuelve a intentarlo."
      );
      return;
    }

    const sellerNetPrice = parsePriceInput(price);
    if (!sellerNetPrice || sellerNetPrice <= 0) {
      setMsg("Ingresa un precio válido.");
      return;
    }

    const { finalPrice } = getCommissionValues(sellerNetPrice);
    setSaving(true);

    const { error } = await supabase
      .from("listings")
      .update({
        title: title.trim(),
        description: description.trim(),
        category,
        price_usd: finalPrice,
        moderation_status: "pending", 
        verified_at: null,            
        last_reviewed_at: null,       
        moderation_note: null         
      })
      .eq("id", id)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      setMsg("Error editando producto: " + error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  const sellerNetPrice = parsePriceInput(price);
  const values = getCommissionValues(sellerNetPrice);

  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-fixed px-4 py-6 font-sans text-gray-800"
      style={{ backgroundImage: "url('/fondo-amazonpy.jpg')" }}
    >
      <div className="mx-auto max-w-4xl">
        
        {/* LOGO ENCABEZADO */}
        <div className="flex justify-center mb-6 mt-2">
          <img src="/aclasif-logo.png" alt="Aclasif Logo" className="h-28 object-contain drop-shadow-xl" />
        </div>

        {/* CONTENEDOR PRINCIPAL ESTILO DASHBOARD */}
        <div className="rounded-[2.5rem] border-[4px] border-[#c8e6c9]/60 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-800">Editar <span className="text-[#f4c400]">producto</span></h1>
              <p className="mt-1 text-gray-600 font-medium">Modifica tu producto y vuelve al panel cuando guardes.</p>
            </div>

            {/* BOTONES SUPERIORES */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-[#f4c400] px-5 py-2.5 font-bold text-black shadow-md transition hover:scale-105 active:scale-95">
                Mis productos
              </Link>
              <Link href="/" className="rounded-full bg-white px-5 py-2.5 font-bold text-gray-700 shadow-md transition hover:scale-105 active:scale-95 border border-gray-200">
                Volver
              </Link>
              <button onClick={logout} className="rounded-full bg-[#2FA84F] px-5 py-2.5 font-bold text-white shadow-md transition hover:scale-105 active:scale-95">
                Cerrar sesión
              </button>
            </div>
          </div>

          {msg && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{msg}</div>}

          {loading ? (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 font-medium shadow-sm">
              Cargando producto...
            </div>
          ) : (
            <form onSubmit={saveEdit} className="mt-8 grid gap-4">
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Titulo" 
                className="rounded-2xl bg-white px-5 py-3.5 text-gray-800 outline-none border-[3px] border-[#2FA84F] shadow-inner focus:border-green-600 transition" 
              />
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Descripcion" 
                rows={4} 
                className="rounded-2xl bg-white px-5 py-3.5 text-gray-800 outline-none border-[3px] border-[#2FA84F] shadow-inner focus:border-green-600 transition" 
              />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="rounded-2xl bg-white px-5 py-3.5 text-gray-800 outline-none border-[3px] border-[#2FA84F] shadow-inner focus:border-green-600 transition"
              >
                <option value="" className="text-gray-500">Selecciona una categoria</option>
                {categories.map((c) => <option key={c.slug} value={c.slug} className="text-gray-800">{c.name}</option>)}
              </select>
              <input 
                value={price} 
                onChange={(e) => setPrice(formatPriceInput(e.target.value))} 
                inputMode="numeric" 
                placeholder="Precio que quieres recibir en Gs." 
                className="rounded-2xl bg-white px-5 py-3.5 text-gray-800 outline-none border-[3px] border-[#2FA84F] shadow-inner focus:border-green-600 transition font-bold text-lg" 
              />

              <div className="px-2 text-sm text-gray-500 font-medium">Escribe solo numeros. El sistema acomoda los puntos automaticamente.</div>

              {/* TARJETAS DE PRECIOS */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm text-center">
                  <p className="text-sm font-semibold text-gray-500">Tu ganancia</p>
                  <p className="mt-1 text-2xl font-black text-gray-800">{formatGs(values.netAmount)}</p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm text-center">
                  <p className="text-sm font-semibold text-green-700">Comision AmazonPY ({Math.round(COMMISSION_RATE*100)}%)</p>
                  <p className="mt-1 text-2xl font-black text-green-600">{formatGs(values.commission)}</p>
                </div>
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm text-center">
                  <p className="text-sm font-semibold text-yellow-700">Precio publicado</p>
                  <p className="mt-1 text-2xl font-black text-[#d4a800]">{formatGs(values.finalPrice)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm font-bold text-yellow-800 shadow-sm mt-2">
                ⚠ Advertencia: no se permite guardar teléfonos, WhatsApp, correos, redes sociales o datos de contacto en el título o descripción.
              </div>

              {contactError && <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 shadow-sm">{contactError}</div>}

              {/* BOTONES DE GUARDAR */}
              <div className="flex flex-wrap gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="rounded-full bg-[#f4c400] px-8 py-3.5 font-black text-black shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <Link 
                  href="/dashboard" 
                  className="rounded-full bg-white border-2 border-gray-200 px-8 py-3.5 font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}