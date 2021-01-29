/* eslint-disable strict */
const Sqlite3 = require('better-sqlite3');
const path = require('path');
const databaseFileFullPath = path.normalize(`${__dirname}/../db/financas.db`);

const connect = () => {
    var db = new Sqlite3(databaseFileFullPath, { verbose: console.log });
        
    if (db) {
        console.log('Connected to the financas.db database (READ_WRITE).');
    } else {
        console.log('Erro ao conectar na DB.');
    }
    return db;
}

const db = connect();

function readConta(sContaId, fnCallbackRender) {
    let sql = `
select c._id, c.descricao, c.numero, c.moeda, c.tipo, ct.descricao as tipo_descricao,
    ( select count(*) 
        from lancamentos as l 
             left outer join lancamento_categoria as lc on lc.lancamento_id = l._id
       where l.conta_id = c._id 
         and lc.lancamento_id is null ) as count_n_categ,
    ( select count(*) 
        from lancamentos as l1 
             inner join lancamento_categoria as lc1 on lc1.lancamento_id = l1._id
       where l1.conta_id = c._id ) as count_categ
from contas as c
     inner join contas_tipo as ct on ct._id = c.tipo
where c._id = ?
        `; 

    let stmt = db.prepare(sql);
    let row = stmt.get(sContaId);
    
    var sDateTimeStamp = new Date().toISOString();
    console.log(`${sDateTimeStamp} Read SINGLE Conta> : ${row}`);

    fnCallbackRender(row);
}

function readLancamento(sLancId, fnCallbackRender) {
    let sql = 
        `select l.*
        ,( select lc.categoria_id
            from lancamento_categoria as lc 
            where lc.lancamento_id = l._id ) as categoria_id
        ,c.nm_categoria
        from lancamentos as l 
            left outer join categorias as c on c._id = categoria_id
        where l._id = ?`;

    let stmt = db.prepare(sql);
    let row = stmt.get(sLancId);
    
    var sDateTimeStamp = new Date().toISOString();
    console.log(`${sDateTimeStamp} Read SINGLE Lancamento> : ${row}`);

    fnCallbackRender(row);
}

function getContas (fnCallbackRender) {
    let sql = `
select c._id, c.descricao, c.numero, c.moeda, c.tipo, ct.descricao as tipo_descricao,
    ( select count(*) 
        from lancamentos as l 
             left outer join lancamento_categoria as lc on lc.lancamento_id = l._id
       where l.conta_id = c._id 
         and lc.lancamento_id is null ) as count_n_categ,
    ( select count(*) 
        from lancamentos as l1 
             inner join lancamento_categoria as lc1 on lc1.lancamento_id = l1._id
       where l1.conta_id = c._id ) as count_categ
from contas as c
     inner join contas_tipo as ct on ct._id = c.tipo
        `;

    let stmt = db.prepare(sql);
    let rows = stmt.all();

    var sDateTimeStamp = new Date().toISOString();
    let aId = [];
    rows.forEach((row) => {
        aId.push(row._id);
    });
    console.log(`${sDateTimeStamp} Read ${aId.length} Contas> _id: ${aId.join(",")}`);

    fnCallbackRender(rows);
}

function getContasTipos (fnCallbackRender) {
    let sql = `
        select * from contas_tipo
        `;

    let stmt = db.prepare(sql);
    let rows = stmt.all();

    var sDateTimeStamp = new Date().toISOString();
    let aId = [];
    rows.forEach((row) => {
        aId.push(row._id);
    });
    console.log(`${sDateTimeStamp} Read ${aId.length} Contas_tipo> _id: ${aId.join(",")}`);

    fnCallbackRender(rows);
}

function getLancamentos(oObject, fnCallbackRender) {
    // var oSQLParams = {
    //     conta_id: sConta
    // }
    var sAditionalQuery = "";
    
    if (oObject.ano_mes) {
        sAditionalQuery = `AND l.data like @ano_mes`;
        if (oObject.categoria_id) {
            sAditionalQuery = `${sAditionalQuery} AND c._id = @categoria_id`
        } else {
            sAditionalQuery = `${sAditionalQuery} AND c._id is null`
        }

        // oSQLParams["categoria_id"] = oObject.categoria_id;
        // oSQLParams["ano_mes"] = oObject.ano_mes + "%";
        // eslint-disable-next-line camelcase
        oObject.ano_mes = `${oObject.ano_mes}%`;
    }

    let sql = `
        select l.*
        ,( select lc.categoria_id
            from lancamento_categoria as lc 
            where lc.lancamento_id = l._id ) as categoria_id
        ,c.nm_categoria
        from lancamentos as l 
            left outer join categorias as c on c._id = categoria_id
        where conta_id = @conta_id
        ${sAditionalQuery}
        order by l.data
        `;

    let stmt = db.prepare(sql);
    let rows = stmt.all(oObject);
    
    var sDateTimeStamp = new Date().toISOString();
    let aId = [];
    rows.forEach((row) => {
        aId.push(row._id);
        row.data = new Date(row.data);
    });
    console.log(`${sDateTimeStamp} Read ${aId.length} Lancamentos> _id: ${aId.join(",")}`);

    fnCallbackRender(rows);
}

