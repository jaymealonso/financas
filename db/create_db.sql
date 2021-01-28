
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- DELETE TABELAS EXISTENTES
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS lancamento_categoria;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS lancamentos;
DROP TABLE IF EXISTS contas;
DROP TABLE IF EXISTS contas_tipo;

-- CREATE TABLES + CONSTRAINSTS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contas_tipo (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TYPE TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contas (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    numero TEXT NOT NULL,
	moeda type TEXT NOT NULL,
    tipo TYPE INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lancamentos (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    conta_id TYPE INTEGER NOT NULL,
    nr_referencia TYPE TEXT NOT NULL,
    descricao type TEXT NOT NULL,
    data TYPE TEXT NOT NULL, 
    valor TYPE NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    nm_categoria TYPE TEXT NOT NULL,
    UNIQUE(nm_categoria)
);

CREATE TABLE IF NOT EXISTS lancamento_categoria (
    lancamento_id INTEGER,
    categoria_id INTEGER,
    PRIMARY KEY (lancamento_id, categoria_id)
    CONSTRAINT fk_lancamento_id
        FOREIGN KEY (lancamento_id)
        REFERENCES lancamentos (_id)
        ON DELETE CASCADE    
);

-- DADOS MESTRE
--------------------------------------------------------------------------------
INSERT INTO contas_tipo VALUES (1, 'Conta Corrente');
INSERT INTO contas_tipo VALUES (2, 'Poupança');
INSERT INTO contas_tipo VALUES (3, 'Cartão Crédito');

INSERT INTO categorias values (null, "Salário");     -- 1
INSERT INTO categorias values (null, "Almoço");      -- 2
INSERT INTO categorias values (null, "Transfência"); -- 3
INSERT INTO categorias values (null, "Aluguel");     -- 4

-- BANCO DE EXEMPLO
--------------------------------------------------------------------------------
INSERT INTO contas VALUES (null, 'Itaú-CC', '0516-145589', 'BRL', 1);
INSERT INTO contas VALUES (null, 'ActivoBank-CC', 'PT144684831', 'EUR', 1);
INSERT INTO contas VALUES (null, 'ActivoBank-CRD', 'PT144684831','EUR',  3);
INSERT INTO contas VALUES (null, 'BPI-CC', '4477889-888555', 'EUR', 1);

INSERT INTO lancamentos VALUES (null, 1, "334562", "Transf China", '2019-11-30', -2000.00);
INSERT INTO lancamentos VALUES (null, 1, "334563", "Transf Port.", '2019-11-30', -120.00);

INSERT INTO lancamentos VALUES (null, 2, "334562", "Salario", '2019-11-30', 5000.00);          -- 1 
INSERT INTO lancamentos VALUES (null, 2, "334563", "Compra bala", '2019-11-30', -100.00);      -- 2
INSERT INTO lancamentos VALUES (null, 2, "334564", "Comprar chiclete", '2019-11-30', -120.00);
INSERT INTO lancamentos VALUES (null, 2, "334565", "Aluguel", '2019-12-01', -650.50);
INSERT INTO lancamentos VALUES (null, 2, "334566", "Carro", '2019-12-02', -360.50);

INSERT INTO categorias values (null, "Salário");
INSERT INTO categorias values (null, "Doces");

INSERT INTO lancamento_categoria values (1, 1);
INSERT INTO lancamento_categoria values (2, 1);

COMMIT;
