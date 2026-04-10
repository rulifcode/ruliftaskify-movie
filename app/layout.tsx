import type { Metadata } from "next";
import TransitionLayout from "@/components/TransitionLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "RulifTaskify",
  description: "Your personal task manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TransitionLayout>
          {children}
        </TransitionLayout>
      </body>
    </html>
  );
}