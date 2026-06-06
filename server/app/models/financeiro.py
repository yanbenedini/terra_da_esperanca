from sqlalchemy import Column, Date, Integer, Numeric, String, Text

from app.core.database import Base


class Doacao(Base):
    __tablename__ = "doacoes"

    id = Column(Integer, primary_key=True, index=True)
    doador_nome = Column(String, nullable=True)   # None = anônimo (RN05)
    tipo = Column(String, nullable=False)          # "financeira" | "item"
    valor = Column(Numeric(10, 2), nullable=True)  # para doações financeiras
    descricao = Column(Text, nullable=True)        # para doações de itens
    forma_pagamento = Column(String, nullable=True)  # "pix" | "dinheiro" | "transferencia"
    data = Column(Date, nullable=False)
    finalidade = Column(String, nullable=True)


class Despesa(Base):
    __tablename__ = "despesas"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    categoria = Column(String, nullable=False)  # "luz" | "agua" | "manutencao" | etc.
    valor = Column(Numeric(10, 2), nullable=False)
    data_vencimento = Column(Date, nullable=True)
    data_pagamento = Column(Date, nullable=True)
    # status: "pendente" | "paga"
    status = Column(String, default="pendente", nullable=False)
