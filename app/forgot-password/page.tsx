"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const emailLimpio = email.trim();

    if (!emailLimpio) {
      setMsg("Escribi tu correo electronico.");
      return;
    }

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : "https://aclasif-web.vercel.app/update-password";

    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMsg("Error: " + error.message);
      return;
    }

    setSuccessOpen(true);
    setEmail("");
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

        .forgot-shell {
          background: linear-gradient(180deg, #9fcbff 0%, #7eb7f5 100%);
          border: 3px solid rgba(120, 177, 245, 0.95);
          box-shadow:
            0 18px 40px rgba(58, 116, 204, 0.30),
            0 0 0 2px rgba(255,255,255,0.16) inset;
        }

        .forgot-inner {
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
        <div className="forgot-shell w-full max-w-md rounded-[2rem] p-4">
          <div className="forgot-inner rounded-[1.7rem] p-6">
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
              Recuperar <span className="text-[#2FA84F]">contrasena</span>
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Escribi tu correo y te enviaremos un enlace para crear una nueva contrasena.
            </p>

            <form onSubmit={handleSendReset} className="mt-6 grid gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electronico"
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
                className="mt-2 rounded-2xl bg-[#2FA84F] px-4 py-3 text-sm font-black text-white shadow-lg hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar correo de recuperacion"}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              Ya recordaste tu contrasena?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#F4C400] hover:underline"
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
              ✉
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Correo enviado
            </h2>

            <p className="mt-3 text-lg font-black text-[#2FA84F]">
              Revisa tu bandeja de entrada
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Si el correo existe en Aclasif, vas a recibir un enlace para cambiar tu contrasena.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-[#F4C400] px-6 py-3 text-sm font-black text-black shadow-lg hover:brightness-110"
            >
              Volver a iniciar sesion
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}