"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import type { Voluntario } from "@/types";

const INPUT =
  "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-400";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

const ESPECIALIDADES = [
  "Psicologia",
  "Medicina",
  "Enfermagem",
  "Nutrição",
  "Serviço Social",
  "Jurídico",
  "Educação",
  "Cozinha",
  "Limpeza",
  "Administração",
  "Outra",
];

type NovoForm = {
  nome_completo: string;
  especialidade: string;
  email: string;
  telefone: string;
  disponibilidade: string;
  status: "ativo" | "inativo";
};

const EMPTY_NOVO: NovoForm = {
  nome_completo: "",
  especialidade: "Psicologia",
  email: "",
  telefone: "",
  disponibilidade: "",
  status: "ativo",
};

type EditForm = {
  nome_completo: string;
  especialidade: string;
  email: string;
  telefone: string;
  disponibilidade: string;
};

export default function VoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [busca, setBusca] = useState("");

  // Modal criar
  const [showCriar, setShowCriar] = useState(false);
  const [novoForm, setNovoForm] = useState<NovoForm>(EMPTY_NOVO);
  const [erroCriar, setErroCriar] = useState("");
  const [loadingCriar, setLoadingCriar] = useState(false);

  // Modal editar
  const [voluntarioEdit, setVoluntarioEdit] = useState<Voluntario | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    nome_completo: "",
    especialidade: "",
    email: "",
    telefone: "",
    disponibilidade: "",
  });
  const [erroEdit, setErroEdit] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Modal excluir
  const [voluntarioExcluir, setVoluntarioExcluir] = useState<Voluntario | null>(null);
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  function load() {
    api.get<Voluntario[]>("/voluntarios/").then((r) => setVoluntarios(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const filtrados = voluntarios.filter(
    (v) =>
      v.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      v.especialidade.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos = voluntarios.filter((v) => v.status === "ativo").length;

  // ─── Criar ────────────────────────────────────────────────────────────
  function openCriar() {
    setNovoForm(EMPTY_NOVO);
    setErroCriar("");
    setShowCriar(true);
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErroCriar("");
    setLoadingCriar(true);
    try {
      await api.post("/voluntarios/", {
        nome_completo: novoForm.nome_completo,
        especialidade: novoForm.especialidade,
        email: novoForm.email || undefined,
        telefone: novoForm.telefone || undefined,
        disponibilidade: novoForm.disponibilidade || undefined,
        status: novoForm.status,
      });
      setShowCriar(false);
      load();
    } catch (err: any) {
      setErroCriar(err?.response?.data?.detail ?? "Erro ao cadastrar voluntário.");
    } finally {
      setLoadingCriar(false);
    }
  }

  // ─── Editar ───────────────────────────────────────────────────────────
  function openEdit(v: Voluntario) {
    setVoluntarioEdit(v);
    setEditForm({
      nome_completo: v.nome_completo,
      especialidade: v.especialidade,
      email: v.email ?? "",
      telefone: v.telefone ?? "",
      disponibilidade: v.disponibilidade ?? "",
    });
    setErroEdit("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!voluntarioEdit) return;
    setErroEdit("");
    setLoadingEdit(true);
    try {
      await api.patch(`/voluntarios/${voluntarioEdit.id}`, {
        nome_completo: editForm.nome_completo,
        especialidade: editForm.especialidade,
        email: editForm.email || null,
        telefone: editForm.telefone || null,
        disponibilidade: editForm.disponibilidade || null,
      });
      setVoluntarioEdit(null);
      load();
    } catch (err: any) {
      setErroEdit(err?.response?.data?.detail ?? "Erro ao salvar alterações.");
    } finally {
      setLoadingEdit(false);
    }
  }

  // ─── Ativar / Desativar ───────────────────────────────────────────────
  async function toggleStatus(v: Voluntario) {
    const novoStatus = v.status === "ativo" ? "inativo" : "ativo";
    await api.patch(`/voluntarios/${v.id}`, { status: novoStatus }).catch(() => {});
    load();
  }

  // ─── Excluir ──────────────────────────────────────────────────────────
  async function handleExcluir() {
    if (!voluntarioExcluir) return;
    setLoadingExcluir(true);
    try {
      await api.delete(`/voluntarios/${voluntarioExcluir.id}`);
      setVoluntarioExcluir(null);
      load();
    } catch {
      // silencioso
    } finally {
      setLoadingExcluir(false);
    }
  }

  return (
    <>
      <Header title="Voluntários" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Gestão de Voluntários</h2>
            <p className="text-sm text-gray-500 mt-0.5">Equipe de apoio da instituição</p>
          </div>
          <button
            onClick={openCriar}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Voluntário
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>volunteer_activism</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{ativos}</p>
                <p className="text-sm text-gray-500">Voluntários ativos</p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-xs text-gray-400 mb-1">Total cadastrado</p>
            <p className="text-2xl font-bold text-gray-700">{voluntarios.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-400 mb-1">Inativos</p>
            <p className="text-2xl font-bold text-gray-400">{voluntarios.length - ativos}</p>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input
                type="search"
                placeholder="Buscar por nome ou especialidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-primary/10">
                  <th className="text-left px-4 py-3 font-semibold">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold">Especialidade</th>
                  <th className="text-left px-4 py-3 font-semibold">Contato</th>
                  <th className="text-left px-4 py-3 font-semibold">Disponibilidade</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <span className="material-symbols-outlined text-[40px] mb-2 block text-gray-300">search_off</span>
                      Nenhum voluntário encontrado.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((v, i) => (
                    <tr
                      key={v.id}
                      className={`border-t border-gray-100 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{v.nome_completo}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                          {v.especialidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {v.email && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            {v.email}
                          </span>
                        )}
                        {v.telefone && (
                          <span className="flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">phone</span>
                            {v.telefone}
                          </span>
                        )}
                        {!v.email && !v.telefone && "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                        {v.disponibilidade ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={v.status === "ativo" ? "success" : "neutral"}>
                          {v.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(v)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => toggleStatus(v)}
                            className={`p-2 rounded-lg transition-colors ${
                              v.status === "ativo"
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-primary hover:bg-primary/10"
                            }`}
                            title={v.status === "ativo" ? "Desativar" : "Ativar"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {v.status === "ativo" ? "person_off" : "person_check"}
                            </span>
                          </button>
                          <button
                            onClick={() => setVoluntarioExcluir(v)}
                            className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
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

      {/* ── Modal: Novo Voluntário ──────────────────────────────────────── */}
      {showCriar && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Novo Voluntário</h3>
                  <p className="text-xs text-white/60 mt-0.5">Preencha os dados do voluntário</p>
                </div>
                <button onClick={() => setShowCriar(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleCriar} className="flex flex-col gap-4">
                  <div>
                    <label className={LABEL}>Nome completo *</label>
                    <input
                      type="text" required placeholder="Nome completo"
                      value={novoForm.nome_completo}
                      onChange={(e) => setNovoForm({ ...novoForm, nome_completo: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Especialidade *</label>
                    <select
                      required value={novoForm.especialidade}
                      onChange={(e) => setNovoForm({ ...novoForm, especialidade: e.target.value })}
                      className={INPUT}
                    >
                      {ESPECIALIDADES.map((esp) => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>E-mail</label>
                      <input
                        type="email" placeholder="email@exemplo.com"
                        value={novoForm.email}
                        onChange={(e) => setNovoForm({ ...novoForm, email: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Telefone</label>
                      <input
                        type="tel" placeholder="(00) 00000-0000"
                        value={novoForm.telefone}
                        onChange={(e) => setNovoForm({ ...novoForm, telefone: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Disponibilidade</label>
                    <input
                      type="text" placeholder="Ex: Seg e Qua, 14h–18h"
                      value={novoForm.disponibilidade}
                      onChange={(e) => setNovoForm({ ...novoForm, disponibilidade: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Status inicial</label>
                    <select
                      value={novoForm.status}
                      onChange={(e) => setNovoForm({ ...novoForm, status: e.target.value as "ativo" | "inativo" })}
                      className={INPUT}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
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
                      {loadingCriar ? "Cadastrando..." : "Cadastrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Voluntário ────────────────────────────────────── */}
      {voluntarioEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Editar Voluntário</h3>
                  <p className="text-xs text-white/60 mt-0.5">{voluntarioEdit.nome_completo}</p>
                </div>
                <button onClick={() => setVoluntarioEdit(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleEdit} className="flex flex-col gap-4">
                  <div>
                    <label className={LABEL}>Nome completo *</label>
                    <input
                      type="text" required
                      value={editForm.nome_completo}
                      onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Especialidade *</label>
                    <select
                      required value={editForm.especialidade}
                      onChange={(e) => setEditForm({ ...editForm, especialidade: e.target.value })}
                      className={INPUT}
                    >
                      {ESPECIALIDADES.map((esp) => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>E-mail</label>
                      <input
                        type="email" placeholder="email@exemplo.com"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Telefone</label>
                      <input
                        type="tel" placeholder="(00) 00000-0000"
                        value={editForm.telefone}
                        onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Disponibilidade</label>
                    <input
                      type="text" placeholder="Ex: Seg e Qua, 14h–18h"
                      value={editForm.disponibilidade}
                      onChange={(e) => setEditForm({ ...editForm, disponibilidade: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                  {erroEdit && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroEdit}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setVoluntarioEdit(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loadingEdit} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingEdit ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar Exclusão ───────────────────────────────────── */}
      {voluntarioExcluir && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-error px-6 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-[24px]">delete</span>
              <h3 className="text-base font-semibold text-white">Excluir Voluntário</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-1">Você está prestes a excluir:</p>
              <p className="font-semibold text-gray-800 mb-1">{voluntarioExcluir.nome_completo}</p>
              <p className="text-xs text-secondary mb-5">{voluntarioExcluir.especialidade}</p>
              <p className="text-sm text-gray-500 mb-6">
                Esta ação é <strong>permanente</strong> e não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setVoluntarioExcluir(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={handleExcluir} disabled={loadingExcluir} className="px-5 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors">
                  {loadingExcluir ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
