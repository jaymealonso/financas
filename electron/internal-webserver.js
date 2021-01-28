
const { join } = require("path");
const fs = require("fs");
const { protocol } = require("electron");
const { PassThrough } = require('stream');

const web_services = require(join(__dirname, "web_services"));


module.exports = {
    interceptFileProt: () => {
        console.log("Register Intercept FILE");
        protocol.interceptFileProtocol("file", (request, callback) => {

            if (request.url.search("contas") > 0) {

                function fnCB(rows) {

                    const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
                    const result = `[${rows_str}]`;

                    callback({
                        mimeType: "application/json",
                        data: result
                    });
                }

                web_services.getContas(fnCB);

            } else {

                const url = request.url
                    .replace("file:///", "")  /* all urls start with 'file://' */
                    .replace(/\?.*/, "");

                console.log(`Intercepted! ${request.url} >>> ${url}`);
                const callbURL = join(url);
                console.log(`Normalized to ${callbURL}`);

                callback({ path: callbURL })
            }
        }, (err) => {
            if (err) console.error('Failed to register protocol') 
        })
    },
    interceptHttpProt: (serveFrom) => {
        console.log("Register Intercept HTTP");
        protocol.interceptHttpProtocol("http", (request, callback) => {

            const url = request.url
                .replace("http://localhost:9990/", "")  /* all urls start with 'file://' */
                .replace(/\?.*/, "");

            if (url.search("contas") > -1) {

                function fnCB(rows) {

                    const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
                    const result = `[${rows_str}]`;

                    callback({
                        mimeType: "application/json",
                        data: result
                    });
                }

                web_services.getContas(fnCB);
            } else if(url.search("resources") > -1) {
                console.log(`Intercepted! ${request.url} >>> ${url}`);
                const callbURL = join("file://", __dirname, "..", "dist", url);
                console.log(`Normalized to ${callbURL}`);

                callback({ url: callbURL });
            } else {

                console.log(`Intercepted! ${request.url} >>> ${url}`);
                const callbURL = join("file://", __dirname, serveFrom, url);
                console.log(`Normalized to ${callbURL}`);

                //const fileContent = fs.readFileSync(callbURL);

                callback({ url: callbURL });
            }
        }, (err) => {
            if (err) console.error('Failed to register protocol') 
        })
    },
    interceptStreamProt: (serveFrom) => {
        console.log("Register Intercept Stream HTTP");
        protocol.interceptStreamProtocol("http", (request, callback) => {
            const url = request.url
                .replace("http://localhost:9990/", "")  /* all urls start with 'file://' */
                .replace(/\?.*/, "");

            if (url.search("contas") > -1) {

                const createStream = (text) => {
                    const rv = new PassThrough() // PassThrough is also a Readable stream
                    rv.push(text)
                    rv.push(null)
                    return rv
                }

                web_services.getContas((rows) => {
                    const rows_str = rows.map(row => JSON.stringify(row) ).join(",");
                    const result = `[${rows_str}]`;

                    callback({
                        mimeType: "application/json",
                        data: createStream(result)
                    });
                });

            } else if(url.search("resources") > -1) {
                console.log(`Intercepted! ${request.url} >>> ${url}`);
                const callbURL = join(__dirname, "..", "dist", url);
                console.log(`Normalized to ${callbURL}`);

                callback(fs.createReadStream(callbURL));
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