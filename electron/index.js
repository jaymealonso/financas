/* eslint-disable strict */
const { ipcMain, app, BrowserWindow } = require('electron');
require('dotenv').config();
const { join } = require('path');
const db = require(join(__dirname, 'create_db.js'));
/*
  // linha abaixo nao funciona, mas talvez no futuro
  app.commandLine.appendSwitch('lang', 'pt-br');
*/

let mainWindow;

const createWindow = async () => { 
  try {

    /* prevent App launching after install */
    if (require('electron-squirrel-startup')) return app.quit();

    console.log(`Ambiente definido para: ${process.env.ENVIROMENT}`);
    const rootdir = process.env.ENVIROMENT === 'dev' ? 'webapp' :  'dist'
    const ROOT_URL = join(__dirname, '..', rootdir, 'index.html');

    console.log("> Locale: " + app.getLocale());

    /* Create DB Structure - se não existir já */
    db.createDataBaseFromFile();

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 800,
      webPreferences: {
        nodeIntegration: true
      }
    });

    mainWindow.show();

    mainWindow.once('ready-to-show', () => {
      console.log(new Date().toISOString() + `: Disparou ready-to-show!`);
    });

    mainWindow.webContents.on('did-finish-load', () => {
      console.log(new Date().toISOString() + `: Disparou did-finish-load!`);
    });

    console.log(new Date().toISOString() + `: Carregando pagina HTTP - loadURL: ` + ROOT_URL);
    mainWindow.loadURL(ROOT_URL);
    
    if (process.env.OPEN_DEV_TOOLS === "true") {
      console.log(new Date().toISOString() + `: ABRE DEV Tools`);
      //devtools = new BrowserWindow();
      //mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
      //mainWindow.webContents.openDexevTools({ mode: 'detach' });  
      // nÃ£o funciona o codigo abaixo quando Ã© chamado da rede dentro da VM (fix acima)
      mainWindow.webContents.openDevTools({ activate: false });
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  //  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //  Menu.setApplicationMenu(mainMenu);
    return 1;
  } catch (err) {
    return app.quit();  
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//const ipc = app.ipcMain;
ipcMain.on("go-back-button", () => {
  mainWindow.webContents.goBack(); 
});

