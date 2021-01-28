const sqlite3 = require('better-sqlite3').verbose();

function getContas() {
    let db = new sqlite3.Database('./db/financas.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the financas.db database.');
    });

    db.serialize(() => {
        db.all(`SELECT * FROM contas_tipo`, (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            console.log("Tabela contas_tipo:");
            console.table(rows);
        });

        db.all(`SELECT * FROM contas`, (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            console.log("Tabela contas:");
            console.table(rows);
        });

        db.all(`SELECT * FROM lancamentos`, (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            console.log("Tabela lançamentos:");
            console.table(rows);
        });

    });

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

module.exports = {
    getContas: getContas
};

getContas()