
# Finanças

## Diretórios 
- ```db``` Arquivos de criação do banco de dados e o próprio banco
- ```dist``` Versão compilada do aplicativo UI5 ```generated```
- ```electron``` Codigo node do electron
- ```out```  Sa�da do arquivo.exe "compilado" e instalador ```generated```
- ```webapp``` Codigo fonte do Web Application

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
Faz o build parcial, s� com os arquivos do aplicativo, e deploy no diretório ```./dist/```.
```
npm run-script build
```
Faz o build completo ***incluindo das bibliotecas UI5*** (demora mais) e deploy no diretório ```./dist/```.
```
npm run-script buildAll
```
### Build do ELECTRON-FORGE
Faz o build completo do aplicativo e do instalador e coloca no diret�rio ```./out/```
```
npm run-script make
```
A Definir

## Como executar os testes unitários

Não existem teste unitário por enquanto.

## Erros e resoluções
### DB Sqlite3:
### Caminho errado
- Problema:
  - Ao executar ```npm start``` dá erro onde não encontra o diretório do SQLITE:
- Solu��o:
  - Temos que fazer o rebuid do electron incluindo o sqlite3

```
npm install electron-rebuild
```

```
.\node_modules\.bin\electron-rebuild -w sqlite3 -p
```
