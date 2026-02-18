import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from 'sonner'
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { AgentSync } from "@/components/providers/agent-sync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Start Inc. - AI Executive Team Dashboard",
  description: "Operational dashboard for Start Inc. AI Executive Team with real-time Supabase backup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ConvexClientProvider>
          <AgentSync />
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
