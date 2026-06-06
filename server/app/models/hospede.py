from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Hospede(Base):
    __tablename__ = "hospedes"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    # sexo: "M" | "F"
    sexo = Column(String(1), nullable=False)
    data_nascimento = Column(Date, nullable=True)
    cpf = Column(String(14), unique=True, nullable=True)
    clinica_origem = Column(String, nullable=True)
    contato_emergencia_nome = Column(String, nullable=True)
    contato_emergencia_telefone = Column(String, nullable=True)
    # status: "ativo" | "alta"
    status = Column(String, default="ativo", nullable=False)
    data_entrada = Column(Date, nullable=False)
    data_alta = Column(Date, nullable=True)

    # Prontuário
    medicacoes = Column(Text, nullable=True)
    alergias = Column(Text, nullable=True)
    historico_clinico = Column(Text, nullable=True)

    evolucoes = relationship("Evolucao", back_populates="hospede", cascade="all, delete-orphan")


class Evolucao(Base):
    __tablename__ = "evolucoes"

    id = Column(Integer, primary_key=True, index=True)
    hospede_id = Column(Integer, ForeignKey("hospedes.id"), nullable=False)
    autor_nome = Column(String, nullable=False)
    anotacao = Column(Text, nullable=False)
    data = Column(Date, nullable=False)

    hospede = relationship("Hospede", back_populates="evolucoes")
