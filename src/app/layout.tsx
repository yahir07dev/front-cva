import type { Metadata } from "next";
import { Geist, Geist_Mono, Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CVA",
    default: "SIGE",
  },
  description: "Sistema Integral de Gestión Empresarial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // IMPORTANTE: suppressHydrationWarning evita errores de consola por el cambio de clase que haremos manualmente
    <html lang="es" suppressHydrationWarning>
      <body className={`${onest.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* SCRIPT ANTI-PARPADEO:
          Este script se ejecuta antes de que React cargue.
          1. Busca en localStorage.
          2. Si no hay nada, busca la preferencia del sistema.
          3. Aplica la clase 'dark' inmediatamente al <html>.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'theme';
                  var className = 'dark';
                  var d = document.documentElement;
                  var localStorageTheme = localStorage.getItem(storageKey);
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (localStorageTheme === 'dark' || (!localStorageTheme && systemTheme)) {
                    d.classList.add(className);
                  } else {
                    d.classList.remove(className);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}