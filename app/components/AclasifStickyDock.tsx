"use client";
import Link from "next/link";

interface DockItem {
  label: string;
  href: string;
  icon: string;
  gradient: string;
  borderColor: string;
}

export default function AclasifStickyDock() {
  const menuItems: DockItem[] = [
    {
      label: "Sobre Nosotros",
      href: "/sobre-nosotros",
      icon: "🏠",
      gradient: "from-orange-500 to-amber-500",
      borderColor: "rgba(249, 115, 22, 0.4)",
    },
    {
      label: "¿Cómo vender?",
      href: "/como-vender",
      icon: "🤝",
      gradient: "from-indigo-500 to-purple-500",
      borderColor: "rgba(99, 102, 241, 0.4)",
    },
    {
      label: "Ser Premium",
      href: "/ser-premium",
      icon: "⭐",
      gradient: "from-yellow-400 to-orange-400",
      borderColor: "rgba(234, 179, 8, 0.4)",
    },
    {
      label: "Centro de Ayuda",
      href: "/centro-ayuda",
      icon: "💬",
      gradient: "from-slate-400 to-slate-600",
      borderColor: "rgba(148, 163, 184, 0.4)",
    },
    {
      label: "Términos",
      href: "/terminos",
      icon: "📜",
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      label: "Privacidad",
      href: "/privacidad",
      icon: "🔒",
      gradient: "from-emerald-400 to-teal-600",
      borderColor: "rgba(52, 211, 153, 0.4)",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6 relative z-30">
      <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-slate-950/60 p-3 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="flex w-full items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none md:justify-around">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex flex-col items-center gap-1.5 min-w-[70px] group transition-transform active:scale-95"
            >
              <div
                style={{ boxShadow: `0 0 15px ${item.borderColor}` }}
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-xl text-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:brightness-110`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-medium text-slate-300 text-center tracking-tight transition-colors group-hover:text-white md:text-xs">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}