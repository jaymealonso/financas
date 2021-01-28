const { join } = require("path");
const fs = require("fs");
const { protocol } = require("electron");
const { PassThrough } = require('stream');

const web_services = require(join(__dirname, "web_services"));

const createStream = (text) => {
    const rv = new PassThrough(); // PassThrough is also a Readable stream
    rv.push(text);
    rv.push(null);
    return rv;
}

const returnResources = (url, fnCallback, fnGetData) => {
    const callbURL = join(__dirname, "..", "dist", url);
    console.log(`Normalized to ${callbURL}`);

    fnCallback(fs.createReadStream(callbURL));
}

const returnJSON = (url, fnCallback, fnGetData) => {
    fnGetData((rows) => {
        const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
        const result = `[${rows_str}]`;

        fnCallback({
            mimeType: "application/json",
            data: createStream(result)
        });
    });
}

const routes = [
    { method: "GET", name: "resources", fnExec: returnResources, fnGetData: null },
    { method: "GET", name: "contas", fnExec: returnJSON, fnGetData: web_services.getContas },
    { method: "GET", name: "contas_tipos", fnExec: returnJSON, fnGetData: web_services.getContasTipos },
    { method: "GET", name: "categorias", fnExec: returnJSON, fnGetData: web_services.getCategorias },
    { method: "POST", name: "categorias", fnExec: returnJSON, fnGetData: web_services.getCategorias }    
];

const redirectToService = (method, url, fnCallback) => {
    const routeFound = routes.find((route) => url.startsWith(route.name) && method === route.method );
    if (routeFound) {
        routeFound.fnExec(url, fnCallback, routeFound.fnGetData);
        return true;
    } else {
        return false;
    }
}

module.exports = {
    // interceptFileProt: () => {
    //     console.log("Register Intercept FILE");
    //     protocol.interceptFileProtocol("file", (request, callback) => {

    //         if (request.url.search("contas") > 0) {

    //             function fnCB(rows) {

    //                 const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
    //                 const result = `[${rows_str}]`;

    //                 callback({
    //                     mimeType: "application/json",
    //                     data: result
    //                 });
    //             }

    //             web_services.getContas(fnCB);

    //         } else {

    //             const url = request.url
    //                 .replace("file:///", "")  /* all urls start with 'file://' */
    //                 .replace(/\?.*/, "");

    //             console.log(`Intercepted! ${request.url} >>> ${url}`);
    //             const callbURL = join(url);
    //             console.log(`Normalized to ${callbURL}`);

    //             callback({ path: callbURL })
    //         }
    //     }, (err) => {
    //         if (err) console.error('Failed to register protocol') 
    //     })
    // },
    // interceptHttpProt: (serveFrom) => {
    //     console.log("Register Intercept HTTP");
    //     protocol.interceptHttpProtocol("http", (request, callback) => {

    //         const url = request.url
    //             .replace("http://localhost:9990/", "")  /* all urls start with 'file://' */
    //             .replace(/\?.*/, "");

    //         if (url.search("contas") > -1) {

    //             function fnCB(rows) {

    //                 const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
    //                 const result = `[${rows_str}]`;

    //                 callback({
    //                     mimeType: "application/json",
    //                     data: result
    //                 });
    //             }

    //             web_services.getContas(fnCB);
    //         } else if(url.search("resources") > -1) {
    //             console.log(`Intercepted! ${request.url} >>> ${url}`);
    //             const callbURL = join("file://", __dirname, "..", "dist", url);
    //             console.log(`Normalized to ${callbURL}`);

    //             callback({ url: callbURL });
    //         } else {

    //             console.log(`Intercepted! ${request.url} >>> ${url}`);
    //             const callbURL = join("file://", __dirname, serveFrom, url);
    //             console.log(`Normalized to ${callbURL}`);

    //             //const fileContent = fs.readFileSync(callbURL);

    //             callback({ url: callbURL });
    //         }
    //     }, (err) => {
    //         if (err) console.error('Failed to register protocol') 
    //     })
    // },
    interceptStreamProt: (serveFrom) => {
        console.log("Register Intercept Stream HTTP");
        protocol.interceptStreamProtocol("http", (request, callback) => {
            const url = request.url
                .replace("http://localhost:9990/", "")  /* all urls start with 'file://' */
                .replace(/\?.*/, "");

            const redirected = redirectToService(request.method, url, callback);

            if (redirected) {
            // if (url.startsWith("contas")) {

            //     const createStream = (text) => {
            //         const rv = new PassThrough() // PassThrough is also a Readable stream
            //         rv.push(text)
            //         rv.push(null)
            //         return rv
            //     }

            //     web_services.getContas((rows) => {
            //         const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
            //         const result = `[${rows_str}]`;

            //         callback({
            //             mimeType: "application/json",
            //             data: createStream(result)
            //         });
            //     });

            // } else if(url.startsWith("resources")) {
            //     console.log(`Intercepted! ${request.url} >>> ${url}`);
            //     const callbURL = join(__dirname, "..", "dist", url);
            //     console.log(`Normalized to ${callbURL}`);

            //     callback(fs.createReadStream(callbURL));
            } else {

                console.log(`Intercepted! ${request.url} >>> ${url}`);
                const callbURL = join(__dirname, serveFrom, url);
                console.log(`Normalized to ${callbURL}`);

                //const fileContent = fs.readFileSync(callbURL);

                callback(fs.createReadStream(callbURL)); //  { url: callbURL });
            }
        });
    }    
}