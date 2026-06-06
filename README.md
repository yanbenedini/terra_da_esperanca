# Terra da Esperança — Sistema de Gestão

> Projeto acadêmico — FATEC | Disciplina: Laboratório de Engenharia de Software

---

## 1. Integrantes do Grupo



| Yan Haefeli Benedini Moura  | 2840482413023 |

---

## 2. Objetivo do Sistema

A **Terra da Esperança** é uma casa de acolhimento transitório para pessoas em recuperação pós-reabilitação psiquiátrica ou de dependência química. Após receberem alta de clínicas, esses indivíduos frequentemente enfrentam vulnerabilidade extrema — sem moradia, vínculos familiares ou inserção no mercado de trabalho.

O sistema tem como objetivo eliminar três grandes gargalos operacionais da instituição:

- **Informação dispersa:** prontuários e históricos registrados em papel ou planilhas isoladas
- **Gestão financeira frágil:** controle de doações e despesas sem rastreabilidade
- **Sobrecarga da equipe voluntária:** tempo gasto em burocracia em vez de acolhimento humano

O software não é uma ferramenta administrativa comum — é um **instrumento de dignidade**, permitindo que a equipe foque no que realmente importa: o ser humano.

---

## 3. Módulo Escolhido para o Protótipo

O grupo optou por implementar os **três módulos principais** do sistema como protótipo funcional:

| Módulo | Descrição |
|--------|-----------|
| **Gestão de Hóspedes** | Cadastro, prontuário, diário de evolução e controle de ocupação (20 vagas) |
| **Gestão de Voluntários** | Cadastro com especialidades e disponibilidade |
| **Gestão Financeira** | Registro de doações, lançamento de despesas e resumo do saldo |

Além disso, foram implementados os módulos de **autenticação** (JWT) e **administração de usuários** com controle de perfis de acesso.

---

## 4. Requisitos Atendidos pelo Protótipo

| ID | Descrição | Status |
|----|-----------|--------|
| RF01 | Cadastro de hóspedes (nome, sexo, nascimento, documentos, clínica, contatos de emergência) | ✅ Implementado |
| RF02 | Controle de admissão/alta (status Ativo/Alta, data de entrada e saída) | ✅ Implementado |
| RF03 | Prontuário de saúde (medicações, alergias, histórico clínico) | ✅ Implementado |
| RF04 | Diário de evolução (anotações por profissional com data) | ✅ Implementado |
| RF05 | Cadastro de voluntários (dados pessoais, contato, especialidade) | ✅ Implementado |
| RF06 | Escala de disponibilidade do voluntário | ⚠️ Parcialmente (campo cadastrado, tela dedicada não implementada) |
| RF07 | Registro de doações financeiras (tipo, valor, doador, finalidade) | ✅ Implementado |
| RF08 | Controle de despesas (categoria, valor, vencimento, status) | ✅ Implementado |
| RF09 | Emissão de recibos em PDF | ❌ Planejado |
| RF10 | Inventário de mantimentos (estoque) | ❌ Planejado |
| RF11 | Farmácia interna (medicamentos com validade) | ❌ Planejado |
| RF12 | Canal de denúncias | ❌ Planejado |
| RF13 | Dashboard de ocupação (vagas 10M/10F) | ✅ Implementado |
| RN01 | Limite de 10 hóspedes por sexo (validado no backend) | ✅ Implementado |
| RN02 | Capacidade total de 20 hóspedes | ✅ Implementado |

---

## 5. Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Papel |
|------------|--------|-------|
| Next.js | 15 | Framework React com roteamento e SSR |
| React | 19 | Biblioteca de interface |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 4 | Estilização utilitária |
| Axios | — | Cliente HTTP para chamadas à API |

### Backend
| Tecnologia | Versão | Papel |
|------------|--------|-------|
| Python | 3.14 | Linguagem principal |
| FastAPI | — | Framework web assíncrono |
| SQLAlchemy | — | ORM para mapeamento relacional |
| Pydantic | 2 | Validação de dados e schemas |
| JWT (PyJWT) | — | Autenticação por token |
| Uvicorn | — | Servidor ASGI |

### Banco de Dados e Infraestrutura
| Tecnologia | Papel |
|------------|-------|
| PostgreSQL 16 | Banco de dados relacional |
| Docker | Containerização do banco de dados |
| Docker Compose | Orquestração do container do PostgreSQL |

