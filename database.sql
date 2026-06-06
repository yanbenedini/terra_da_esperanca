-- Criação do banco de dados (opcional)
-- CREATE DATABASE terra_da_esperanca;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'voluntario' NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL
);

-- Tabela de Hóspedes
CREATE TABLE hospedes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    data_nascimento DATE,
    cpf VARCHAR(14) UNIQUE,
    clinica_origem VARCHAR(255),
    contato_emergencia_nome VARCHAR(255),
    contato_emergencia_telefone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ativo' NOT NULL,
    data_entrada DATE NOT NULL,
    data_alta DATE,
    medicacoes TEXT,
    alergias TEXT,
    historico_clinico TEXT
);

-- Tabela de Evoluções (Prontuário)
CREATE TABLE evolucoes (
    id SERIAL PRIMARY KEY,
    hospede_id INTEGER NOT NULL REFERENCES hospedes(id) ON DELETE CASCADE,
    autor_nome VARCHAR(255) NOT NULL,
    anotacao TEXT NOT NULL,
    data DATE NOT NULL
);

-- Tabela de Voluntários
CREATE TABLE voluntarios (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(50),
    especialidade VARCHAR(255) NOT NULL,
    disponibilidade TEXT,
    status VARCHAR(50) DEFAULT 'ativo' NOT NULL
);

-- Tabela de Doações
CREATE TABLE doacoes (
    id SERIAL PRIMARY KEY,
    doador_nome VARCHAR(255), -- NULL para anônimo (RN05)
    tipo VARCHAR(50) NOT NULL, -- 'financeira' | 'item'
    valor DECIMAL(10, 2), -- Apenas para financeira
    descricao TEXT, -- Apenas para itens
    forma_pagamento VARCHAR(50), -- 'pix' | 'dinheiro' | 'transferencia'
    data DATE NOT NULL,
    finalidade VARCHAR(255)
);

-- Tabela de Despesas
CREATE TABLE despesas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- 'luz' | 'agua' | 'manutencao' | etc.
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    status VARCHAR(50) DEFAULT 'pendente' NOT NULL
);

-- Inserção do Usuário Super Administrador Inicial para Entrega (Senha: Admin@2025)
-- O hash abaixo é um exemplo de hash bcrypt correspondente à senha Admin@2025
INSERT INTO usuarios (nome, email, senha_hash, perfil, is_super_admin, ativo)
VALUES (
    'Super Administrador', 
    'admin@terradaesperanca.org', 
    '$2b$12$R.S4wNqjW.27zP/O7f8UKeNq1RzHq7n6r9xM32k1iHhPZ/jQ9g8eG', 
    'super_admin', 
    TRUE, 
    TRUE
);
