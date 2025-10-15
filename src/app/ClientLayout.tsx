"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Updated routes to exclude Header/Footer
  const noHeaderFooterRoutes = ["/signin/seller", "/signin/buyer", "/signup"];

  const isMinimalLayout = noHeaderFooterRoutes.includes(pathname);

  return (
    <>
      {!isMinimalLayout && <Header />}
      <main className={`flex-grow ${isMinimalLayout ? "" : "pt-32 pb-20"}`}>
        {children}
      </main>
      {!isMinimalLayout && <Footer />}
    </>
  );
}