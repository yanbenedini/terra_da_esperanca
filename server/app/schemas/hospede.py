from datetime import date
from typing import Optional

from pydantic import BaseModel


class EvolucaoCreate(BaseModel):
    anotacao: str
    autor_nome: str
    data: date


class EvolucaoOut(BaseModel):
    id: int
    autor_nome: str
    anotacao: str
    data: date

    model_config = {"from_attributes": True}


class HospedeCreate(BaseModel):
    nome_completo: str
    sexo: str  # "M" | "F"
    data_nascimento: Optional[date] = None
    cpf: Optional[str] = None
    clinica_origem: Optional[str] = None
    contato_emergencia_nome: Optional[str] = None
    contato_emergencia_telefone: Optional[str] = None
    data_entrada: date
    medicacoes: Optional[str] = None
    alergias: Optional[str] = None
    historico_clinico: Optional[str] = None


class HospedeUpdate(BaseModel):
    nome_completo: Optional[str] = None
    clinica_origem: Optional[str] = None
    contato_emergencia_nome: Optional[str] = None
    contato_emergencia_telefone: Optional[str] = None
    medicacoes: Optional[str] = None
    alergias: Optional[str] = None
    historico_clinico: Optional[str] = None
    status: Optional[str] = None
    data_alta: Optional[date] = None


class HospedeOut(BaseModel):
    id: int
    nome_completo: str
    sexo: str
    data_nascimento: Optional[date]
    cpf: Optional[str]
    clinica_origem: Optional[str]
    contato_emergencia_nome: Optional[str]
    contato_emergencia_telefone: Optional[str]
    status: str
    data_entrada: date
    data_alta: Optional[date]
    medicacoes: Optional[str]
    alergias: Optional[str]
    historico_clinico: Optional[str]
    evolucoes: list[EvolucaoOut] = []

    model_config = {"from_attributes": True}


class OcupacaoOut(BaseModel):
    total: int
    masculino: int
    feminino: int
    vagas_masculino: int
    vagas_feminino: int
