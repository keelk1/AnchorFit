import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnchorFit | Data-Driven VC Prioritization",
  description: "Optimize your fundraising outreach with the AIx Alignment Index.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
