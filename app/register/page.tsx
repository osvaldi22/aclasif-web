"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (
      !nombre.trim() ||
      !whatsapp.trim() ||
      !ciudad.trim() ||
      !direccion.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setMsg("Completa todos los campos.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setLoading(false);
      setMsg("Error: " + error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("perfiles").upsert([
        {
          id: userId,
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
          ciudad: ciudad.trim(),
          direccion: direccion.trim(),
        },
      ]);

      if (profileError) {
        setLoading(false);
        setMsg(
          "Usuario creado, pero hubo un error al guardar el perfil: " +
            profileError.message
        );
        return;
      }
    }

    setLoading(false);
    setMsg("Registro exitoso. Ahora ya puedes iniciar sesion.");

    setNombre("");
    setWhatsapp("");
    setCiudad("");
    setDireccion("");
    setEmail("");
    setPassword("");
  }

  return (
    <main className="min-h-screen relative font-sans overflow-x-hidden bg-slate-900">
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(15px, -30px); }
          100% { transform: translate(0, 0); }
        }

        .bubble-float {
          animation: float linear infinite;
        }

        .register-shell {
          background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%);
          border: 3px solid rgba(120, 177, 245, 0.95);
          box-shadow:
            0 18px 40px rgba(58, 116, 204, 0.30),
            0 0 0 2px rgba(255,255,255,0.16) inset;
        }

        .register-inner {
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

        .message-soft {
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(255,255,255,0.85);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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

      <div className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="register-shell w-full max-w-md rounded-[2rem] p-4">
          <div className="register-inner rounded-[1.7rem] p-6">
            <div className="mb-5 flex justify-center">
              <Link href="/" className="block">
                <img
                  src="/aclasif-logo.png"
                  alt="Aclasif"
                  className="h-36 md:h-40 w-auto max-w-[660px] object-contain"
                />
              </Link>
            </div>

            <h1 className="text-2xl font-black text-slate-800">
              Registro de <span className="text-[#F4C400]">Vendedor</span>
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Crea tu cuenta para publicar productos en AmazonPY.
            </p>

            <form onSubmit={handleRegister} className="mt-6 grid gap-3">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              <input
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ciudad"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Direccion"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electronico"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contrasena"
                className="field-soft w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-[#2FA84F]/30"
              />

              {msg && (
                <div className="message-soft rounded-2xl px-4 py-3 text-sm text-slate-700">
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-2xl bg-[#F4C400] px-4 py-3 text-sm font-black text-black shadow-lg hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#2FA84F] hover:underline"
              >
                Iniciar sesion
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-600">
              <Link href="/" className="hover:underline">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}