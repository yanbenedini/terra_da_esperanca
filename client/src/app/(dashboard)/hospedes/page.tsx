"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import type { Hospede, Ocupacao } from "@/types";

const INPUT =
  "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-400";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

const today = () => new Date().toISOString().split("T")[0];

type NovoForm = {
  nome_completo: string;
  sexo: "M" | "F";
  data_nascimento: string;
  cpf: string;
  clinica_origem: string;
  contato_emergencia_nome: string;
  contato_emergencia_telefone: string;
  data_entrada: string;
  medicacoes: string;
  alergias: string;
  historico_clinico: string;
};

const EMPTY_NOVO: NovoForm = {
  nome_completo: "",
  sexo: "M",
  data_nascimento: "",
  cpf: "",
  clinica_origem: "",
  contato_emergencia_nome: "",
  contato_emergencia_telefone: "",
  data_entrada: today(),
  medicacoes: "",
  alergias: "",
  historico_clinico: "",
};

type EditForm = {
  nome_completo: string;
  clinica_origem: string;
  contato_emergencia_nome: string;
  contato_emergencia_telefone: string;
  medicacoes: string;
  alergias: string;
  historico_clinico: string;
};

export default function HospedesPage() {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [ocupacao, setOcupacao] = useState<Ocupacao | null>(null);
  const [busca, setBusca] = useState("");

  // Modal criar
  const [showCriar, setShowCriar] = useState(false);
  const [novoForm, setNovoForm] = useState<NovoForm>(EMPTY_NOVO);
  const [erroCriar, setErroCriar] = useState("");
  const [loadingCriar, setLoadingCriar] = useState(false);

  // Modal editar
  const [hospedeEdit, setHospedeEdit] = useState<Hospede | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    nome_completo: "",
    clinica_origem: "",
    contato_emergencia_nome: "",
    contato_emergencia_telefone: "",
    medicacoes: "",
    alergias: "",
    historico_clinico: "",
  });
  const [erroEdit, setErroEdit] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Modal alta
  const [hospedeAlta, setHospedeAlta] = useState<Hospede | null>(null);
  const [loadingAlta, setLoadingAlta] = useState(false);

  // Modal prontuário
  const [hospedeProntuario, setHospedeProntuario] = useState<Hospede | null>(null);
  const [evolAutor, setEvolAutor] = useState("");
  const [evolAnotacao, setEvolAnotacao] = useState("");
  const [erroEvol, setErroEvol] = useState("");
  const [loadingEvol, setLoadingEvol] = useState(false);

  function load() {
    api.get<Hospede[]>("/hospedes/").then((r) => setHospedes(r.data)).catch(() => {});
    api.get<Ocupacao>("/hospedes/ocupacao").then((r) => setOcupacao(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const filtrados = hospedes.filter((h) =>
    h.nome_completo.toLowerCase().includes(busca.toLowerCase())
  );

  // ─── Criar ────────────────────────────────────────────────────────────
  function openCriar() {
    setNovoForm({ ...EMPTY_NOVO, data_entrada: today() });
    setErroCriar("");
    setShowCriar(true);
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErroCriar("");
    setLoadingCriar(true);
    try {
      await api.post("/hospedes/", {
        nome_completo: novoForm.nome_completo,
        sexo: novoForm.sexo,
        data_entrada: novoForm.data_entrada,
        data_nascimento: novoForm.data_nascimento || undefined,
        cpf: novoForm.cpf || undefined,
        clinica_origem: novoForm.clinica_origem || undefined,
        contato_emergencia_nome: novoForm.contato_emergencia_nome || undefined,
        contato_emergencia_telefone: novoForm.contato_emergencia_telefone || undefined,
        medicacoes: novoForm.medicacoes || undefined,
        alergias: novoForm.alergias || undefined,
        historico_clinico: novoForm.historico_clinico || undefined,
      });
      setShowCriar(false);
      load();
    } catch (err: any) {
      setErroCriar(err?.response?.data?.detail ?? "Erro ao cadastrar hóspede.");
    } finally {
      setLoadingCriar(false);
    }
  }

  // ─── Editar ───────────────────────────────────────────────────────────
  function openEdit(h: Hospede) {
    setHospedeEdit(h);
    setEditForm({
      nome_completo: h.nome_completo,
      clinica_origem: h.clinica_origem ?? "",
      contato_emergencia_nome: h.contato_emergencia_nome ?? "",
      contato_emergencia_telefone: h.contato_emergencia_telefone ?? "",
      medicacoes: h.medicacoes ?? "",
      alergias: h.alergias ?? "",
      historico_clinico: h.historico_clinico ?? "",
    });
    setErroEdit("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!hospedeEdit) return;
    setErroEdit("");
    setLoadingEdit(true);
    try {
      await api.patch(`/hospedes/${hospedeEdit.id}`, {
        nome_completo: editForm.nome_completo,
        clinica_origem: editForm.clinica_origem || null,
        contato_emergencia_nome: editForm.contato_emergencia_nome || null,
        contato_emergencia_telefone: editForm.contato_emergencia_telefone || null,
        medicacoes: editForm.medicacoes || null,
        alergias: editForm.alergias || null,
        historico_clinico: editForm.historico_clinico || null,
      });
      setHospedeEdit(null);
      load();
    } catch (err: any) {
      setErroEdit(err?.response?.data?.detail ?? "Erro ao salvar alterações.");
    } finally {
      setLoadingEdit(false);
    }
  }

  // ─── Alta ─────────────────────────────────────────────────────────────
  async function handleAlta() {
    if (!hospedeAlta) return;
    setLoadingAlta(true);
    try {
      await api.patch(`/hospedes/${hospedeAlta.id}`, { status: "alta", data_alta: today() });
      setHospedeAlta(null);
      load();
    } catch {
      // silencioso
    } finally {
      setLoadingAlta(false);
    }
  }

  // ─── Prontuário ───────────────────────────────────────────────────────
  function openProntuario(h: Hospede) {
    setHospedeProntuario(h);
    setEvolAutor("");
    setEvolAnotacao("");
    setErroEvol("");
  }

  async function handleAddEvolucao(e: React.FormEvent) {
    e.preventDefault();
    if (!hospedeProntuario) return;
    setErroEvol("");
    setLoadingEvol(true);
    try {
      await api.post(`/hospedes/${hospedeProntuario.id}/evolucoes`, {
        anotacao: evolAnotacao,
        autor_nome: evolAutor,
        data: today(),
      });
      const atualizado = await api.get<Hospede>(`/hospedes/${hospedeProntuario.id}`);
      setHospedeProntuario(atualizado.data);
      setEvolAutor("");
      setEvolAnotacao("");
      load();
    } catch (err: any) {
      setErroEvol(err?.response?.data?.detail ?? "Erro ao registrar evolução.");
    } finally {
      setLoadingEvol(false);
    }
  }

  return (
    <>
      <Header title="Hóspedes" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Gestão de Hóspedes</h2>
            <p className="text-sm text-gray-500 mt-0.5">Cadastro e acompanhamento</p>
          </div>
          <button
            onClick={openCriar}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Hóspede
          </button>
        </div>

        {/* Ocupação */}
        {ocupacao && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>bed</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Ocupação</h3>
              </div>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {ocupacao.total}/20
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(ocupacao.total / 20) * 100}%` }}
              />
            </div>
            <div className="flex gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-occupancy-male inline-block" />
                Masculino: {ocupacao.masculino}/10
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-occupancy-female inline-block" />
                Feminino: {ocupacao.feminino}/10
              </span>
            </div>
          </Card>
        )}

        {/* Busca + Tabela */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input
                type="search"
                placeholder="Buscar hóspede pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-primary/10">
                  <th className="text-left px-4 py-3 font-semibold">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold">Sexo</th>
                  <th className="text-left px-4 py-3 font-semibold">Entrada</th>
                  <th className="text-left px-4 py-3 font-semibold">Clínica</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-[36px] mb-2 block text-gray-300">search_off</span>
                      Nenhum hóspede encontrado.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((h, i) => (
                    <tr
                      key={h.id}
                      className={`border-t border-gray-100 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{h.nome_completo}</td>
                      <td className="px-4 py-3 text-gray-500">{h.sexo === "M" ? "Masculino" : "Feminino"}</td>
                      <td className="px-4 py-3 text-gray-500">{h.data_entrada}</td>
                      <td className="px-4 py-3 text-gray-500">{h.clinica_origem ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={h.status === "ativo" ? "success" : "neutral"}>
                          {h.status === "ativo" ? "Ativo" : "Alta"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openProntuario(h)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Prontuário"
                          >
                            <span className="material-symbols-outlined text-[18px]">medical_information</span>
                          </button>
                          <button
                            onClick={() => openEdit(h)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {h.status === "ativo" && (
                            <button
                              onClick={() => setHospedeAlta(h)}
                              className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                              title="Dar alta"
                            >
                              <span className="material-symbols-outlined text-[18px]">logout</span>
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

      {/* ── Modal: Novo Hóspede ─────────────────────────────────────────── */}
      {showCriar && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Novo Hóspede</h3>
                  <p className="text-xs text-white/60 mt-0.5">Preencha os dados do novo hóspede</p>
                </div>
                <button onClick={() => setShowCriar(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleCriar} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={LABEL}>Nome completo *</label>
                    <input type="text" required placeholder="Nome completo" value={novoForm.nome_completo}
                      onChange={(e) => setNovoForm({ ...novoForm, nome_completo: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Sexo *</label>
                    <select required value={novoForm.sexo}
                      onChange={(e) => setNovoForm({ ...novoForm, sexo: e.target.value as "M" | "F" })}
                      className={INPUT}>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Data de entrada *</label>
                    <input type="date" required value={novoForm.data_entrada}
                      onChange={(e) => setNovoForm({ ...novoForm, data_entrada: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Data de nascimento</label>
                    <input type="date" value={novoForm.data_nascimento}
                      onChange={(e) => setNovoForm({ ...novoForm, data_nascimento: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>CPF</label>
                    <input type="text" placeholder="000.000.000-00" value={novoForm.cpf}
                      onChange={(e) => setNovoForm({ ...novoForm, cpf: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Clínica de origem</label>
                    <input type="text" placeholder="Nome da clínica" value={novoForm.clinica_origem}
                      onChange={(e) => setNovoForm({ ...novoForm, clinica_origem: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Contato de emergência</label>
                    <input type="text" placeholder="Nome" value={novoForm.contato_emergencia_nome}
                      onChange={(e) => setNovoForm({ ...novoForm, contato_emergencia_nome: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Telefone de emergência</label>
                    <input type="tel" placeholder="(00) 00000-0000" value={novoForm.contato_emergencia_telefone}
                      onChange={(e) => setNovoForm({ ...novoForm, contato_emergencia_telefone: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Medicações</label>
                    <textarea rows={2} placeholder="Medicações em uso" value={novoForm.medicacoes}
                      onChange={(e) => setNovoForm({ ...novoForm, medicacoes: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Alergias</label>
                    <textarea rows={2} placeholder="Alergias conhecidas" value={novoForm.alergias}
                      onChange={(e) => setNovoForm({ ...novoForm, alergias: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Histórico clínico</label>
                    <textarea rows={3} placeholder="Histórico clínico relevante" value={novoForm.historico_clinico}
                      onChange={(e) => setNovoForm({ ...novoForm, historico_clinico: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  {erroCriar && (
                    <p className="col-span-2 text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroCriar}</p>
                  )}
                  <div className="col-span-2 flex gap-3 justify-end pt-2 border-t border-gray-100">
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

      {/* ── Modal: Editar Hóspede ───────────────────────────────────────── */}
      {hospedeEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Editar Hóspede</h3>
                  <p className="text-xs text-white/60 mt-0.5">{hospedeEdit.nome_completo}</p>
                </div>
                <button onClick={() => setHospedeEdit(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleEdit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={LABEL}>Nome completo *</label>
                    <input type="text" required value={editForm.nome_completo}
                      onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Clínica de origem</label>
                    <input type="text" value={editForm.clinica_origem}
                      onChange={(e) => setEditForm({ ...editForm, clinica_origem: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Contato de emergência</label>
                    <input type="text" value={editForm.contato_emergencia_nome}
                      onChange={(e) => setEditForm({ ...editForm, contato_emergencia_nome: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Telefone de emergência</label>
                    <input type="tel" value={editForm.contato_emergencia_telefone}
                      onChange={(e) => setEditForm({ ...editForm, contato_emergencia_telefone: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Medicações</label>
                    <textarea rows={2} value={editForm.medicacoes}
                      onChange={(e) => setEditForm({ ...editForm, medicacoes: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Alergias</label>
                    <textarea rows={2} value={editForm.alergias}
                      onChange={(e) => setEditForm({ ...editForm, alergias: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Histórico clínico</label>
                    <textarea rows={3} value={editForm.historico_clinico}
                      onChange={(e) => setEditForm({ ...editForm, historico_clinico: e.target.value })}
                      className={INPUT + " resize-none"} />
                  </div>
                  {erroEdit && (
                    <p className="col-span-2 text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroEdit}</p>
                  )}
                  <div className="col-span-2 flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setHospedeEdit(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
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

      {/* ── Modal: Confirmar Alta ───────────────────────────────────────── */}
      {hospedeAlta && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-error px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-[24px]">logout</span>
                <h3 className="text-base font-semibold text-white">Confirmar Alta</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-1">Você está prestes a dar alta para:</p>
              <p className="font-semibold text-gray-800 mb-4">{hospedeAlta.nome_completo}</p>
              <p className="text-sm text-gray-500 mb-6">
                O hóspede será marcado como <strong>Alta</strong> com a data de hoje. O prontuário será preservado.
              </p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setHospedeAlta(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={handleAlta} disabled={loadingAlta} className="px-5 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors">
                  {loadingAlta ? "Processando..." : "Confirmar Alta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Prontuário ───────────────────────────────────────────── */}
      {hospedeProntuario && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Prontuário</h3>
                  <p className="text-xs text-white/60 mt-0.5">{hospedeProntuario.nome_completo}</p>
                </div>
                <button onClick={() => setHospedeProntuario(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                {/* Informações clínicas */}
                <div className="flex flex-col gap-3 text-sm mb-6">
                  {hospedeProntuario.medicacoes && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Medicações</p>
                      <p className="text-gray-700">{hospedeProntuario.medicacoes}</p>
                    </div>
                  )}
                  {hospedeProntuario.alergias && (
                    <div className="bg-error-container border border-error/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-error uppercase tracking-wide mb-1.5">Alergias</p>
                      <p className="text-gray-700">{hospedeProntuario.alergias}</p>
                    </div>
                  )}
                  {hospedeProntuario.historico_clinico && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Histórico clínico</p>
                      <p className="text-gray-700">{hospedeProntuario.historico_clinico}</p>
                    </div>
                  )}
                  {!hospedeProntuario.medicacoes && !hospedeProntuario.alergias && !hospedeProntuario.historico_clinico && (
                    <p className="text-gray-400 text-sm">Nenhuma informação clínica registrada.</p>
                  )}
                </div>

                {/* Evoluções */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Evoluções</h4>
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {hospedeProntuario.evolucoes.length === 0 ? (
                      <p className="text-sm text-gray-400">Nenhuma evolução registrada.</p>
                    ) : (
                      [...hospedeProntuario.evolucoes].reverse().map((ev) => (
                        <div key={ev.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-gray-800">{ev.autor_nome}</span>
                            <span className="text-xs text-gray-400">{ev.data}</span>
                          </div>
                          <p className="text-gray-600 whitespace-pre-wrap">{ev.anotacao}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Nova evolução */}
                <form onSubmit={handleAddEvolucao} className="flex flex-col gap-3 border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-semibold text-gray-700">Nova evolução</h4>
                  <div>
                    <label className={LABEL}>Autor</label>
                    <input type="text" required placeholder="Nome do profissional" value={evolAutor}
                      onChange={(e) => setEvolAutor(e.target.value)}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Anotação clínica</label>
                    <textarea required rows={3} placeholder="Descreva a evolução do paciente..." value={evolAnotacao}
                      onChange={(e) => setEvolAnotacao(e.target.value)}
                      className={INPUT + " resize-none"} />
                  </div>
                  {erroEvol && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroEvol}</p>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" disabled={loadingEvol} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingEvol ? "Registrando..." : "Registrar Evolução"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
