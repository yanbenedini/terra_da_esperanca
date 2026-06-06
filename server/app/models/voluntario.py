from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Voluntario(Base):
    __tablename__ = "voluntarios"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    telefone = Column(String, nullable=True)
    especialidade = Column(String, nullable=False)  # RN03: obrigatório
    disponibilidade = Column(Text, nullable=True)   # JSON string com dias/horários
    # status: "ativo" | "inativo"
    status = Column(String, default="ativo", nullable=False)
