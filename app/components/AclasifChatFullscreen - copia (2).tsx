"use client";
import { useState, useEffect, useRef } from "react";

type Message = { role: "user" | "bot"; text: string };

interface OrderData {
  order?: string;
  producto?: string;
  nombre?: string;
  whatsapp?: string;
  email?: string;
}

export default function AclasifChatFullscreen({
  order,
  producto,
  nombre,
  whatsapp,
  email,
}: OrderData) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "compra_" + Math.random().toString(36).substring(2, 10);
    setSessionId(id);

    // --- MAGIA: Enviar los datos a Telegram de forma silenciosa ---
    if (order || producto) {
      fetch("http://localhost:5000/api/notificar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, producto, nombre, whatsapp, email }),
      }).catch((err) => console.log("Aviso Telegram:", err));
    }
    // --------------------------------------------------------------

    // Si hay datos de orden real, el asistente toma la iniciativa
    if (order) {
      const mensajeBienvenida = `¡Hola ${nombre || "cliente"}! 😊\nGracias por tu pedido #${order} del producto "${producto}".\n\nPara avanzar, ¿necesitás hacer alguna otra consulta? Estamos acá para despejar cualquier duda que tengas.\n\nSi ya está todo claro, decime y te paso el contacto directo de un representante de ventas de Aclasif para coordinar tu pago. ¡Quedo atento a lo que decidas!`;
      setMessages([{ role: "bot", text: mensajeBienvenida }]);
      return;
    }

    // Si no hay orden, es una consulta genérica o una prueba de producto
    fetch(`http://localhost:5000/api/historial/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else if (producto) {
          const msg = `Quiero comprar ${producto}`;
          setMessages([{ role: "user", text: msg }]);
          enviarMensaje(msg, id);
        } else {
          setMessages([{ role: "bot", text: "👋 ¡Hola! Soy el asistente de Aclasif. ¿En qué puedo ayudarte?" }]);
        }
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const enviarMensaje = async (texto: string, sesion: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/chat-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto, session_id: sesion }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.respuesta }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Error de conexión." }]);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const texto = input.trim();
    setMessages(prev => [...prev, { role: "user", text: texto }]);
    setInput("");
    enviarMensaje(texto, sessionId);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
        <div>
          <h2 className="font-bold">Asistente Aclasif</h2>
          <p className="text-xs opacity-80">Chat de compra</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user" ? "bg-[#0066FF] text-white" : "bg-white text-gray-800 shadow border"
            }`}>
               {/* Enlaces azules clickeables */}
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
            <div className="bg-white text-gray-400 px-4 py-3 rounded-2xl shadow text-sm">Escribiendo...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Escribe tu mensaje..."
          className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-300"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-[#0066FF] text-white px-6 rounded-xl font-bold hover:bg-[#0052CC] disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}