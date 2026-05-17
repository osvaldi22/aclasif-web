"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function AclasifChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    () => "web_" + Math.random().toString(36).substring(2, 10)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: `👋 ¡Hola! Soy el asistente virtual de Aclasif.

¿En qué puedo ayudarte?

🛍️ Cómo comprar
📦 Consultar un pedido
💰 Precios y pagos
📮 Envíos y entregas
📝 Publicar un artículo
❓ Otra consulta`,
        },
      ]);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: text, session_id: sessionId }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.respuesta || "Lo siento, no entendí tu consulta." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ No pude conectar con el asistente. ¿Está encendido el servidor?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Burbuja flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white shadow-lg hover:scale-110 transition-transform duration-300 animate-bounce"
          title="Asistente Virtual"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border-2 border-[#0066FF]/30 bg-white shadow-2xl">
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0066FF] to-[#0052CC] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">
                🤖
              </div>
              <div>
                <p className="font-bold text-sm">Asistente Aclasif</p>
                <p className="text-[10px] opacity-80">Respuesta en segundos</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#0066FF] text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                  }`}
                >
                  {/* AQUÍ ESTÁ EL CAMBIO PARA LOS ENLACES AZULES (BURBUJA CHICA) */}
                  {msg.role === "bot" ? (
                    <span dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #0066FF; font-weight: bold; text-decoration: underline;">$1</a>')
                    }} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 text-sm">
                  <span className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe tu consulta aquí..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#0066FF] px-4 py-2.5 text-white font-bold hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}