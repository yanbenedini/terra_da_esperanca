"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import type { Doacao, Despesa, ResumoFinanceiro } from "@/types";

const INPUT =
  "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-400";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

const FORMAS_PAGAMENTO = ["PIX", "Dinheiro", "Transferência Bancária", "Cartão", "Cheque", "Outra"];
const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Saúde / Medicamentos",
  "Limpeza / Higiene",
  "Manutenção",
  "Água",
  "Energia Elétrica",
  "Internet / Telefone",
  "Ajuda de Custo",
  "Outros",
];

const today = () => new Date().toISOString().split("T")[0];

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── tipos de formulário ──────────────────────────────────────────────────

type DoacaoForm = {
  doador_nome: string;
  tipo: "financeira" | "item";
  valor: string;
  descricao: string;
  forma_pagamento: string;
  data: string;
  finalidade: string;
};

const EMPTY_DOACAO: DoacaoForm = {
  doador_nome: "",
  tipo: "financeira",
  valor: "",
  descricao: "",
  forma_pagamento: "PIX",
  data: today(),
  finalidade: "",
};

type DespesaForm = {
  descricao: string;
  categoria: string;
  valor: string;
  data_vencimento: string;
  data_pagamento: string;
  status: "pendente" | "paga";
};

const EMPTY_DESPESA: DespesaForm = {
  descricao: "",
  categoria: "Alimentação",
  valor: "",
  data_vencimento: "",
  data_pagamento: "",
  status: "pendente",
};

