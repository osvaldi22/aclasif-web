"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

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

    const nombreLimpio = nombre.trim();
    const whatsappLimpio = whatsapp.trim();
    const ciudadLimpia = ciudad.trim();
    const direccionLimpia = direccion.trim();
    const emailLimpio = email.trim();
    const passwordLimpio = password.trim();

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpio,
      password: passwordLimpio,
    });

    if (error) {
      setLoading(false);
      setMsg("Error: " + error.message);
      return;
    }

    const userId = data.user?.id;

    /*
      IMPORTANTE:
      Si Supabase ya creó el usuario en Authentication, mostramos éxito sí o sí.
      El guardado en perfiles es secundario. Si perfiles falla por permisos/RLS,
      no dejamos al usuario atrapado en la misma página.
    */

    setLoading(false);
    setSuccessOpen(true);

    setNombre("");
    setWhatsapp("");
    setCiudad("");
    setDireccion("");
    setEmail("");
    setPassword("");

    if (userId) {
      supabase
        .from("perfiles")
        .upsert([
          {
            id: userId,
            nombre: nombreLimpio,
            whatsapp: whatsappLimpio,
            ciudad: ciudadLimpia,
            direccion: direccionLimpia,
          },
        ])
        .then(({ error: profileError }) => {
          if (profileError) {
            console.warn(
              "Usuario creado, pero no se pudo guardar perfil:",
              profileError.message
            );
          }
        });
    } else {
      console.warn(
        "Usuario creado, pero Supabase no devolvió userId. Puede depender de la configuración de confirmación por email."
      );
    }

    setTimeout(() => {
      router.push("/login");
    }, 2600);
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

        .success-modal-shell {
          background:
            radial-gradient(circle at top left, rgba(47,168,79,0.35), transparent 38%),
            radial-gradient(circle at top right, rgba(244,196,0,0.35), transparent 38%),
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,255,245,0.96));
          border: 3px solid rgba(47,168,79,0.35);
          box-shadow:
            0 26px 70px rgba(0,0,0,0.38),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .success-check {
          background: linear-gradient(135deg, #2FA84F 0%, #20D66F 100%);
          box-shadow:
            0 10px 25px rgba(47,168,79,0.35),
            inset 0 3px 7px rgba(255,255,255,0.35),
            inset 0 -5px 8px rgba(0,0,0,0.16);
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
              Crea tu cuenta para publicar productos en Aclasif.
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
                <div className="message-soft rounded-2xl px-4 py-3 text-sm font-bold text-red-600">
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

      {successOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-md px-4">
          <div className="success-modal-shell w-full max-w-md rounded-[2rem] p-6 text-center">
            <div className="mx-auto mb-5 success-check flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white">
              ✓
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Su registro ha sido exitoso
            </h2>

            <p className="mt-3 text-lg font-black text-[#2FA84F]">
              Bienvenido a Aclasif.com
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Te estamos enviando a la pagina de iniciar sesion...
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-[#F4C400] px-6 py-3 text-sm font-black text-black shadow-lg hover:brightness-110"
            >
              Ir ahora a iniciar sesion
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}