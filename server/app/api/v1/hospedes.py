from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hospede import Evolucao, Hospede
from app.schemas.hospede import (
    EvolucaoCreate,
    EvolucaoOut,
    HospedeCreate,
    HospedeOut,
    HospedeUpdate,
    OcupacaoOut,
)

LIMITE_POR_SEXO = 10

router = APIRouter(prefix="/hospedes", tags=["hospedes"])


def _check_capacidade(db: Session, sexo: str) -> None:
    """RN01 e RN02 — valida limite de 10 por sexo."""
    count = (
        db.query(Hospede)
        .filter(Hospede.sexo == sexo, Hospede.status == "ativo")
        .count()
    )
    if count >= LIMITE_POR_SEXO:
        descricao = "masculino" if sexo == "M" else "feminino"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Capacidade máxima de hóspedes do sexo {descricao} atingida (10/10).",
        )


@router.get("/ocupacao", response_model=OcupacaoOut)
def get_ocupacao(db: Session = Depends(get_db)):
    masc = db.query(Hospede).filter(Hospede.sexo == "M", Hospede.status == "ativo").count()
    fem = db.query(Hospede).filter(Hospede.sexo == "F", Hospede.status == "ativo").count()
    return OcupacaoOut(
        total=masc + fem,
        masculino=masc,
        feminino=fem,
        vagas_masculino=LIMITE_POR_SEXO - masc,
        vagas_feminino=LIMITE_POR_SEXO - fem,
    )


@router.get("/", response_model=list[HospedeOut])
def list_hospedes(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Hospede)
    if status:
        query = query.filter(Hospede.status == status)
    return query.order_by(Hospede.nome_completo).all()


@router.post("/", response_model=HospedeOut, status_code=status.HTTP_201_CREATED)
def create_hospede(payload: HospedeCreate, db: Session = Depends(get_db)):
    _check_capacidade(db, payload.sexo)
    hospede = Hospede(**payload.model_dump())
    db.add(hospede)
    db.commit()
    db.refresh(hospede)
    return hospede


@router.get("/{hospede_id}", response_model=HospedeOut)
def get_hospede(hospede_id: int, db: Session = Depends(get_db)):
    hospede = db.query(Hospede).filter(Hospede.id == hospede_id).first()
    if not hospede:
        raise HTTPException(status_code=404, detail="Hóspede não encontrado.")
    return hospede


@router.patch("/{hospede_id}", response_model=HospedeOut)
def update_hospede(hospede_id: int, payload: HospedeUpdate, db: Session = Depends(get_db)):
    hospede = db.query(Hospede).filter(Hospede.id == hospede_id).first()
    if not hospede:
        raise HTTPException(status_code=404, detail="Hóspede não encontrado.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(hospede, field, value)
    db.commit()
    db.refresh(hospede)
    return hospede


@router.post("/{hospede_id}/evolucoes", response_model=EvolucaoOut, status_code=status.HTTP_201_CREATED)
def add_evolucao(hospede_id: int, payload: EvolucaoCreate, db: Session = Depends(get_db)):
    hospede = db.query(Hospede).filter(Hospede.id == hospede_id).first()
    if not hospede:
        raise HTTPException(status_code=404, detail="Hóspede não encontrado.")
    evolucao = Evolucao(hospede_id=hospede_id, **payload.model_dump())
    db.add(evolucao)
    db.commit()
    db.refresh(evolucao)
    return evolucao
