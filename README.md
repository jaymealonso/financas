
# Finan�as

## Diret�rios 
- ```db``` Arquivos de cria��o do banco de dados e o pr�prio banco
- ```dist``` Vers�o compilada do aplicativo UI5 ```generated```
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
Faz o build parcial, s� com os arquivos do aplicativo, e deploy no diret�rio ```./dist/```.
```
npm run-script build
```
Faz o build completo ***incluindo das bibliotecas UI5*** (demora mais) e deploy no diret�rio ```./dist/```.
```
npm run-script buildAll
```
### Build do ELECTRON-FORGE
Faz o build completo do aplicativo e do instalador e coloca no diret�rio ```./out/```
```
npm run-script make
```
A Definir

## Como executar os testes unit�rios

N�o existem teste unit�rio por enquanto.

## Erros e resolu��es
### DB Sqlite3:
### Caminho errado
- Problema:
  - Ao executar ```npm start``` d� erro onde n�o encontra o diret�rio do SQLITE:
- Solu��o:
  - Temos que fazer o rebuid do electron incluindo o sqlite3

```
npm install electron-rebuild
```

```
.\node_modules\.bin\electron-rebuild -w sqlite3 -p
```

Outra alternativa, b�o funcionou
```
"./node_modules/.bin/electron-rebuild -f -w sqlite3"
```


# Changelog
- 2021-Adicionando "Roadmap / New features" e "Change log"
# Roadmap / New features
## Funcionalidades Maiores / mais trabalho
- [ ] Calend�rio de pagamentos
- [ ] Or�amento
- [ ] Vis�o de arquivos armazenados por Ano / Mes e rela��o com lan�amento
## Funcionalidades menores / mais localizadas
### Vis�o Mensal
- [ ] Filtro de Vis�o Mensal por per�odo de Mes-Ano at� Mes-Ano
### Lan�amentos
- [ ] Filtro de lan�amentos por per�odo de Mes-Ano at� Mes-Ano
- [ ] Filtros(Live) nos Lan�amentos
- [ ] Split de lan�amentos em dois ou mais lan�amentos com categorias pr�prias
- [ ] Matching de lan�amentos pre-existentes com categorias
- [X] Apagar categorias que estejam vazias. 
### Importar arquivo extrato
- [ ] Salvar configura��es de importa��o (formato data/separador milhar/decimais)
- [ ] Vis�o arquivo excel processado antes da importa��o
- [ ] Importa��o de CSV
- [ ] Importa��o em janela pop-up "Modal"
### Vis�o de arquivos anexo armazenados por Ano / Mes
- [X] Armazenamento de arquivos com liga��o para Lan�amentos
- [ ] Navega��o da "Vis�o de arquivos armazenados por Ano / Mes" para Lan�amentos
## Talvez / infraestrutura
- [ ] Portar frontend para fora do UI5
- [ ] Portar Banco de Dados para MongoDB
- [ ] Portar app para NodeGUI (+ performance -tamanho arquivo app) (NodeGUI ainda est� Beta com pequeno suporte a componentes avan�ados)
- [ ] Montar configura��o de build para:
  - criar .env para dev/producao
  - criar splash de instala��o
  - remover arquivos do diretorio webapp
  - remover financas.db do instalador
  - gerar numera��o de vers�o