function getCategorias (fnCallbackRender) {
    let sql = 
      `SELECT * FROM categorias
       ORDER BY _id`;

    let stmt = db.prepare(sql);
    let rows = stmt.all();
    
    var sDateTimeStamp = new Date().toISOString();
    let aId = [];
    rows.forEach((row) => {
        aId.push(row._id);
    });
    console.log(`${sDateTimeStamp} Read ${aId.length} Categorias> _id: ${aId.join(",")}`);

    fnCallbackRender(rows);

}

function getVisaoMensal(oValores, fnCallbackRender) {

    let sql = 
        `
        select l.conta_id,
               substr( l.data, 0, 8) as ano_mes,
               c.nm_categoria, 
               c._id as categoria_id, 
               sum( l.valor ) as valor,
               ct.moeda
          from lancamentos as l
               inner join contas as ct on ct._id = l.conta_id
               left outer join lancamento_categoria as lc 
                       on lc.lancamento_id = l._id
               left outer join categorias as c 
                            on c._id = lc.categoria_id 
         where l.conta_id = ?
         group by conta_id, nm_categoria, categoria_id, ano_mes
         order by conta_id, nm_categoria, categoria_id, ano_mes
        `;

    let stmt = db.prepare(sql);
    let rows = stmt.all(oValores.conta_id);

    var aValues = [];
    rows.forEach(element => {
        var oValues = aValues.find(i => i.nm_categoria === element.nm_categoria);
        if (!oValues) {
            oValues = { 
                // eslint-disable-next-line camelcase
                conta_id : element.conta_id,
                // eslint-disable-next-line camelcase
                categoria_id: element.categoria_id,
                // eslint-disable-next-line camelcase
                nm_categoria : element.nm_categoria,
                moeda: element.moeda
            };  
            aValues.push(oValues);
        }
        oValues[element.ano_mes] = element.valor;
    });
    rows = aValues;

    var sDateTimeStamp = new Date().toISOString();
    console.log(`${sDateTimeStamp} Visao Mensal ${rows.length} linhas - Conta> _id: ${oValores.conta_id}`);

    let sql2 = 
        `
        select l.conta_id,
               substr( l.data, 0, 8) as ano_mes
          from lancamentos as l
               left outer join lancamento_categoria as lc 
                            on lc.lancamento_id = l._id
         where l.conta_id = ?
         group by conta_id, ano_mes
         order by conta_id, ano_mes
        `;

    let stmt2 = db.prepare(sql2);
    let rows2 = stmt2.all(oValores.conta_id);

    // Adiciona uma coluna de descrição no inicio da lista de colunas 
    // eslint-disable-next-line camelcase
    rows2 = [{conta_id: oValores.conta_id, ano_mes: null }].concat(rows2);

    rows2.forEach(function (i) {
        if (i.ano_mes) {
            i["column_name"] = i.ano_mes;
        } else {
            i["ano_mes"] = "Categoria";
            i["column_name"] = "nm_categoria";
        }
    });

    sDateTimeStamp = new Date().toISOString();
    console.log(`${sDateTimeStamp} Visao Mensal ${rows2.length} colunas - Conta> _id: ${oValores.conta_id}`);

    let oResponse = {
        columns: rows2,
        values: rows
    }

    fnCallbackRender(oResponse);

}

const newConta = () => {

}

function newLancamento (oValores, fnCallbackRender) {

    let oValues = oValores;
    let sql = 
        `INSERT INTO lancamentos VALUES (@id, @conta_id, @nr_referencia, @descricao, @data, @valor);`

    let insert = db.prepare(sql);
    let info = insert.run({
        id: null, 
        // eslint-disable-next-line camelcase
        conta_id: oValores.conta_id,  
        // eslint-disable-next-line camelcase
        nr_referencia: oValores.nr_referencia, 
        descricao: oValores.descricao, 
        data: oValores.data, 
        valor: oValores.valor
    });
    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > INSERT Lançamento ID: ${this.lastInsertRowid}` );
        oValues._id = info.lastInsertRowid;
    }

    fnCallbackRender(oValues);
}

function newCategoria(oValores ,fnCallbackRender) {
    let sql = 
      `INSERT INTO categorias values (@id, @nm_categoria);`;

    let insert = db.prepare(sql);
    let info = insert.run({
        id: null, 
        // eslint-disable-next-line camelcase
        nm_categoria: oValores.nm_categoria
    });
    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > INSERT Categoria: ${oValores.nm_categoria}` );
    }
  
    fnCallbackRender(info);
}

