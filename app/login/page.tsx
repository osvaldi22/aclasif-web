"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ← corregido
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email.trim() || !password.trim()) {
      setMsg("Completa correo y contrasena.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      setMsg("Error: " + error.message);
      return;
    }

    setMsg("Inicio de sesion exitoso. Redirigiendo al panel...");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
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
        <div className="login-shell w-full max-w-md rounded-[2rem] p-4">
          <div className="login-inner rounded-[1.7rem] p-6">
            {/* LOGO MÁS GRANDE */}
            <div className="mb-5 flex justify-center">
              <Link href="/" className="block">
                <img
                  src="/aclasif-logo.png"
                  alt="Aclasif"
                  style={{ width: "320px", height: "auto" }}
                  className="object-contain"
                />
              </Link>
            </div>

            <h1 className="text-2xl font-black text-slate-800">
              Iniciar <span className="text-[#2FA84F]">sesion</span>
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Entra con tu cuenta de vendedor.
            </p>

            <form onSubmit={handleLogin} className="mt-6 grid gap-3">
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
                className="mt-2 rounded-2xl bg-[#2FA84F] px-4 py-3 text-sm font-black text-white shadow-lg hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#F4C400] hover:underline"
              >
                Registrarme
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