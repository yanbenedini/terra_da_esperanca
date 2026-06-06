from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    # perfil: "super_admin" | "admin" | "tecnico" | "voluntario"
    perfil = Column(String, default="voluntario", nullable=False)
    is_super_admin = Column(Boolean, default=False, nullable=False)
    ativo = Column(Boolean, default=True)
