"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import type { Ocupacao, ResumoFinanceiro } from "@/types";

export default function DashboardPage() {
  const [ocupacao, setOcupacao] = useState<Ocupacao | null>(null);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);

  useEffect(() => {
    api.get<Ocupacao>("/hospedes/ocupacao").then((r) => setOcupacao(r.data)).catch(() => {});
    api.get<ResumoFinanceiro>("/financeiro/resumo").then((r) => setResumo(r.data)).catch(() => {});
  }, []);

  const pctMasc = ocupacao ? (ocupacao.masculino / 10) * 100 : 0;
  const pctFem = ocupacao ? (ocupacao.feminino / 10) * 100 : 0;

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral do sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>people</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{ocupacao?.total ?? "–"}</p>
                <p className="text-sm text-gray-500">Hóspedes ativos</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance_wallet</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  {resumo
                    ? `R$ ${Number(resumo.saldo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "–"}
                </p>
                <p className="text-sm text-gray-500">Saldo financeiro</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sage-deep text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>bed</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  {ocupacao ? ocupacao.vagas_masculino + ocupacao.vagas_feminino : "–"}
                </p>
                <p className="text-sm text-gray-500">Vagas disponíveis</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ocupação */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Ocupação Atual</h3>
              <p className="text-xs text-gray-500 mt-0.5">Limite de 10 por ala</p>
            </div>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {ocupacao?.total ?? "–"} / 20
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Masculino */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5 text-occupancy-male font-semibold">
                  <span className="material-symbols-outlined text-[16px]">man</span>
                  Masculino
                </span>
                <span className="text-gray-500 font-medium">{ocupacao?.masculino ?? "–"}/10</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-occupancy-male rounded-full transition-all duration-500"
                  style={{ width: `${pctMasc}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{ocupacao ? 10 - ocupacao.masculino : "–"} vagas livres</p>
            </div>

            {/* Feminino */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5 text-occupancy-female font-semibold">
                  <span className="material-symbols-outlined text-[16px]">woman</span>
                  Feminino
                </span>
                <span className="text-gray-500 font-medium">{ocupacao?.feminino ?? "–"}/10</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-occupancy-female rounded-full transition-all duration-500"
                  style={{ width: `${pctFem}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{ocupacao ? 10 - ocupacao.feminino : "–"} vagas livres</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
