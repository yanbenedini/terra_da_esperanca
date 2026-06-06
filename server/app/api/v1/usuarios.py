from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_super_admin
from app.core.security import hash_password, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import (
    AlterarSenhaRequest,
    ResetSenhaRequest,
    UsuarioCreate,
    UsuarioOut,
    UsuarioUpdate,
)

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioOut)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UsuarioOut])
def list_usuarios(_: Usuario = Depends(require_super_admin), db: Session = Depends(get_db)):
    return db.query(Usuario).order_by(Usuario.nome).all()


@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def criar_usuario(
    payload: UsuarioCreate,
    _: Usuario = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    if db.query(Usuario).filter(Usuario.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    usuario = Usuario(
        nome=payload.nome,
        email=payload.email,
        senha_hash=hash_password(payload.senha),
        perfil=payload.perfil,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.patch("/{usuario_id}", response_model=UsuarioOut)
def atualizar_usuario(
    usuario_id: int,
    payload: UsuarioUpdate,
    _: Usuario = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if usuario.is_super_admin:
        raise HTTPException(status_code=403, detail="Não é possível alterar o super administrador.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(usuario, field, value)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/reset-senha", response_model=UsuarioOut)
def reset_senha(
    payload: ResetSenhaRequest,
    current_user: Usuario = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """Super admin redefine a senha de qualquer usuário."""
    usuario = db.query(Usuario).filter(Usuario.id == payload.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if usuario.is_super_admin and usuario.id != current_user.id:
        raise HTTPException(status_code=403, detail="Não é possível redefinir a senha de outro super administrador.")
    usuario.senha_hash = hash_password(payload.nova_senha)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/minha-senha", response_model=UsuarioOut)
def alterar_minha_senha(
    payload: AlterarSenhaRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Qualquer usuário pode alterar a própria senha informando a senha atual."""
    if not verify_password(payload.senha_atual, current_user.senha_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    current_user.senha_hash = hash_password(payload.nova_senha)
    db.commit()
    db.refresh(current_user)
    return current_user
