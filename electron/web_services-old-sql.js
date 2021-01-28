const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const databaseFile_fullPath = path.normalize(`${__dirname}/../db/financas.db`);
let db;

function connect () {
       
    db = new sqlite3.Database(databaseFile_fullPath, sqlite3.OPEN_READWRITE , (err) => {
        if (err) {
            console.log('Erro ao conectar na DB.');
            return console.error(err.message);
        }
        console.log('Connected to the financas.db database (READ_WRITE).');
    });
}

function setDB(in_db) {
    db = in_db;
}

function getContas (fnCallbackRender) {
    let sql = 
        `select c._id, c.descricao, c.numero, c.moeda, c.tipo, count(l._id) as count_lancamentos 
        from contas as c
            left outer join lancamentos as l on l.conta_id = c._id
        group by c._id, c.descricao, c.numero, c.moeda, c.tipo`; 

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        var aId = [];
        rows.forEach((row) => {
            aId.push(row._id);
        });
        console.log(`${sDateTimeStamp} Read ${aId.length} Contas> _id: ${aId.join(",")}`);

        fnCallbackRender(rows);
    });
}

function newConta () {

}

function getLancamentos(sConta, fnCallbackRender) {
    let sql = 
    `SELECT * FROM lancamentos
      WHERE conta_id = :cnt_id
      ORDER BY data`;
    db.all(sql, [sConta], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        var aId = [];
        rows.forEach((row) => {
            aId.push(row._id);
        });
        console.log(`${sDateTimeStamp} Read ${aId.length} Lancamentos> _id: ${aId.join(",")}`);

        fnCallbackRender(rows);
    });

}

function newLancamento (oValores, fnCallbackRender) {

    let oValues = oValores;
    let sql = 
        `INSERT INTO lancamentos VALUES (:id, :conta_id, :nr_referencia, :descricao, :data, :valor);`
    db.run(sql, [
        null, 
        oValores.conta_id, 
        oValores.nr_referencia, 
        oValores.descricao, 
        oValores.data, 
        oValores.valor 
        ], function (err) {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > INSERT ID: ${this.lastID}` );
        oValues._id = this.lastID;

        fnCallbackRender(oValues);
    });

}

function changeLancamento(oValores, fnCallbackRender) {

    let sql = 
        `UPDATE lancamentos 
            SET nr_referencia = :nr_referencia,
                descricao     = :descricao,
                data          = :data,
                valor         = :valor
          WHERE conta_id      = :conta_id
            AND _id           = :id`
    db.all(sql, [
        oValores.nr_referencia, 
        oValores.descricao, 
        oValores.data, 
        oValores.valor,
        oValores.conta_id, 
        oValores._id 
        ], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        console.log(sDateTimeStamp + " > CHANGE Conta ID: " + oValores.conta_id + " Lanc: " + oValores._id );

        fnCallbackRender(rows);
    });

}

function deleteLancamento (sConta, sLancId, fnCallbackRender) {

    let sql = 
        `DELETE FROM lancamentos WHERE conta_id = :cnt AND _id = :id`
    db.all(sql, [
        sConta,
        sLancId
        ], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        console.log(sDateTimeStamp + " > DELETE Conta ID:" + sConta + " Lanc: " + sLancId );

        fnCallbackRender(rows);
    });

}

function parseFile(oFile, fnCallbackRender) {

    // var oOutObj = parseFileCSV(oFile.data.toString());
    var oOutObj = parseFileExcel(oFile);

    fnCallbackRender(oOutObj);
}

function parseFileExcel(oFile) {
    const XLSX = require("XLSX");

    var wb = XLSX.read(oFile.data.buffer, {type: "buffer"});

    var sh = wb.Sheets[wb.SheetNames[0]];

    var oOutObj = {};

    var regex= /([A-Z]*)([0-9]*)/;
    for (var iInd in sh) { 
        var aExp    = regex.exec(iInd);
        var sLetra  = aExp[1];
        var sNumero = aExp[2];
        if (!sLetra || sLetra === "" || !sNumero || sNumero === "") {
            // next()
        } else {
            var sValor  = sh[iInd].v;
            var oObjNew = {}
            oObjNew[sLetra] = sValor;
            if (oOutObj[sNumero]) {
                oOutObj[sNumero][sLetra] = sValor;
            } else {
                oOutObj[sNumero] = oObjNew;
            }
        }
    }

    console.log(`Processado arquivo com ${oOutObj.length} linhas.`);

    var aOut = [];
    for (var i in oOutObj) {
       aOut.push(oOutObj[i]);
    }
    return aOut;


}

function parseFileCSV(sFileString) {
    var oOutObj = {};
    var aLines = sFileString.split("\r\n");
    
    for (var iIndLine in aLines) { 
        var aValues =  aLines[iIndLine].split(";");
        var oParsedLine = {}
        for (var iIndValue in aValues) {
            oParsedLine[iIndValue] = aValues[iIndValue];
        }
        oOutObj[iIndLine] = oParsedLine;
    }
    return oOutObj;
}

function getCategorias (fnCallbackRender) {
    let sql = 
      `SELECT * FROM categorias
       ORDER BY _id`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        var aId = [];
        rows.forEach((row) => {
            aId.push(row._id);
            // console.log(sDateTimeStamp + " Read Categoria> " + row._id);
        });
        console.log(`${sDateTimeStamp} Read ${aId.length} Categorias> ${aId.join(",")}`);

//        console.log(sDateTimeStamp + " Read Categoria> " + aId.join(","));
        fnCallbackRender(rows);
        // return rows;
    });

    // return { "conta": "1" };
}

function newCategorias (oValores ,fnCallbackRender) {
    let sql = 
      `INSERT INTO categorias values (null, :nm_categoria);`;

    db.all(sql, [oValores.nm_categoria], (err, rows) => {
        if (err) {
            throw err;
        }
        var sDateTimeStamp = new Date().toISOString();
        console.log(sDateTimeStamp + " Insert Categoria> " + oValores.nm_categoria);
        fnCallbackRender(rows);
        // return rows;
    });

    // return { "conta": "1" };
}



module.exports = {
    connect: connect,
    setDB: setDB,
    getContas: getContas,
    getLancamentos: getLancamentos,
    newLancamento: newLancamento,
    changeLancamento: changeLancamento,
    deleteLancamento: deleteLancamento,
    newConta: newConta,
    parseFile: parseFile,
    getCategorias: getCategorias
}
