import { Suspense } from "react";
import AclasifChatFullscreen from "@/app/components/AclasifChatFullscreen";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center text-white font-bold bg-slate-900">
          Cargando Chat...
        </div>
      }>
        <AclasifChatFullscreen />
      </Suspense>
    </main>
  );
}