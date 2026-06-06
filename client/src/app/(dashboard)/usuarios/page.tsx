"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import type { Usuario } from "@/types";

const INPUT =
  "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-400";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

const PERFIS = ["voluntario", "tecnico", "admin"];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [me, setMe] = useState<Usuario | null>(null);

  const [showCriar, setShowCriar] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoPerfil, setNovoPerfil] = useState("voluntario");
  const [erroCriar, setErroCriar] = useState("");
  const [loadingCriar, setLoadingCriar] = useState(false);

  const [usuarioReset, setUsuarioReset] = useState<Usuario | null>(null);
  const [novaSenhaReset, setNovaSenhaReset] = useState("");
  const [erroReset, setErroReset] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);

  function load() {
    api.get<Usuario>("/usuarios/me").then((r) => setMe(r.data)).catch(() => {});
    api.get<Usuario[]>("/usuarios/").then((r) => setUsuarios(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErroCriar("");
    setLoadingCriar(true);
    try {
      await api.post("/usuarios/", { nome: novoNome, email: novoEmail, senha: novaSenha, perfil: novoPerfil });
      setShowCriar(false);
      setNovoNome(""); setNovoEmail(""); setNovaSenha(""); setNovoPerfil("voluntario");
      load();
    } catch (err: any) {
      setErroCriar(err?.response?.data?.detail ?? "Erro ao criar usuário.");
    } finally {
      setLoadingCriar(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioReset) return;
    setErroReset("");
    setLoadingReset(true);
    try {
      await api.post("/usuarios/reset-senha", { usuario_id: usuarioReset.id, nova_senha: novaSenhaReset });
      setUsuarioReset(null);
      setNovaSenhaReset("");
    } catch (err: any) {
      setErroReset(err?.response?.data?.detail ?? "Erro ao redefinir senha.");
    } finally {
      setLoadingReset(false);
    }
  }

  async function toggleAtivo(u: Usuario) {
    await api.patch(`/usuarios/${u.id}`, { ativo: !u.ativo }).catch(() => {});
    load();
  }

  const perfilLabel: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    tecnico: "Técnico",
    voluntario: "Voluntário",
  };

  return (
    <>
      <Header title="Usuários" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Gestão de Usuários</h2>
            <p className="text-sm text-gray-500 mt-0.5">Controle de acesso ao sistema</p>
          </div>
          <button
            onClick={() => setShowCriar(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Usuário
          </button>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-primary/10">
                  <th className="text-left px-4 py-3 font-semibold">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold">E-mail</th>
                  <th className="text-left px-4 py-3 font-semibold">Perfil</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-t border-gray-100 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {u.nome}
                        {u.id === me?.id && (
                          <span className="ml-2 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">(você)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.is_super_admin ? "info" : "neutral"}>
                          {perfilLabel[u.perfil] ?? u.perfil}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.ativo ? "success" : "error"}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setUsuarioReset(u); setNovaSenhaReset(""); setErroReset(""); }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Redefinir senha"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          </button>
                          {!u.is_super_admin && u.id !== me?.id && (
                            <button
                              onClick={() => toggleAtivo(u)}
                              className={`p-2 rounded-lg transition-colors ${u.ativo ? "text-error hover:bg-error-container" : "text-primary hover:bg-primary/10"}`}
                              title={u.ativo ? "Desativar" : "Ativar"}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {u.ativo ? "person_off" : "person_check"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal — Criar Usuário */}
      {showCriar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Novo Usuário</h3>
              <button onClick={() => setShowCriar(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCriar} className="flex flex-col gap-4">
                <div>
                  <label className={LABEL}>Nome completo</label>
                  <input type="text" placeholder="Nome completo" value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)} required className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>E-mail</label>
                  <input type="email" placeholder="email@exemplo.com" value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)} required className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Senha provisória</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)} required minLength={6} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Perfil</label>
                  <select value={novoPerfil} onChange={(e) => setNovoPerfil(e.target.value)} className={INPUT}>
                    {PERFIS.map((p) => (
                      <option key={p} value={p}>{perfilLabel[p]}</option>
                    ))}
                  </select>
                </div>
                {erroCriar && (
                  <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroCriar}</p>
                )}
                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowCriar(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loadingCriar} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                    {loadingCriar ? "Criando..." : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Redefinir Senha */}
      {usuarioReset && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Redefinir senha</h3>
                <p className="text-xs text-white/60 mt-0.5">{usuarioReset.nome}</p>
              </div>
              <button onClick={() => setUsuarioReset(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div>
                  <label className={LABEL}>Nova senha</label>
                  <input type="password" placeholder="Mínimo 6 caracteres" value={novaSenhaReset}
                    onChange={(e) => setNovaSenhaReset(e.target.value)} required minLength={6} className={INPUT} />
                </div>
                {erroReset && (
                  <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroReset}</p>
                )}
                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setUsuarioReset(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loadingReset} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                    {loadingReset ? "Salvando..." : "Redefinir"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
