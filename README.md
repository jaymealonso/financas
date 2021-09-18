
# FinanÃ§as

## DiretÃ³rios 
- ```db``` Arquivos de criaÃ§Ã£o do banco de dados e o prÃ³prio banco
- ```dist``` VersÃ£o compilada do aplicativo UI5 ```generated```
- ```electron``` Codigo node do electron
- ```out```  Saída do arquivo.exe "compilado" e instalador ```generated```
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
Faz o build parcial, só com os arquivos do aplicativo, e deploy no diretÃ³rio ```./dist/```.
```
npm run-script build
```
Faz o build completo ***incluindo das bibliotecas UI5*** (demora mais) e deploy no diretÃ³rio ```./dist/```.
```
npm run-script buildAll
```
### Build do ELECTRON-FORGE
Faz o build completo do aplicativo e do instalador e coloca no diretório ```./out/```
```
npm run-script make
```
A Definir

## Como executar os testes unitÃ¡rios

NÃ£o existem teste unitÃ¡rio por enquanto.

## Erros e resoluÃ§Ãµes
### DB Sqlite3:
### Caminho errado
- Problema:
  - Ao executar ```npm start``` dÃ¡ erro onde nÃ£o encontra o diretÃ³rio do SQLITE:
- Solução:
  - Temos que fazer o rebuid do electron incluindo o sqlite3

```
npm install electron-rebuild
```

```
.\node_modules\.bin\electron-rebuild -w sqlite3 -p
```

Outra alternativa, bão funcionou
```
"./node_modules/.bin/electron-rebuild -f -w sqlite3"
```


# Changelog
- 2021-Adicionando "Roadmap / New features" e "Change log"
# Roadmap / New features
## Funcionalidades Maiores / mais trabalho
- [ ] Calendário de pagamentos
- [ ] Orçamento
- [ ] Visão de arquivos armazenados por Ano / Mes e relação com lançamento
## Funcionalidades menores / mais localizadas
### Visão Mensal
- [ ] Filtro de Visão Mensal por período de Mes-Ano até Mes-Ano
### Lançamentos
- [ ] Filtro de lançamentos por período de Mes-Ano até Mes-Ano
- [ ] Filtros(Live) nos Lançamentos
- [ ] Split de lançamentos em dois ou mais lançamentos com categorias próprias
- [ ] Matching de lançamentos pre-existentes com categorias
- [X] Apagar categorias que estejam vazias. 
### Importar arquivo extrato
- [ ] Salvar configurações de importação (formato data/separador milhar/decimais)
- [ ] Visão arquivo excel processado antes da importação
- [ ] Importação de CSV
- [ ] Importação em janela pop-up "Modal"
### Visão de arquivos anexo armazenados por Ano / Mes
- [X] Armazenamento de arquivos com ligação para Lançamentos
- [ ] Navegação da "Visão de arquivos armazenados por Ano / Mes" para Lançamentos
## Talvez / infraestrutura
- [ ] Portar frontend para fora do UI5
- [ ] Portar Banco de Dados para MongoDB
- [ ] Portar app para NodeGUI (+ performance -tamanho arquivo app) (NodeGUI ainda está Beta com pequeno suporte a componentes avançados)
- [ ] Montar configura��o de build para:
  - criar .env para dev/producao
  - criar splash de instala��o
  - remover arquivos do diretorio webapp
  - remover financas.db do instalador
  - gerar numera��o de vers�o
