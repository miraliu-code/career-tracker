import type { Metadata } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { BadgeToaster } from "@/components/badge-toaster";
import { Nav } from "@/components/nav";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Tracker",
  description: "Track job applications, funding programs, and follow-ups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
        <BadgeToaster />
      </body>
    </html>
  );
}
