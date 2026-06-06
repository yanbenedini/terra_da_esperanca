"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Usuario } from "@/types";

const NAV_BASE = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/hospedes", icon: "people", label: "Hóspedes" },
  { href: "/voluntarios", icon: "volunteer_activism", label: "Voluntários" },
  { href: "/financeiro", icon: "account_balance_wallet", label: "Financeiro" },
];

const NAV_ADMIN = { href: "/usuarios", icon: "manage_accounts", label: "Usuários" };

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Usuario | null>(null);
  const [showSenha, setShowSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [okSenha, setOkSenha] = useState(false);

  useEffect(() => {
    api.get<Usuario>("/usuarios/me").then((r) => setMe(r.data)).catch(() => {});
  }, []);

  const navItems = me?.is_super_admin ? [...NAV_BASE, NAV_ADMIN] : NAV_BASE;

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErroSenha("");
    setOkSenha(false);
    try {
      await api.post("/usuarios/minha-senha", { senha_atual: senhaAtual, nova_senha: novaSenha });
      setOkSenha(true);
      setSenhaAtual("");
      setNovaSenha("");
    } catch (err: any) {
      setErroSenha(err?.response?.data?.detail ?? "Erro ao alterar senha.");
    }
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-primary sticky top-0">
        {/* Logo */}
        <div className="px-6 py-6 mb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Terra da Esperança" className="w-9 h-9 object-contain rounded-lg" />
            <span className="text-base font-bold text-white leading-tight">
              Terra da<br />Esperança
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${active ? "text-secondary-container" : ""}`}
                  style={active ? { fontVariationSettings: '"FILL" 1' } : {}}
                >
                  {icon}
                </span>
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary-container" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-1">
          {/* Info do usuário */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-secondary-container">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{me?.nome ?? "—"}</p>
              <p className="text-xs text-white/50 truncate">{me?.email ?? ""}</p>
            </div>
          </div>

          {/* Alterar senha */}
          <button
            onClick={() => { setShowSenha(true); setErroSenha(""); setOkSenha(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/65 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            Alterar senha
          </button>

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Modal — Alterar Senha */}
      {showSenha && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <h3 className="text-base font-semibold text-white">Alterar minha senha</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Senha atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nova senha (mín. 6 caracteres)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                {erroSenha && (
                  <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroSenha}</p>
                )}
                {okSenha && (
                  <p className="text-sm text-primary bg-primary-fixed px-3 py-2 rounded-lg">Senha alterada com sucesso!</p>
                )}
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSenha(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                  {!okSenha && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
                    >
                      Salvar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
