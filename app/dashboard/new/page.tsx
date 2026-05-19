"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Category = {
  slug: string;
  name: string;
};

const COMMISSION_RATE = 0.15;
const MODERATION_API_URL = "https://aclasif-chatbot.onrender.com/api/moderar-listing";

function hasContactData(text: string) {
  const normalized = text.toLowerCase();

  const blockedWords = [
    "whatsapp",
    "wpp",
    "wasap",
    "telefono",
    "teléfono",
    "contacto",
    "contactame",
    "contáctame",
    "llamame",
    "llámame",
    "escribime",
    "escríbeme",
    "gmail",
    "hotmail",
    "outlook",
    "yahoo",
    "instagram",
    "facebook",
    "telegram",
    "t.me",
    "wa.me",
    "inbox",
    "dm",
    "direct",
    "@",
  ];

  for (const word of blockedWords) {
    if (normalized.includes(word)) return true;
  }

  const phoneLike = text.replace(/[.\-\s()+_/,:;|]/g, "");
  const matchDigits = phoneLike.match(/\d{6,}/);
  if (matchDigits) return true;

  return false;
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"saving" | "moderating" | "done" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // NUEVO ESTADO PARA EL POP-UP CENTRAL DE SUSPENSIÓN
  const [suspensionModal, setSuspensionModal] = useState<{ show: boolean; note: string }>({
    show: false,
    note: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
      } else {
        setUser(user);
      }
    }
    checkUser();

    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("slug, name")
        .order("name", { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateArticleCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "ART-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || !description.trim() || !price || !category || !imageFile) {
      setErrorMsg("Todos los campos son obligatorios, incluyendo la imagen.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("El precio debe ser un número mayor a 0.");
      return;
    }

    setLoading(true);
    setLoadingStep("saving");

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      const articleCode = generateArticleCode();

      const { data: insertedData, error: insertError } = await supabase
        .from("listings")
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            precio: priceNum,
            category_slug: category,
            image_url: imageUrl,
            article_code: articleCode,
            moderation_status: "pending",
            moderation_note: "Esperando respuesta de IA...",
            is_active: false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newListingId = insertedData.id;

      setLoadingStep("moderating");

      const apiResp = await fetch(MODERATION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: newListingId }),
      });

      if (!apiResp.ok) {
        setLoadingStep("done");
        setSuccessMsg("Producto guardado, pero la moderación automática falló. Será revisado manualmente.");
        return;
      }

      const apiData = await apiResp.json();

      setLoadingStep("done");

      if (apiData.decision === "verified") {
        setSuccessMsg(`¡Publicado con éxito! Código: ${articleCode}. Redirigiendo...`);
        setTimeout(() => {
          window.location.href = `/producto/${articleCode}`;
        }, 2000);
      } else if (apiData.decision === "suspended") {
        // 🔥 EN VEZ DE UN BANNER COMÚN, SE ACTIVA EL POP-UP CENTRAL
        setSuspensionModal({
          show: true,
          note: apiData.nota || "Contacto detectado en el contenido.",
        });
      } else {
        setSuccessMsg("Tu producto está en revisión manual. Nos comunicaremos pronto.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const priceNum = parseFloat(price) || 0;
  const commission = priceNum * COMMISSION_RATE;
  const finalReceive = priceNum - commission;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              ¿Qué vas a vender hoy?
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Crea tu publicación en simples pasos. Pasará por moderación automática.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm bg-zinc-900 text-zinc-300 hover:text-white px-4 py-2 rounded-lg border border-zinc-800 transition-colors"
          >
            Volver al Panel
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800 text-red-200 rounded-xl text-sm flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-200 rounded-xl text-sm flex items-start gap-3">
            <span className="text-lg">✅</span>
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Título del Producto / Artículo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: iPhone 13 Pro Max 256GB Libre"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                maxLength={80}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Descripción Detallada
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el estado, qué incluye, si tiene detalles. Prohibido poner números de teléfono o redes sociales."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors h-32 resize-none"
                maxLength={1000}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Precio de Venta (Gs.)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 3500000"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <label className="block text-sm font-medium text-zinc-300 mb-4">
              Fotografía del Producto
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
              id="product-image-upload"
            />

            {!previewUrl ? (
              <label
                htmlFor="product-image-upload"
                className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/50"
              >
                <span className="text-4xl mb-3">📸</span>
                <span className="text-sm font-medium text-zinc-300">
                  Seleccionar Imagen
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  PNG, JPG o JPEG. Máximo 10MB.
                </span>
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex justify-center items-center p-4">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="max-h-64 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-lg"
                  title="Quitar imagen"
                >
                  ❌
                </button>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Desglose de Valores
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Precio de venta público:</span>
              <span className="font-semibold text-white">
                Gs. {priceNum.toLocaleString("es-PY")}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Comisión de la Plataforma (15%):</span>
              <span className="font-semibold text-red-400">
                - Gs. {commission.toLocaleString("es-PY")}
              </span>
            </div>
            <div className="flex justify-between text-base pt-1">
              <span className="font-medium text-yellow-500">Monto Neto a recibir:</span>
              <span className="font-bold text-yellow-500">
                Gs. {finalReceive.toLocaleString("es-PY")}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              * El comprador abona mediante la pasarela segura. Recibes tus fondos
              netos una vez entregado el producto.
            </p>
          </div>

          {loading && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-yellow-500 text-sm font-medium">
              {loadingStep === "saving" && (
                <>
                  <svg
                    className="w-5 h-5 animate-spin text-yellow-500"
                    fill="none",
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Paso 1: Guardando producto...
                </>
              )}

              {loadingStep === "moderating" && (
                <>
                  <svg
                    className="w-5 h-5 animate-spin text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Paso 2: IA Moderando imágenes y textos...
                </>
              )}

              {loadingStep === "done" && <>✨ Finalizando proceso...</>}
            </div>
          )}

          {/* BOTÓN INTELIGENTE: SE INHABILITA DURANTE LA CARGA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-center text-base ${
              loading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60 border border-zinc-700"
                : "bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/10 cursor-pointer"
            }`}
          >
            {loading ? "Procesando publicación..." : "Publicar mi Artículo"}
          </button>
        </form>
      </div>

      {/* POP-UP MODAL EN EL CENTRO DE LA PANTALLA SI SE SUSPENDE */}
      {suspensionModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl border border-red-500/20">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Publicación Suspendida por Seguridad
              </h3>
              <p className="text-sm text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-left font-mono">
                {suspensionModal.note}
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              Recuerda que no permitimos enlaces, teléfonos o datos de contacto externos para proteger las transacciones.
            </p>
            <button
              onClick={() => setSuspensionModal({ show: false, note: "" })}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
            >
              ✏️ Entendido, corregir publicación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}