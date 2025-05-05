# models.py
# Este módulo define as tabelas do banco de dados SQLite usando SQLAlchemy.

from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Inquerito(Base):
    __tablename__ = 'inqueritos'

    id = Column(Integer, primary_key=True)
    numero = Column(String, unique=True, nullable=False)
    descricao = Column(String)
    data_criacao = Column(DateTime)
    data_vencimento = Column(DateTime)

# Função para criar o banco de dados

def criar_banco_dados(uri='sqlite:///inqueritos.db'):
    engine = create_engine(uri)
    Base.metadata.create_all(engine) 