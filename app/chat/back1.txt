"use client";
import { useSearchParams } from "next/navigation";
import AclasifChatFullscreen from "../components/AclasifChatFullscreen";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const producto = searchParams.get("producto") || "";
  return (
    <main className="min-h-screen bg-slate-900">
      <AclasifChatFullscreen productoInicial={producto} />
    </main>
  );
}