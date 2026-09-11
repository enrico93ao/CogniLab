import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CogniLab · Il tuo allenamento cognitivo",
  description: "Esercizi per memoria, attenzione, linguaggio e logica. Segui il tuo percorso e i tuoi progressi.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
