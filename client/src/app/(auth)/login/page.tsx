"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-secondary/20" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-4 backdrop-blur-sm overflow-hidden">
            <img src="/logo.png" alt="Logo Terra da Esperança" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Terra da Esperança</h1>
          <p className="text-sm text-white/60 mt-1">Sistema de Gestão</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-secondary-container/20 px-8 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-primary">Bem-vindo de volta</h2>
            <p className="text-xs text-gray-500 mt-0.5">Faça login para continuar</p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">E-mail</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              {erro && (
                <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erro}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-primary-container transition-colors disabled:opacity-60 mt-1"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          © 2025 Terra da Esperança
        </p>
      </div>
    </div>
  );
}