---

## 6. Estrutura do Projeto

```
terra_da_esperanca_app/
│
├── database.sql                # Script SQL de criação de tabelas e seed
├── docker-compose.yml          # Container do PostgreSQL
├── package.json                # Script dev unificado (DB + API + WEB)
├── .gitignore
├── README.md
│
├── client/                     # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/page.tsx        # Tela de login
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx            # Layout com sidebar
│   │   │   │   ├── dashboard/page.tsx    # Dashboard de ocupação
│   │   │   │   ├── hospedes/page.tsx     # CRUD de hóspedes
│   │   │   │   ├── voluntarios/page.tsx  # Listagem de voluntários
│   │   │   │   ├── financeiro/page.tsx   # Doações e despesas
│   │   │   │   └── usuarios/page.tsx     # Administração de usuários
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx           # Navegação lateral (desktop)
│   │   │   │   ├── Header.tsx            # Cabeçalho mobile
│   │   │   │   └── BottomNav.tsx         # Navegação inferior mobile
│   │   │   └── ui/
│   │   │       ├── Card.tsx              # Componente de card reutilizável
│   │   │       └── Badge.tsx             # Badge de status
│   │   ├── lib/
│   │   │   └── api.ts                    # Instância Axios com interceptor JWT
│   │   └── types/
│   │       └── index.ts                  # Interfaces TypeScript (Hospede, Voluntario…)
│   ├── tailwind.config.ts
│   └── next.config.ts
│
└── server/                     # Backend FastAPI
    ├── app/
    │   ├── main.py             # Entrypoint + registro dos roteadores
    │   ├── core/
    │   │   ├── config.py       # Variáveis de ambiente
    │   │   ├── database.py     # Sessão SQLAlchemy
    │   │   ├── security.py     # Hash de senha e geração de JWT
    │   │   └── deps.py         # Dependências (get_db, get_current_user)
    │   ├── models/             # Modelos ORM (tabelas do banco)
    │   │   ├── hospede.py      # Hospede, Evolucao
    │   │   ├── voluntario.py   # Voluntario
    │   │   ├── financeiro.py   # Doacao, Despesa
    │   │   └── usuario.py      # Usuario
    │   ├── schemas/            # Schemas Pydantic (request/response)
    │   │   ├── hospede.py
    │   │   ├── voluntario.py
    │   │   ├── financeiro.py
    │   │   └── usuario.py
    │   └── api/
    │       └── v1/             # Endpoints REST
    │           ├── auth.py     # POST /auth/login
    │           ├── hospedes.py # CRUD + ocupacao + evolucoes
    │           ├── voluntarios.py
    │           ├── financeiro.py
    │           └── usuarios.py
    └── venv/                   # Ambiente virtual Python (não versionado)
```

---

## 7. Como Executar o Projeto

### Pré-requisitos
- Node.js 20+
- Python 3.12+
- Docker e Docker Compose

### Instalação (primeira vez)

```bash
# 1. Instalar dependências do script raiz
npm install

# 2. Instalar dependências do frontend
cd client && npm install && cd ..

# 3. Criar e ativar ambiente virtual Python
cd server
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cd ..
```

### Execução

