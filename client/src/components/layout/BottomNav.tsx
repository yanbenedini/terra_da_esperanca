"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Usuario } from "@/types";

const NAV_BASE = [
  { href: "/dashboard", icon: "dashboard", label: "Home" },
  { href: "/hospedes", icon: "people", label: "Hóspedes" },
  { href: "/voluntarios", icon: "volunteer_activism", label: "Voluntários" },
  { href: "/financeiro", icon: "account_balance_wallet", label: "Financeiro" },
];

const NAV_ADMIN = { href: "/usuarios", icon: "manage_accounts", label: "Usuários" };

export default function BottomNav() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    api.get<Usuario>("/usuarios/me").then((r) => setIsSuperAdmin(r.data.is_super_admin)).catch(() => {});
  }, []);

  const navItems = isSuperAdmin ? [...NAV_BASE, NAV_ADMIN] : NAV_BASE;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-primary/20 shadow-lg">
      <div className={`grid grid-cols-${navItems.length}`}>
        {navItems.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {icon}
              </span>
              {label}
              {active && <span className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-t-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
