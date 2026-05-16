import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmazonPy - Aclasif",
  description: "La plataforma de clasificados más segura de Paraguay",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}