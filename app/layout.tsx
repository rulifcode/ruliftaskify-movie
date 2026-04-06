import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rulif Taskify - Movie Discovery App",
  description: "Discover great films",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}