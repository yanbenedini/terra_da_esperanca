export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  is_super_admin: boolean;
  ativo: boolean;
}

export interface Ocupacao {
  total: number;
  masculino: number;
  feminino: number;
  vagas_masculino: number;
  vagas_feminino: number;
}

export interface Hospede {
  id: number;
  nome_completo: string;
  sexo: "M" | "F";
  data_nascimento?: string;
  cpf?: string;
  clinica_origem?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  status: "ativo" | "alta";
  data_entrada: string;
  data_alta?: string;
  medicacoes?: string;
  alergias?: string;
  historico_clinico?: string;
  evolucoes: Evolucao[];
}

export interface Evolucao {
  id: number;
  autor_nome: string;
  anotacao: string;
  data: string;
}

export interface Voluntario {
  id: number;
  nome_completo: string;
  email?: string;
  telefone?: string;
  especialidade: string;
  disponibilidade?: string;
  status: "ativo" | "inativo";
}

export interface Doacao {
  id: number;
  doador_nome?: string;
  tipo: "financeira" | "item";
  valor?: number;
  descricao?: string;
  forma_pagamento?: string;
  data: string;
  finalidade?: string;
}

export interface Despesa {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento?: string;
  data_pagamento?: string;
  status: "pendente" | "paga";
}

export interface ResumoFinanceiro {
  total_doacoes: number;
  total_despesas: number;
  saldo: number;
}
