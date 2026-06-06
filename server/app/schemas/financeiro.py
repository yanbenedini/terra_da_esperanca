from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DoacaoCreate(BaseModel):
    doador_nome: Optional[str] = None  # None = anônimo (RN05)
    tipo: str  # "financeira" | "item"
    valor: Optional[Decimal] = None
    descricao: Optional[str] = None
    forma_pagamento: Optional[str] = None
    data: date
    finalidade: Optional[str] = None


class DoacaoUpdate(BaseModel):
    doador_nome: Optional[str] = None
    tipo: Optional[str] = None
    valor: Optional[Decimal] = None
    descricao: Optional[str] = None
    forma_pagamento: Optional[str] = None
    data: Optional[date] = None
    finalidade: Optional[str] = None


class DoacaoOut(BaseModel):
    id: int
    doador_nome: Optional[str]
    tipo: str
    valor: Optional[Decimal]
    descricao: Optional[str]
    forma_pagamento: Optional[str]
    data: date
    finalidade: Optional[str]

    model_config = {"from_attributes": True}


class DespesaCreate(BaseModel):
    descricao: str
    categoria: str
    valor: Decimal
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    status: str = "pendente"


class DespesaUpdate(BaseModel):
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    valor: Optional[Decimal] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    status: Optional[str] = None


class DespesaOut(BaseModel):
    id: int
    descricao: str
    categoria: str
    valor: Decimal
    data_vencimento: Optional[date]
    data_pagamento: Optional[date]
    status: str

    model_config = {"from_attributes": True}


class ResumoFinanceiroOut(BaseModel):
    total_doacoes: Decimal
    total_despesas: Decimal
    saldo: Decimal
