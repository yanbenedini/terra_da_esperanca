from typing import Optional

from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    perfil: str = "voluntario"


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    perfil: Optional[str] = None
    ativo: Optional[bool] = None


class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    perfil: str
    is_super_admin: bool
    ativo: bool

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class ResetSenhaRequest(BaseModel):
    usuario_id: int
    nova_senha: str


class AlterarSenhaRequest(BaseModel):
    senha_atual: str
    nova_senha: str
