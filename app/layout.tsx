import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import AuthProvider from "@/app/providers/auth-provider";
import { NavbarWrapper } from "@/app/components/layout/NavbarWrapper";
import Providers from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyBridge - Chinese University Study Offers",
  description: "Discover study opportunities at top Chinese universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavbarWrapper>
                {children}
              </NavbarWrapper>
            </ThemeProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css'