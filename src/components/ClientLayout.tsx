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

  // Define routes that should NOT have Header/Footer
  const noHeaderFooterRoutes = ["/login/seller", "/login/buyer", "/signup" , "/signin"];

  // Check if current route is in noHeaderFooterRoutes
  const isMinimalLayout = noHeaderFooterRoutes.includes(pathname);

  return (
    <>
      {!isMinimalLayout && <Header />}
      <main className={`flex-grow ${isMinimalLayout ? "" : "pt-20 pb-20"}`}>
        {children}
      </main>
      {!isMinimalLayout && <Footer />}
    </>
  );
}