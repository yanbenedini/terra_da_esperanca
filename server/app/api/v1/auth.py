from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import LoginRequest, TokenOut, UsuarioOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if not usuario or not verify_password(payload.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo. Contate o administrador.")
    token = create_access_token(str(usuario.id))
    return TokenOut(access_token=token, usuario=UsuarioOut.model_validate(usuario))
