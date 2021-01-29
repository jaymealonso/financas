/* eslint-disable strict */
const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const databaseFileFullPath = path.normalize(`${__dirname}/financas.db`);
const creationScriptFullPath = path.normalize(`${__dirname}/create_db.sql`);

const createDataBaseFromFile = () => {

    // Verifica se o arquivo DB existe
    fs.access(databaseFileFullPath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (!err) {
            console.log("Arquivo de DB existe, não recriar.");
            return;   
        }

        let db = new sqlite3.Database(databaseFileFullPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to the financas.db database (READ_WRITE/CREATE).');
        });
        fs.readFile(creationScriptFullPath, 'utf8', (err, contents) => {
            console.log("Finalizou a leitura do arquivo");
            if (err) {
                console.log("Ocorreu um erro na leitura do arquivo de criação DB inicial.");
                return console.error(err.message);
            }
            console.log("**** Conteudo Arquivo **** \n" + contents);
            db.exec(
                contents
            , (err) => {
                if (err) {
                    console.log('Erro ao criar Tabelas DB!');
                    return console.error(err.message);
                }
                console.log('Dados iniciais de DB criados!');
            });
        });

        console.log('Can read/write');
    });

}

module.exports = {
    createDataBaseFromFile: createDataBaseFromFile
}