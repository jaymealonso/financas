
# Finanças

## Diretórios 
- ```dist``` Versão compilada do aplicativo UI5
- ```webapp``` Codigo fonte do Web Application
- ```electron``` Codigo node do electron
- ```db``` Arquivos de criação do banco de dados e o próprio banco

## Funcionalidades principais para o build

### Instalar modulos do NODE
```
npm install 
```

### Iniciar Electron
Executar electron abrindo o popup do aplicativo de Desktop.
```
npm start
```
### Build do UI5
Faz o build e deploy no diretório ```./dist/```.
```
npm run-script build
```
### build do ELECTRON-FORGE

A Definir

## Como executar os testes unitários

Não existem teste unitário por enquanto.

## Erros e resoluções
### DB Sqlite3:
#### 1 - caminho errado
Ao executar ```npm start``` dá erro onde não encontra o diretório do SQLITE:

Temos que fazer o rebuid do electron incluindo o sqlite3

```
npm install electron-rebuild
```

```
.\node_modules\.bin\electron-rebuild -w sqlite3 -p
```
