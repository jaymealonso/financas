/* eslint-disable strict */
const Sqlite3 = require('better-sqlite3');
const fs = require('fs');
const { join } = require('path');
const databaseFileFullPath = join(__dirname, "..", "db", "financas.db");
const creationScriptFullPath = join(__dirname, "..", "db", "create_db.sql");

const connectToCreateDb = async () => new Promise((resolve, reject) => {
    let db = new Sqlite3(databaseFileFullPath, { verbose: console.log }); 

    if (!db) {
        console.error('Erro ao conectar ao banco de dados.');
        console.error(err.message);
        return reject(err);
    }
    console.log('Connected to the financas.db database (READ_WRITE/CREATE).');
    return resolve(db);

});

const readFile = async () => new Promise((resolve, reject) => {
    fs.readFile(creationScriptFullPath, 'utf8', (err, contents) => {
        console.log("Finalizou a leitura do arquivo");
        if (err) {
            console.log("Ocorreu um erro na leitura do arquivo de criação DB inicial.");
            console.error(err.message);
            return reject(err);
        }
        // console.log("**** Conteudo Arquivo **** \n" + contents);
        resolve(contents);
    });
});

const createDataBaseFromFile = () => new Promise( async (resolve, reject) => {

    // Verifica se o arquivo DB existe
    try {
        fs.accessSync(databaseFileFullPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log("Arquivo de DB existe, não recriar.");
        return resolve();
    } catch (err) {
        // N�o existe, criar abaixo 
    }

    let db = await connectToCreateDb();
    if (!db) {
        reject();
    }

    let contents = await readFile();

    db.exec(
        contents
    , (err) => {
        if (err) {
            console.log('Erro ao criar Tabelas DB!');
            console.error(err.message);
            return reject(err);
        }
        console.log('Dados iniciais de DB criados!');
        return resolve();
    });
});

module.exports = {
    createDataBaseFromFile: createDataBaseFromFile
}