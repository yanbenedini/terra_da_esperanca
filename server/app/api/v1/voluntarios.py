from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.voluntario import Voluntario
from app.schemas.voluntario import VoluntarioCreate, VoluntarioOut, VoluntarioUpdate

router = APIRouter(prefix="/voluntarios", tags=["voluntarios"])


@router.get("/", response_model=list[VoluntarioOut])
def list_voluntarios(status: str | None = None, especialidade: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Voluntario)
    if status:
        query = query.filter(Voluntario.status == status)
    if especialidade:
        query = query.filter(Voluntario.especialidade.ilike(f"%{especialidade}%"))
    return query.order_by(Voluntario.nome_completo).all()


@router.post("/", response_model=VoluntarioOut, status_code=status.HTTP_201_CREATED)
def create_voluntario(payload: VoluntarioCreate, db: Session = Depends(get_db)):
    voluntario = Voluntario(**payload.model_dump())
    db.add(voluntario)
    db.commit()
    db.refresh(voluntario)
    return voluntario


@router.get("/{voluntario_id}", response_model=VoluntarioOut)
def get_voluntario(voluntario_id: int, db: Session = Depends(get_db)):
    v = db.query(Voluntario).filter(Voluntario.id == voluntario_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Voluntário não encontrado.")
    return v


@router.patch("/{voluntario_id}", response_model=VoluntarioOut)
def update_voluntario(voluntario_id: int, payload: VoluntarioUpdate, db: Session = Depends(get_db)):
    v = db.query(Voluntario).filter(Voluntario.id == voluntario_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Voluntário não encontrado.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{voluntario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_voluntario(voluntario_id: int, db: Session = Depends(get_db)):
    v = db.query(Voluntario).filter(Voluntario.id == voluntario_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Voluntário não encontrado.")
    db.delete(v)
    db.commit()
