import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata: Metadata = {
  title: {
    default: "CareFlow Doctor Portal",
    template: "%s | CareFlow Doctor Portal",
  },
  description:
    "CareFlow AI-powered Doctor Portal — manage encounters, review AI clinical dashboards, and interact with your AI physician assistant.",
  keywords: ["CareFlow", "Doctor Portal", "Clinical AI", "Medical Dashboard", "AI Assistant"],
  authors: [{ name: "CareFlow AI Team" }],
  icons: {
    icon: "/assets/img/favicon.png",
    apple: "/assets/img/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#021418] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        <UserProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <NotificationContainer />
            </QueryProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