function newLancamentoCategoria (sLancId, sCategId, fnCallbackRender) {
    let sql = 
      `INSERT INTO lancamento_categoria values (@lancamento_id, @categoria_id);`;

    let insert = db.prepare(sql);
    let info = insert.run({
        // eslint-disable-next-line camelcase
        lancamento_id: sLancId, 
        // eslint-disable-next-line camelcase
        categoria_id: sCategId
    });
    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > INSERT Lancamento ${sLancId} Categoria: ${sCategId}` );
    }
  
    fnCallbackRender(info);
}

function changeConta(oValores, fnCallbackRender) {

    let sql = 
        `UPDATE contas 
            SET descricao     = @descricao,
                numero        = @numero,
                moeda         = @moeda,
                tipo          = @tipo
          WHERE _id           = @id`

    let update = db.prepare(sql);
    let info = update.run({
        id: oValores._id, 
        descricao: oValores.descricao, 
        numero: oValores.numero, 
        moeda: oValores.moeda,
        tipo: oValores.tipo
    });
    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > CHANGE CONTA ID: ${oValores._id}` );
    }

    readConta(oValores._id, fnCallbackRender);

}

function changeLancamento(oValores, fnCallbackRender) {

    let sql = 
        `UPDATE lancamentos 
            SET nr_referencia = @nr_referencia,
                descricao     = @descricao,
                data          = @data,
                valor         = @valor
          WHERE conta_id      = @conta_id
            AND _id           = @id`

    let update = db.prepare(sql);
    let info = update.run({
        id: oValores._id, 
        // eslint-disable-next-line camelcase
        conta_id: oValores.conta_id,  
        // eslint-disable-next-line camelcase
        nr_referencia: oValores.nr_referencia, 
        descricao: oValores.descricao, 
        data: oValores.data, 
        valor: oValores.valor
    });
    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log( `${sDateTimeStamp} > CHANGE Conta ID: ${oValores.conta_id} Lanc: ${oValores._id}` );
    }

    deleteLancamentoCategoria(oValores._id, ()=>{} );

    if (oValores.categoria_id !== "") {
        newLancamentoCategoria(oValores._id, oValores.categoria_id, ()=>{});
    }
    readLancamento(oValores._id, fnCallbackRender);

}

function deleteLancamentoCategoria (sLancId, fnCallbackRender) {

    let sql = `DELETE FROM lancamento_categoria WHERE lancamento_id = @lancamento_id`;

    let cDelete = db.prepare(sql);
    let info = cDelete.run({
        // eslint-disable-next-line camelcase
        lancamento_id: sLancId
    });

    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log(`${sDateTimeStamp} > DELETE Lancamento-Categoria: LancId: ${sLancId} `);
    }

    fnCallbackRender(info);
}

function deleteLancamento (sConta, sLancId, fnCallbackRender) {

    let sql = `DELETE FROM lancamentos WHERE conta_id = @conta_id AND _id = @id`;

    let cDelete = db.prepare(sql);
    let info = cDelete.run({
        id: sLancId, 
        // eslint-disable-next-line camelcase
        conta_id: sConta 
    });

    if (info) {
        var sDateTimeStamp = new Date().toISOString();
        console.log(sDateTimeStamp + " > DELETE Conta ID:" + sConta + " Lanc: " + sLancId );
    }

    fnCallbackRender(info);

}

function parseFile(oFile, fnCallbackRender) {

    // var oOutObj = parseFileCSV(oFile.data.toString());
    var oOutObj = parseFileExcel(oFile);

    fnCallbackRender(oOutObj);
}

const openAndParseFile = async (fnCallbackRender) => {
    const { dialog } = require('electron')
    const fs = require('fs');
    const files = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (files.filePaths[0]) {
        parseFile(
            fs.readFileSync(files.filePaths[0]), 
            fnCallbackRender);
    }
}

function parseFileExcel(oFile)  {
    const XLSX = require("XLSX");

    var wb = XLSX.read(oFile, {type: "buffer"});

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

// function parseFileCSV(sFileString) {
//     var oOutObj = {};
//     var aLines = sFileString.split("\r\n");
    
//     for (var iIndLine in aLines) { 
//         var aValues =  aLines[iIndLine].split(";");
//         var oParsedLine = {}
//         for (var iIndValue in aValues) {
//             oParsedLine[iIndValue] = aValues[iIndValue];
//         }
//         oOutObj[iIndLine] = oParsedLine;
//     }
//     return oOutObj;
// }

module.exports = {
    connect: connect,

    getContas: getContas,
    getContasTipos: getContasTipos,
    getLancamentos: getLancamentos,
    getCategorias: getCategorias,
    getVisaoMensal: getVisaoMensal,
    newConta: newConta,
    newLancamento: newLancamento,
    newCategoria: newCategoria,
    changeConta: changeConta,
    changeLancamento: changeLancamento,
    deleteLancamento: deleteLancamento,
    readConta: readConta,
    openAndParseFile: openAndParseFile,
    parseFile: parseFile
}
