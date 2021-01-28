const HTTP_PORT = '9990';
const HTTP_SERVER_NAME = 'localhost';

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const nStatic = require('node-static');
const path = require('path');
const resources_path = path.normalize(`${__dirname}/../dist/resources`);
// Para produtivo usar diretorio dist
const files_path = path.normalize(`${__dirname}/../dist`);
// const files_path = path.normalize(`${__dirname}/../webapp`);
const file = new nStatic.Server(files_path);

const web_services = require(path.join(__dirname, "web_services"));
web_services.connect();
//console.log(`Root Path: ${files_path}`);

function startServerUsingRoutes() {
    const { Router } = require("electron-routes");
    const api = new Router();
    const fs = require("fs");
    //const express = require("express");

    //app.use(express.static(files_path));
    //api.get('/resources', express.static(resources_path));

    api.get('/', (req, res) => {
        const fURL = join(files_path, req.url);
        const fileContent = fs.readFileSync(fURL);
        res.end(fileContent);
    });

    api.get('/resources', (req, res) => {
        const fURL = join(files_path, req.url);
        const fileContent = fs.readFileSync(fURL);
        res.end(fileContent);
    });

    api.get("/contas", (req, res) => {
        web_services.getContas(callbackRender);
        
        function callbackRender(aContas) {
           res.json(aContas); 
        }
    });
}

function startServerUsingExpress() {
    const express = require("express");
    const app = express();

    /* BodyParser - init  */
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    /* BodyParser - end  */

    /* FileUpload - init  */
    app.use(fileUpload({
        createParentPath: true
    }));
    /* FileUpload - end  */

    app.use(express.static(files_path));
    app.use('/resources', express.static(resources_path));

    app.listen(HTTP_PORT, () => console.log(`Server on ${HTTP_SERVER_NAME}:${HTTP_PORT}!`));

/******************************************************/
/* SERVICOS                                           */
/******************************************************/

    app.get("/contas", (req, res) => {
        web_services.getContas(callbackRender);
        
        function callbackRender(aContas) {
           res.json(aContas); 
        }
    });

    app.get("/contas_tipos", (req, res) => {
        web_services.getContasTipos(callbackRender);
        
        function callbackRender(aContas) {
           res.json(aContas); 
        }
    });

    app.all("/conta/:cnt", (req, res) => {
        if (req.method === "GET") {
            web_services.readConta(req.params.cnt, callbackRender);
        } else if (req.method === "POST") {
            web_services.changeConta(req.body, callbackRender);
        }        
        function callbackRender(oConta) {
           res.json(oConta); 
        }
    });

    app.get("/conta/:cnt/visao_mensal", (req, res) => {
        web_services.getVisaoMensal({conta_id: req.params.cnt}, callbackRender);
        
        function callbackRender(oConta) {
           res.json(oConta); 
        }
    });

    app.post("/upload", (req, res) => {
        if(!req.files) {
            res.send({
                status: false,
                message: 'Nenhum arquivo enviado.'
            });
        } else {
            var oFirstFile = req.files[Object.keys(req.files)[0]];
            web_services.parseFile(oFirstFile, callbackRender);
        }
        function callbackRender(aResponseJSON) {
            res.json(aResponseJSON); 
        }
    });

    app.all("/conta/:cnt/lancamentos", (req, res) => {
        if (req.method === "GET") {
            web_services.getLancamentos(req.params.cnt, req.query, callbackRender);
        } else if (req.method === "POST") {
            web_services.newLancamento(req.body, callbackRender);
        }
        function callbackRender(aResponseJSON) {
            res.json(aResponseJSON); 
        }
    });

    app.all("/conta/:cnt/lancamento/:lanc", (req, res) => {
        if (req.method === "POST") {
            web_services.changeLancamento(req.body, callbackRender);
        } else if (req.method === "DELETE") {
            web_services.deleteLancamento(req.params.cnt, req.params.lanc, callbackRender);
        }
        
        function callbackRender(aResponseJSON) {
           res.json(aResponseJSON); 
        }
    });      

    app.all("/categorias", (req, res) => {
        if (req.method === "GET") {
            web_services.getCategorias(callbackRender);
        } else if (req.method === "POST") {
            web_services.newCategoria(req.body, callbackRender);
        }
        function callbackRender(aResponseJSON) {
            res.json(aResponseJSON); 
        }
    });

}

module.exports = {
    startServer: startServerUsingRoutes // startServerUsingExpress
    
}
