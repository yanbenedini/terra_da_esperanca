from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.financeiro import Despesa, Doacao
from app.schemas.financeiro import (
    DespesaCreate,
    DespesaOut,
    DespesaUpdate,
    DoacaoCreate,
    DoacaoOut,
    DoacaoUpdate,
    ResumoFinanceiroOut,
)

router = APIRouter(prefix="/financeiro", tags=["financeiro"])


@router.get("/resumo", response_model=ResumoFinanceiroOut)
def get_resumo(db: Session = Depends(get_db)):
    total_doacoes = db.query(func.sum(Doacao.valor)).filter(Doacao.tipo == "financeira").scalar() or Decimal("0")
    total_despesas = db.query(func.sum(Despesa.valor)).filter(Despesa.status == "paga").scalar() or Decimal("0")
    return ResumoFinanceiroOut(
        total_doacoes=total_doacoes,
        total_despesas=total_despesas,
        saldo=total_doacoes - total_despesas,
    )


# ── Doações ───────────────────────────────────────────────────────────────

@router.get("/doacoes", response_model=list[DoacaoOut])
def list_doacoes(db: Session = Depends(get_db)):
    return db.query(Doacao).order_by(Doacao.data.desc()).all()


@router.post("/doacoes", response_model=DoacaoOut, status_code=status.HTTP_201_CREATED)
def create_doacao(payload: DoacaoCreate, db: Session = Depends(get_db)):
    doacao = Doacao(**payload.model_dump())
    db.add(doacao)
    db.commit()
    db.refresh(doacao)
    return doacao


@router.patch("/doacoes/{doacao_id}", response_model=DoacaoOut)
def update_doacao(doacao_id: int, payload: DoacaoUpdate, db: Session = Depends(get_db)):
    doacao = db.query(Doacao).filter(Doacao.id == doacao_id).first()
    if not doacao:
        raise HTTPException(status_code=404, detail="Doação não encontrada.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(doacao, field, value)
    db.commit()
    db.refresh(doacao)
    return doacao


@router.delete("/doacoes/{doacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doacao(doacao_id: int, db: Session = Depends(get_db)):
    doacao = db.query(Doacao).filter(Doacao.id == doacao_id).first()
    if not doacao:
        raise HTTPException(status_code=404, detail="Doação não encontrada.")
    db.delete(doacao)
    db.commit()


# ── Despesas ──────────────────────────────────────────────────────────────

@router.get("/despesas", response_model=list[DespesaOut])
def list_despesas(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Despesa)
    if status:
        query = query.filter(Despesa.status == status)
    return query.order_by(Despesa.data_vencimento).all()


@router.post("/despesas", response_model=DespesaOut, status_code=status.HTTP_201_CREATED)
def create_despesa(payload: DespesaCreate, db: Session = Depends(get_db)):
    despesa = Despesa(**payload.model_dump())
    db.add(despesa)
    db.commit()
    db.refresh(despesa)
    return despesa


@router.patch("/despesas/{despesa_id}", response_model=DespesaOut)
def update_despesa(despesa_id: int, payload: DespesaUpdate, db: Session = Depends(get_db)):
    despesa = db.query(Despesa).filter(Despesa.id == despesa_id).first()
    if not despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(despesa, field, value)
    db.commit()
    db.refresh(despesa)
    return despesa


@router.delete("/despesas/{despesa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_despesa(despesa_id: int, db: Session = Depends(get_db)):
    despesa = db.query(Despesa).filter(Despesa.id == despesa_id).first()
    if not despesa:
        raise HTTPException(status_code=404, detail="Despesa não encontrada.")
    db.delete(despesa)
    db.commit()
