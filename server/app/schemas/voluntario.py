from typing import Optional

from pydantic import BaseModel


class VoluntarioCreate(BaseModel):
    nome_completo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    especialidade: str  # RN03: obrigatório
    disponibilidade: Optional[str] = None
    status: str = "ativo"


class VoluntarioUpdate(BaseModel):
    nome_completo: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    especialidade: Optional[str] = None
    disponibilidade: Optional[str] = None
    status: Optional[str] = None


class VoluntarioOut(BaseModel):
    id: int
    nome_completo: str
    email: Optional[str]
    telefone: Optional[str]
    especialidade: str
    disponibilidade: Optional[str]
    status: str

    model_config = {"from_attributes": True}
