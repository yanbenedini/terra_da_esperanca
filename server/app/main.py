import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api.v1 import auth, financeiro, hospedes, usuarios, voluntarios
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.usuario import Usuario

logger = logging.getLogger("terra")

SUPER_ADMIN_EMAIL = "admin@terradaesperanca.org"
SUPER_ADMIN_SENHA = "Admin@2025"
SUPER_ADMIN_NOME = "Super Administrador"


def _migrate() -> None:
    """Migrações manuais para colunas adicionadas após a criação inicial do banco."""
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE usuarios "
            "ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE"
        ))


def _seed_super_admin() -> None:
    """Cria o super admin na primeira inicialização do banco, caso não exista."""
    db = SessionLocal()
    try:
        existe = db.query(Usuario).filter(Usuario.is_super_admin == True).first()
        if existe:
            return
        super_admin = Usuario(
            nome=SUPER_ADMIN_NOME,
            email=SUPER_ADMIN_EMAIL,
            senha_hash=hash_password(SUPER_ADMIN_SENHA),
            perfil="super_admin",
            is_super_admin=True,
            ativo=True,
        )
        db.add(super_admin)
        db.commit()
        logger.warning(
            "\n"
            "╔══════════════════════════════════════════════════╗\n"
            "║          SUPER ADMIN CRIADO — PRIMEIRO ACESSO    ║\n"
            "║  E-mail : admin@terradaesperanca.org             ║\n"
            "║  Senha  : Admin@2025                             ║\n"
            "║  !! Redefina a senha após o primeiro login !!    ║\n"
            "╚══════════════════════════════════════════════════╝"
        )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Aguarda o banco ficar disponível (Docker pode demorar alguns segundos)
    for tentativa in range(1, 16):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Banco de dados conectado e tabelas criadas.")
            break
        except OperationalError:
            if tentativa == 15:
                raise
            logger.warning(
                "Banco ainda não disponível. Tentando novamente em 2s... (%d/15)", tentativa
            )
            await asyncio.sleep(2)

    _migrate()
    _seed_super_admin()
    yield


app = FastAPI(
    title="Terra da Esperança API",
    description="Sistema de gestão para a casa de acolhimento Terra da Esperança.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
app.include_router(hospedes.router, prefix="/api/v1")
app.include_router(voluntarios.router, prefix="/api/v1")
app.include_router(financeiro.router, prefix="/api/v1")


@app.get("/")
def health():
    return {"status": "ok", "projeto": "Terra da Esperança"}
