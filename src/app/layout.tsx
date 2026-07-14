import type { Metadata } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { BadgeToaster } from "@/components/badge-toaster";
import { Companion } from "@/components/companion";
import { randomMascotSeed } from "@/components/mascots";
import { Nav } from "@/components/nav";
import {
  getCompanionContext,
  isCompanionHidden,
} from "@/app/companion-actions";
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

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Session-stable companion: seed is picked per request and, because the
  // root layout persists across client navigations, stays consistent until
  // a full reload — so the same mascot greets you across pages.
  const [companionHidden, companionContext] = await Promise.all([
    isCompanionHidden(),
    getCompanionContext(),
  ]);
  const companionSeed = randomMascotSeed();

  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
        <BadgeToaster />
        <Companion
          seed={companionSeed}
          initialHidden={companionHidden}
          initialContext={companionContext}
        />
      </body>
    </html>
  );
}