// ─── componente principal ─────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  // modais doação
  const [showCriarDoacao, setShowCriarDoacao] = useState(false);
  const [doacaoForm, setDoacaoForm] = useState<DoacaoForm>(EMPTY_DOACAO);
  const [erroCriarDoacao, setErroCriarDoacao] = useState("");
  const [loadingCriarDoacao, setLoadingCriarDoacao] = useState(false);

  const [doacaoEdit, setDoacaoEdit] = useState<Doacao | null>(null);
  const [editDoacaoForm, setEditDoacaoForm] = useState<DoacaoForm>(EMPTY_DOACAO);
  const [erroEditDoacao, setErroEditDoacao] = useState("");
  const [loadingEditDoacao, setLoadingEditDoacao] = useState(false);

  const [doacaoExcluir, setDoacaoExcluir] = useState<Doacao | null>(null);
  const [loadingExcluirDoacao, setLoadingExcluirDoacao] = useState(false);

  // modais despesa
  const [showCriarDespesa, setShowCriarDespesa] = useState(false);
  const [despesaForm, setDespesaForm] = useState<DespesaForm>(EMPTY_DESPESA);
  const [erroCriarDespesa, setErroCriarDespesa] = useState("");
  const [loadingCriarDespesa, setLoadingCriarDespesa] = useState(false);

  const [despesaEdit, setDespesaEdit] = useState<Despesa | null>(null);
  const [editDespesaForm, setEditDespesaForm] = useState<DespesaForm>(EMPTY_DESPESA);
  const [erroEditDespesa, setErroEditDespesa] = useState("");
  const [loadingEditDespesa, setLoadingEditDespesa] = useState(false);

  const [despesaExcluir, setDespesaExcluir] = useState<Despesa | null>(null);
  const [loadingExcluirDespesa, setLoadingExcluirDespesa] = useState(false);

  function load() {
    api.get<ResumoFinanceiro>("/financeiro/resumo").then((r) => setResumo(r.data)).catch(() => {});
    api.get<Doacao[]>("/financeiro/doacoes").then((r) => setDoacoes(r.data)).catch(() => {});
    api.get<Despesa[]>("/financeiro/despesas").then((r) => setDespesas(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  const despesasPendentes = despesas.filter((d) => d.status === "pendente");
  const totalPendente = despesasPendentes.reduce((s, d) => s + Number(d.valor), 0);

  // ─── Criar doação ────────────────────────────────────────────────────
  function openCriarDoacao() {
    setDoacaoForm({ ...EMPTY_DOACAO, data: today() });
    setErroCriarDoacao("");
    setShowCriarDoacao(true);
  }

  async function handleCriarDoacao(e: React.FormEvent) {
    e.preventDefault();
    setErroCriarDoacao("");
    setLoadingCriarDoacao(true);
    try {
      await api.post("/financeiro/doacoes", {
        doador_nome: doacaoForm.doador_nome || null,
        tipo: doacaoForm.tipo,
        valor: doacaoForm.tipo === "financeira" && doacaoForm.valor ? Number(doacaoForm.valor) : null,
        descricao: doacaoForm.descricao || null,
        forma_pagamento: doacaoForm.tipo === "financeira" ? doacaoForm.forma_pagamento || null : null,
        data: doacaoForm.data,
        finalidade: doacaoForm.finalidade || null,
      });
      setShowCriarDoacao(false);
      load();
    } catch (err: any) {
      setErroCriarDoacao(err?.response?.data?.detail ?? "Erro ao registrar doação.");
    } finally {
      setLoadingCriarDoacao(false);
    }
  }

  // ─── Editar doação ───────────────────────────────────────────────────
  function openEditDoacao(d: Doacao) {
    setDoacaoEdit(d);
    setEditDoacaoForm({
      doador_nome: d.doador_nome ?? "",
      tipo: d.tipo as "financeira" | "item",
      valor: d.valor ? String(d.valor) : "",
      descricao: d.descricao ?? "",
      forma_pagamento: d.forma_pagamento ?? "PIX",
      data: d.data,
      finalidade: d.finalidade ?? "",
    });
    setErroEditDoacao("");
  }

  async function handleEditDoacao(e: React.FormEvent) {
    e.preventDefault();
    if (!doacaoEdit) return;
    setErroEditDoacao("");
    setLoadingEditDoacao(true);
    try {
      await api.patch(`/financeiro/doacoes/${doacaoEdit.id}`, {
        doador_nome: editDoacaoForm.doador_nome || null,
        tipo: editDoacaoForm.tipo,
        valor: editDoacaoForm.tipo === "financeira" && editDoacaoForm.valor ? Number(editDoacaoForm.valor) : null,
        descricao: editDoacaoForm.descricao || null,
        forma_pagamento: editDoacaoForm.tipo === "financeira" ? editDoacaoForm.forma_pagamento || null : null,
        data: editDoacaoForm.data,
        finalidade: editDoacaoForm.finalidade || null,
      });
      setDoacaoEdit(null);
      load();
    } catch (err: any) {
      setErroEditDoacao(err?.response?.data?.detail ?? "Erro ao salvar alterações.");
    } finally {
      setLoadingEditDoacao(false);
    }
  }

  // ─── Excluir doação ──────────────────────────────────────────────────
  async function handleExcluirDoacao() {
    if (!doacaoExcluir) return;
    setLoadingExcluirDoacao(true);
    try {
      await api.delete(`/financeiro/doacoes/${doacaoExcluir.id}`);
      setDoacaoExcluir(null);
      load();
    } catch {
      // silencioso
    } finally {
      setLoadingExcluirDoacao(false);
    }
  }

  // ─── Criar despesa ───────────────────────────────────────────────────
  function openCriarDespesa() {
    setDespesaForm(EMPTY_DESPESA);
    setErroCriarDespesa("");
    setShowCriarDespesa(true);
  }

  async function handleCriarDespesa(e: React.FormEvent) {
    e.preventDefault();
    setErroCriarDespesa("");
    setLoadingCriarDespesa(true);
    try {
      await api.post("/financeiro/despesas", {
        descricao: despesaForm.descricao,
        categoria: despesaForm.categoria,
        valor: Number(despesaForm.valor),
        data_vencimento: despesaForm.data_vencimento || null,
        data_pagamento: despesaForm.status === "paga" ? despesaForm.data_pagamento || null : null,
        status: despesaForm.status,
      });
      setShowCriarDespesa(false);
      load();
    } catch (err: any) {
      setErroCriarDespesa(err?.response?.data?.detail ?? "Erro ao lançar despesa.");
    } finally {
      setLoadingCriarDespesa(false);
    }
  }

  // ─── Editar despesa ──────────────────────────────────────────────────
  function openEditDespesa(d: Despesa) {
    setDespesaEdit(d);
    setEditDespesaForm({
      descricao: d.descricao,
      categoria: d.categoria,
      valor: String(d.valor),
      data_vencimento: d.data_vencimento ?? "",
      data_pagamento: d.data_pagamento ?? "",
      status: d.status as "pendente" | "paga",
    });
    setErroEditDespesa("");
  }

  async function handleEditDespesa(e: React.FormEvent) {
    e.preventDefault();
    if (!despesaEdit) return;
    setErroEditDespesa("");
    setLoadingEditDespesa(true);
    try {
      await api.patch(`/financeiro/despesas/${despesaEdit.id}`, {
        descricao: editDespesaForm.descricao,
        categoria: editDespesaForm.categoria,
        valor: Number(editDespesaForm.valor),
        data_vencimento: editDespesaForm.data_vencimento || null,
        data_pagamento: editDespesaForm.status === "paga" ? editDespesaForm.data_pagamento || null : null,
        status: editDespesaForm.status,
      });
      setDespesaEdit(null);
      load();
    } catch (err: any) {
      setErroEditDespesa(err?.response?.data?.detail ?? "Erro ao salvar alterações.");
    } finally {
      setLoadingEditDespesa(false);
    }
  }

  // ─── Marcar despesa como paga (ação rápida) ──────────────────────────
  async function marcarPaga(d: Despesa) {
    await api.patch(`/financeiro/despesas/${d.id}`, {
      status: "paga",
      data_pagamento: today(),
    }).catch(() => {});
    load();
  }

  // ─── Excluir despesa ─────────────────────────────────────────────────
  async function handleExcluirDespesa() {
    if (!despesaExcluir) return;
    setLoadingExcluirDespesa(true);
    try {
      await api.delete(`/financeiro/despesas/${despesaExcluir.id}`);
      setDespesaExcluir(null);
      load();
    } catch {
      // silencioso
    } finally {
      setLoadingExcluirDespesa(false);
    }
  }

  return (
    <>
      <Header title="Financeiro" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Financeiro e Doações</h2>
            <p className="text-sm text-gray-500 mt-0.5">Controle de entradas e saídas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCriarDoacao}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
              Registrar Doação
            </button>
            <button
              onClick={openCriarDespesa}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Lançar Despesa
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>arrow_downward</span>
              </div>
              <span className="text-xs text-gray-500">Doações recebidas</span>
            </div>
            <p className="text-xl font-bold text-primary">{resumo ? formatBRL(Number(resumo.total_doacoes)) : "–"}</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>arrow_upward</span>
              </div>
              <span className="text-xs text-gray-500">Despesas pagas</span>
            </div>
            <p className="text-xl font-bold text-gray-700">{resumo ? formatBRL(Number(resumo.total_despesas)) : "–"}</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-sage-deep text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance</span>
              </div>
              <span className="text-xs text-gray-500">Saldo atual</span>
            </div>
            <p className={`text-xl font-bold ${resumo && Number(resumo.saldo) >= 0 ? "text-primary" : "text-error"}`}>
              {resumo ? formatBRL(Number(resumo.saldo)) : "–"}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>pending</span>
              </div>
              <span className="text-xs text-gray-500">A vencer</span>
            </div>
            <p className="text-xl font-bold text-yellow-700">{formatBRL(totalPendente)}</p>
          </Card>
        </div>

        {/* ── Doações ────────────────────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>volunteer_activism</span>
            <h3 className="font-semibold text-gray-800 flex-1">Doações</h3>
            <span className="text-xs text-gray-400">{doacoes.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-primary/10">
                  <th className="text-left px-4 py-3 font-semibold">Doador</th>
                  <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold">Valor / Descrição</th>
                  <th className="text-left px-4 py-3 font-semibold">Forma</th>
                  <th className="text-left px-4 py-3 font-semibold">Data</th>
                  <th className="text-left px-4 py-3 font-semibold">Finalidade</th>
                  <th className="text-left px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {doacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-[36px] mb-2 block text-gray-300">volunteer_activism</span>
                      Nenhuma doação registrada.
                    </td>
                  </tr>
                ) : (
                  doacoes.map((d, i) => (
                    <tr key={d.id} className={`border-t border-gray-100 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{d.doador_nome ?? <span className="italic text-gray-400">Anônimo</span>}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.tipo === "financeira" ? "success" : "info"}>
                          {d.tipo === "financeira" ? "Financeira" : "Item"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {d.tipo === "financeira" && d.valor ? formatBRL(Number(d.valor)) : d.descricao ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{d.forma_pagamento ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{d.data}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{d.finalidade ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditDoacao(d)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setDoacaoExcluir(d)} className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Excluir">
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

        {/* ── Despesas ───────────────────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>receipt_long</span>
            <h3 className="font-semibold text-gray-800 flex-1">Despesas</h3>
            <span className="text-xs text-gray-400">{despesas.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-primary/10">
                  <th className="text-left px-4 py-3 font-semibold">Descrição</th>
                  <th className="text-left px-4 py-3 font-semibold">Categoria</th>
                  <th className="text-left px-4 py-3 font-semibold">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold">Vencimento</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <span className="material-symbols-outlined text-[36px] mb-2 block text-gray-300">receipt_long</span>
                      Nenhuma despesa registrada.
                    </td>
                  </tr>
                ) : (
                  despesas.map((d, i) => (
                    <tr key={d.id} className={`border-t border-gray-100 hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{d.descricao}</td>
                      <td className="px-4 py-3 text-gray-500">{d.categoria}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatBRL(Number(d.valor))}</td>
                      <td className="px-4 py-3 text-gray-500">{d.data_vencimento ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.status === "paga" ? "success" : "warning"}>
                          {d.status === "paga" ? "Paga" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {d.status === "pendente" && (
                            <button onClick={() => marcarPaga(d)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Marcar como paga">
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
                          <button onClick={() => openEditDespesa(d)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setDespesaExcluir(d)} className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Excluir">
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

      {/* ═══════════════════════════════════════════════════════════════════
          MODAIS DE DOAÇÃO
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Modal: Registrar Doação */}
      {showCriarDoacao && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Registrar Doação</h3>
                  <p className="text-xs text-white/60 mt-0.5">Doador não informado será registrado como anônimo</p>
                </div>
                <button onClick={() => setShowCriarDoacao(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleCriarDoacao} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Tipo de doação *</label>
                      <select required value={doacaoForm.tipo}
                        onChange={(e) => setDoacaoForm({ ...doacaoForm, tipo: e.target.value as "financeira" | "item" })}
                        className={INPUT}>
                        <option value="financeira">Financeira</option>
                        <option value="item">Item / Produto</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Data *</label>
                      <input type="date" required value={doacaoForm.data}
                        onChange={(e) => setDoacaoForm({ ...doacaoForm, data: e.target.value })}
                        className={INPUT} />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Nome do doador (deixe vazio para anônimo)</label>
                    <input type="text" placeholder="Nome do doador"
                      value={doacaoForm.doador_nome}
                      onChange={(e) => setDoacaoForm({ ...doacaoForm, doador_nome: e.target.value })}
                      className={INPUT} />
                  </div>

                  {doacaoForm.tipo === "financeira" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>Valor (R$) *</label>
                        <input type="number" required min="0.01" step="0.01" placeholder="0,00"
                          value={doacaoForm.valor}
                          onChange={(e) => setDoacaoForm({ ...doacaoForm, valor: e.target.value })}
                          className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Forma de pagamento</label>
                        <select value={doacaoForm.forma_pagamento}
                          onChange={(e) => setDoacaoForm({ ...doacaoForm, forma_pagamento: e.target.value })}
                          className={INPUT}>
                          {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={LABEL}>Descrição dos itens doados *</label>
                      <textarea required rows={2} placeholder="Ex: 20 kg de arroz, 10 latas de óleo..."
                        value={doacaoForm.descricao}
                        onChange={(e) => setDoacaoForm({ ...doacaoForm, descricao: e.target.value })}
                        className={INPUT + " resize-none"} />
                    </div>
                  )}

                  <div>
                    <label className={LABEL}>Finalidade / observação</label>
                    <input type="text" placeholder="Ex: Compra de medicamentos"
                      value={doacaoForm.finalidade}
                      onChange={(e) => setDoacaoForm({ ...doacaoForm, finalidade: e.target.value })}
                      className={INPUT} />
                  </div>

                  {erroCriarDoacao && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroCriarDoacao}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setShowCriarDoacao(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loadingCriarDoacao} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingCriarDoacao ? "Registrando..." : "Registrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Doação */}
      {doacaoEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Editar Doação</h3>
                <button onClick={() => setDoacaoEdit(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleEditDoacao} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Tipo de doação *</label>
                      <select required value={editDoacaoForm.tipo}
                        onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, tipo: e.target.value as "financeira" | "item" })}
                        className={INPUT}>
                        <option value="financeira">Financeira</option>
                        <option value="item">Item / Produto</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Data *</label>
                      <input type="date" required value={editDoacaoForm.data}
                        onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, data: e.target.value })}
                        className={INPUT} />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Nome do doador</label>
                    <input type="text" placeholder="Nome do doador"
                      value={editDoacaoForm.doador_nome}
                      onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, doador_nome: e.target.value })}
                      className={INPUT} />
                  </div>

                  {editDoacaoForm.tipo === "financeira" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>Valor (R$) *</label>
                        <input type="number" required min="0.01" step="0.01"
                          value={editDoacaoForm.valor}
                          onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, valor: e.target.value })}
                          className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Forma de pagamento</label>
                        <select value={editDoacaoForm.forma_pagamento}
                          onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, forma_pagamento: e.target.value })}
                          className={INPUT}>
                          {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={LABEL}>Descrição dos itens *</label>
                      <textarea required rows={2}
                        value={editDoacaoForm.descricao}
                        onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, descricao: e.target.value })}
                        className={INPUT + " resize-none"} />
                    </div>
                  )}

                  <div>
                    <label className={LABEL}>Finalidade / observação</label>
                    <input type="text"
                      value={editDoacaoForm.finalidade}
                      onChange={(e) => setEditDoacaoForm({ ...editDoacaoForm, finalidade: e.target.value })}
                      className={INPUT} />
                  </div>

                  {erroEditDoacao && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroEditDoacao}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setDoacaoEdit(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loadingEditDoacao} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingEditDoacao ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excluir Doação */}
      {doacaoExcluir && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-error px-6 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-[24px]">delete</span>
              <h3 className="text-base font-semibold text-white">Excluir Doação</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">Você está prestes a excluir o registro de doação de:</p>
              <p className="font-semibold text-gray-800 mb-1">{doacaoExcluir.doador_nome ?? "Anônimo"}</p>
              <p className="text-sm text-gray-500 mb-5">
                {doacaoExcluir.tipo === "financeira" && doacaoExcluir.valor
                  ? formatBRL(Number(doacaoExcluir.valor))
                  : doacaoExcluir.descricao}
                {" "} · {doacaoExcluir.data}
              </p>
              <p className="text-sm text-gray-400 mb-6">Esta ação é <strong>permanente</strong> e afetará o saldo financeiro.</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setDoacaoExcluir(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={handleExcluirDoacao} disabled={loadingExcluirDoacao} className="px-5 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors">
                  {loadingExcluirDoacao ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAIS DE DESPESA
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Modal: Lançar Despesa */}
      {showCriarDespesa && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Lançar Despesa</h3>
                  <p className="text-xs text-white/60 mt-0.5">Registre uma conta a pagar ou já paga</p>
                </div>
                <button onClick={() => setShowCriarDespesa(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleCriarDespesa} className="flex flex-col gap-4">
                  <div>
                    <label className={LABEL}>Descrição *</label>
                    <input type="text" required placeholder="Ex: Conta de água — Junho"
                      value={despesaForm.descricao}
                      onChange={(e) => setDespesaForm({ ...despesaForm, descricao: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Categoria *</label>
                      <select required value={despesaForm.categoria}
                        onChange={(e) => setDespesaForm({ ...despesaForm, categoria: e.target.value })}
                        className={INPUT}>
                        {CATEGORIAS_DESPESA.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Valor (R$) *</label>
                      <input type="number" required min="0.01" step="0.01" placeholder="0,00"
                        value={despesaForm.valor}
                        onChange={(e) => setDespesaForm({ ...despesaForm, valor: e.target.value })}
                        className={INPUT} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Data de vencimento</label>
                      <input type="date" value={despesaForm.data_vencimento}
                        onChange={(e) => setDespesaForm({ ...despesaForm, data_vencimento: e.target.value })}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Status</label>
                      <select value={despesaForm.status}
                        onChange={(e) => setDespesaForm({ ...despesaForm, status: e.target.value as "pendente" | "paga" })}
                        className={INPUT}>
                        <option value="pendente">Pendente</option>
                        <option value="paga">Já paga</option>
                      </select>
                    </div>
                  </div>
                  {despesaForm.status === "paga" && (
                    <div>
                      <label className={LABEL}>Data de pagamento</label>
                      <input type="date" value={despesaForm.data_pagamento}
                        onChange={(e) => setDespesaForm({ ...despesaForm, data_pagamento: e.target.value })}
                        className={INPUT} />
                    </div>
                  )}
                  {erroCriarDespesa && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroCriarDespesa}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setShowCriarDespesa(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loadingCriarDespesa} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingCriarDespesa ? "Lançando..." : "Lançar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Despesa */}
      {despesaEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Editar Despesa</h3>
                <button onClick={() => setDespesaEdit(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleEditDespesa} className="flex flex-col gap-4">
                  <div>
                    <label className={LABEL}>Descrição *</label>
                    <input type="text" required
                      value={editDespesaForm.descricao}
                      onChange={(e) => setEditDespesaForm({ ...editDespesaForm, descricao: e.target.value })}
                      className={INPUT} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Categoria *</label>
                      <select required value={editDespesaForm.categoria}
                        onChange={(e) => setEditDespesaForm({ ...editDespesaForm, categoria: e.target.value })}
                        className={INPUT}>
                        {CATEGORIAS_DESPESA.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Valor (R$) *</label>
                      <input type="number" required min="0.01" step="0.01"
                        value={editDespesaForm.valor}
                        onChange={(e) => setEditDespesaForm({ ...editDespesaForm, valor: e.target.value })}
                        className={INPUT} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Data de vencimento</label>
                      <input type="date" value={editDespesaForm.data_vencimento}
                        onChange={(e) => setEditDespesaForm({ ...editDespesaForm, data_vencimento: e.target.value })}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Status</label>
                      <select value={editDespesaForm.status}
                        onChange={(e) => setEditDespesaForm({ ...editDespesaForm, status: e.target.value as "pendente" | "paga" })}
                        className={INPUT}>
                        <option value="pendente">Pendente</option>
                        <option value="paga">Paga</option>
                      </select>
                    </div>
                  </div>
                  {editDespesaForm.status === "paga" && (
                    <div>
                      <label className={LABEL}>Data de pagamento</label>
                      <input type="date" value={editDespesaForm.data_pagamento}
                        onChange={(e) => setEditDespesaForm({ ...editDespesaForm, data_pagamento: e.target.value })}
                        className={INPUT} />
                    </div>
                  )}
                  {erroEditDespesa && (
                    <p className="text-sm text-error bg-error-container px-3 py-2 rounded-lg">{erroEditDespesa}</p>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setDespesaEdit(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loadingEditDespesa} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container disabled:opacity-60 transition-colors">
                      {loadingEditDespesa ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excluir Despesa */}
      {despesaExcluir && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-error px-6 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-[24px]">delete</span>
              <h3 className="text-base font-semibold text-white">Excluir Despesa</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">Você está prestes a excluir:</p>
              <p className="font-semibold text-gray-800 mb-1">{despesaExcluir.descricao}</p>
              <p className="text-sm text-primary font-semibold mb-5">{formatBRL(Number(despesaExcluir.valor))}</p>
              <p className="text-sm text-gray-400 mb-6">Esta ação é <strong>permanente</strong> e não pode ser desfeita.</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setDespesaExcluir(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={handleExcluirDespesa} disabled={loadingExcluirDespesa} className="px-5 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-colors">
                  {loadingExcluirDespesa ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
