import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rovixstore.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rovix Store | Robux barato, rápido e seguro",
  description: "Loja premium para comprar Robux com checkout PIX rápido, visual gamer e entrega segura.",
  keywords: ["Robux", "Rovix Store", "PIX", "Roblox", "loja gamer"],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Rovix Store",
    description: "Robux barato, rápido e seguro.",
    url: siteUrl,
    siteName: "Rovix Store",
    type: "website",
    locale: "pt_BR"
  },
  twitter: {
    card: "summary_large_image",
    title: "Rovix Store",
    description: "Robux barato, rápido e seguro."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="noise">{children}</body>
    </html>
  );
}