```bash
# Inicia o banco de dados (Docker), o backend (FastAPI) e o frontend (Next.js)
npm run dev
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Docs da API | http://localhost:8000/docs |

---

## 8. Matriz de Rastreabilidade

| Requisito | Funcionalidade | Tela / Módulo | Arquivo (backend) | Arquivo (frontend) |
|-----------|----------------|---------------|-------------------|--------------------|
| RF01 | Cadastro de hóspedes | Hóspedes — Modal "Novo Hóspede" | `models/hospede.py`, `api/v1/hospedes.py` | `hospedes/page.tsx` |
| RF02 | Controle de admissão/alta | Hóspedes — Botão "Alta" | `schemas/hospede.py` (HospedeUpdate) | `hospedes/page.tsx` |
| RF03 | Prontuário de saúde | Hóspedes — Modal "Prontuário" | `models/hospede.py` | `hospedes/page.tsx` |
| RF04 | Diário de evolução | Hóspedes — Modal "Prontuário" (evolucoes) | `models/hospede.py` (Evolucao), `api/v1/hospedes.py` | `hospedes/page.tsx` |
| RF05 | Cadastro de voluntários | Voluntários | `models/voluntario.py`, `api/v1/voluntarios.py` | `voluntarios/page.tsx` |
| RF07 | Registro de doações | Financeiro — Seção Doações | `models/financeiro.py` (Doacao), `api/v1/financeiro.py` | `financeiro/page.tsx` |
| RF08 | Controle de despesas | Financeiro — Seção Despesas | `models/financeiro.py` (Despesa) | `financeiro/page.tsx` |
| RF13 | Dashboard de ocupação | Dashboard + card de ocupação | `api/v1/hospedes.py` (GET /ocupacao) | `dashboard/page.tsx`, `hospedes/page.tsx` |
| RN01/RN02 | Limite de 10 por sexo / 20 total | Validação ao cadastrar hóspede | `api/v1/hospedes.py` (_check_capacidade) | Mensagem de erro no modal |
| RNF01 | Controle de acesso por perfil | Autenticação JWT + perfis | `core/security.py`, `core/deps.py`, `api/v1/auth.py` | `lib/api.ts` (interceptor) |
| RNF03 | Interface responsiva | Todas as telas | — | `Sidebar.tsx`, `BottomNav.tsx`, `Header.tsx` |
| RNF05 | Arquitetura em camadas | Toda a estrutura | `models/` → `schemas/` → `api/` | `types/` → `lib/` → `app/` |

---

## 9. O Que Foi Implementado

- **Autenticação completa:** login com JWT, interceptor automático nas requisições, proteção de rotas
- **CRUD completo de Hóspedes:** cadastro com dados clínicos, edição, prontuário, diário de evolução e fluxo de alta
- **Regras de negócio RN01/RN02:** backend rejeita cadastros que excedem 10 hóspedes por sexo com mensagem clara
- **Gestão de Voluntários:** listagem e estrutura de cadastro (CRUD completo planejado)
- **Financeiro:** registro de doações e despesas, resumo do saldo em tempo real
- **Dashboard:** painel com ocupação atual, saldo financeiro e vagas disponíveis
- **Administração de usuários:** criação, ativação/desativação e redefinição de senha por super admin
- **Interface responsiva:** sidebar para desktop e bottom navigation para mobile

---

## 10. O Que Ficou Apenas Planejado

| Funcionalidade | Requisito |
|----------------|-----------|
| Emissão de recibos em PDF para doadores | RF09 |
| Controle de estoque de mantimentos | RF10 |
| Farmácia interna com controle de validade | RF11 |
| Canal de denúncias anônimas | RF12 |
| Escala de disponibilidade detalhada dos voluntários | RF06 |
| Relatórios e exportação de dados | — |
| Notificações e alertas (capacidade quase cheia, estoque baixo) | — |

---

## 11. Dificuldades Encontradas

- **Tailwind CSS v4:** a versão 4 do Tailwind tem sintaxe e comportamento diferentes da v3 (muito documentada online), exigindo leitura cuidadosa de uma documentação ainda em consolidação. A configuração do `@config` no CSS e o suporte a cores customizadas levou tempo até estabilizar.
- **Modal com scroll:** o comportamento de modais com `overflow-y-auto` em contêineres `flex` no Tailwind exige estrutura CSS específica (`flex min-h-full` no contêiner interno) para funcionar corretamente em conteúdo longo sem escurecer a tela toda.
- **Integração CORS entre Next.js e FastAPI:** configuração do CORS no FastAPI e do `baseURL` da API no frontend precisou de ajuste para funcionar em desenvolvimento local com portas diferentes.

---

## 12. Próximos Passos

1. **Estoque e farmácia** — implementar modelos, schemas e endpoints; criar telas de inventário
2. **Geração de PDF** — integrar biblioteca de PDF (ex: `reportlab` no Python) para recibos de doação
3. **Canal de denúncias** — formulário público sem autenticação com flag de anonimato
4. **Escala de voluntários** — tela de calendário semanal com disponibilidade por voluntário
5. **Testes automatizados** — cobertura de testes unitários no backend (pytest) e testes de integração
6. **Deploy** — configurar ambiente de produção com Nginx, HTTPS e variáveis de ambiente seguras
7. **Controle de acesso granular** — aplicar RN04 (prontuários visíveis apenas a Técnicos e Admins) nas rotas protegidas
