import type { Metadata } from "next";
import TransitionLayout from "@/components/TransitionLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RulifTaskify - Personal Project Next Movie",
    template: "%s | RulifTaskify",
  },
  description:
    "RulifTaskify — website film sederhana yang menampilkan daftar film populer, detail film, dan memungkinkan pengguna untuk memberikan komentar serta rating. di bangun dengan Next.js, Tailwind CSS, dan Firebase",
  keywords: ["movie", "film", "populer", "detail film", "komentar", "rating", "RulifTaskify"],
  authors: [{ name: "Rulif Adrian", url: "https://webrulif.vercel.app/" }],
  publisher: "Rulif Adrian",
  metadataBase: new URL("https://ruliftaskify-movie.vercel.app/"),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "RulifTaskify",
    description:
      "Website film sederhana yang menampilkan daftar film populer, detail film, dan memungkinkan pengguna untuk memberikan komentar serta rating.",
    url: "https://ruliftaskify-movie.vercel.app/",
    siteName: "RulifTaskify",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "RulifTaskify" }],
    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "RulifTaskify",
    description: "Website film sederhana yang menampilkan daftar film populer, detail film, dan memungkinkan pengguna untuk memberikan komentar serta rating.",
    images: ["/logo.png"],
    creator: "@ruliffadrian",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <TransitionLayout>
          {children}
        </TransitionLayout>
      </body>
    </html>
  );
}