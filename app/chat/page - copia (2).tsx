"use client";
import { useSearchParams } from "next/navigation";
import AclasifChatFullscreen from "../components/AclasifChatFullscreen";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order") || "";
  const producto = searchParams.get("producto") || "";
  const nombre = searchParams.get("nombre") || "";
  const whatsapp = searchParams.get("whatsapp") || "";
  const email = searchParams.get("email") || "";

  return (
    <main className="min-h-screen bg-slate-900">
      <AclasifChatFullscreen
        order={order}
        producto={producto}
        nombre={nombre}
        whatsapp={whatsapp}
        email={email}
      />
    </main>
  );
}