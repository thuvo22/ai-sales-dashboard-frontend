import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnPoint Pros — AI Sales Dashboard",
  description:
    "Internal AI Sales & Audit Dashboard for OnPoint Pros home renovation business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
