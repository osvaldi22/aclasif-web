"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
};

interface OrderData {
  order?: string;
  producto?: string;
  nombre?: string;
  whatsapp?: string;
  email?: string;
  article_code?: string;
  codigo_articulo?: string;
  link_articulo?: string;
}

interface CompraInfo {
  producto?: string;
  titulo_producto?: string;
  codigo_articulo?: string;
  article_code?: string;
  order?: string;
  nombre?: string;
  whatsapp?: string;
  email?: string;
  link_articulo?: string;
  vendedor_nombre?: string;
  vendedor_whatsapp?: string;
  seller_id?: string;
}

const API_URL = "http://localhost:5000";

function limpiar(valor?: string) {
  if (!valor || valor.trim() === "") {
    return "No especificado";
  }

  return valor.trim();
}

function crearMensajeBienvenida(info: CompraInfo) {
  const nombreCliente = limpiar(info.nombre);
  const orden = limpiar(info.order);
  const producto = limpiar(info.titulo_producto || info.producto);
  const codigo = limpiar(info.codigo_articulo || info.article_code);
  const whatsapp = limpiar(info.whatsapp);
  const email = limpiar(info.email);
  const link = limpiar(info.link_articulo);

  return `¡Hola ${nombreCliente}! 😊
Gracias por tu pre compra en Aclasif.

Estos son los datos de tu pedido:

📝 N° de Orden: ${orden}
📦 Producto: ${producto}
🏷️ Código del artículo: ${codigo}
🔗 Link del artículo: ${link}

Tus datos registrados:
👤 Nombre: ${nombreCliente}
📱 WhatsApp: ${whatsapp}
✉️ Email: ${email}

Para finalizar la compra de forma segura, escribinos a Ventas de Aclasif por este WhatsApp:
https://wa.me/595981784334

Cuando escribas, enviá el N° de Orden y el Código del artículo para identificar rápido tu compra.`;
}

function convertirLinks(texto: string) {
  const seguro = texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return seguro.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #0066FF; font-weight: bold; text-decoration: underline;">$1</a>'
  );
}

export default function AclasifChatFullscreen({
  order,
  producto,
  nombre,
  whatsapp,
  email,
  article_code,
  codigo_articulo,
  link_articulo,
}: OrderData) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const enviarMensaje = async (texto: string, sesion: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat-web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: texto,
          session_id: sesion,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.respuesta || "No pude responder en este momento.",
        },
      ]);
    } catch (error) {
      console.log("Error chat-web:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ Error de conexión.",
        },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const id = "compra_" + Math.random().toString(36).substring(2, 10);
    setSessionId(id);

    const iniciarChat = async () => {
      const urlActual =
        typeof window !== "undefined" ? window.location.href : "";

      const paginaOrigen =
        typeof document !== "undefined" ? document.referrer : "";

      const codigoFinal = article_code || codigo_articulo || "";

      if (order || producto || codigoFinal) {
        try {
          const res = await fetch(`${API_URL}/api/notificar-compra`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order,
              producto,
              nombre,
              whatsapp,
              email,
              article_code: codigoFinal,
              codigo_articulo: codigoFinal,
              link_articulo,
              url_actual: urlActual,
              pagina_origen: paginaOrigen,
            }),
          });

          const data = await res.json();

          const info: CompraInfo = {
            order,
            producto,
            nombre,
            whatsapp,
            email,
            article_code: codigoFinal,
            codigo_articulo: codigoFinal,
            link_articulo,
            ...(data?.compra || {}),
          };

          setMessages([
            {
              role: "bot",
              text: crearMensajeBienvenida(info),
            },
          ]);

          return;
        } catch (error) {
          console.log("Aviso Telegram / datos compra:", error);

          setMessages([
            {
              role: "bot",
              text: crearMensajeBienvenida({
                order,
                producto,
                nombre,
                whatsapp,
                email,
                article_code: codigoFinal,
                codigo_articulo: codigoFinal,
                link_articulo: link_articulo || urlActual,
              }),
            },
          ]);

          return;
        }
      }

      try {
        const res = await fetch(`${API_URL}/api/historial/${id}`);
        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([
            {
              role: "bot",
              text: "👋 ¡Hola! Soy el asistente de Aclasif. ¿En qué puedo ayudarte?",
            },
          ]);
        }
      } catch (error) {
        console.log("Error historial:", error);

        setMessages([
          {
            role: "bot",
            text: "👋 ¡Hola! Soy el asistente de Aclasif. ¿En qué puedo ayudarte?",
          },
        ]);
      }
    };

    iniciarChat();
  }, [
    order,
    producto,
    nombre,
    whatsapp,
    email,
    article_code,
    codigo_articulo,
    link_articulo,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) {
      return;
    }

    const texto = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: texto,
      },
    ]);

    setInput("");

    enviarMensaje(texto, sessionId);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
          🤖
        </div>

        <div>
          <h2 className="font-bold">Asistente Aclasif</h2>
          <p className="text-xs opacity-80">Chat de compra</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#0066FF] text-white"
                  : "bg-white text-gray-800 shadow border"
              }`}
            >
              {msg.role === "bot" ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: convertirLinks(msg.text),
                  }}
                />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 px-4 py-3 rounded-2xl shadow text-sm">
              Escribiendo...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
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