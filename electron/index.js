const { join } = require('path');
//const ROOT_URL = `http://localhost:9990/index.html`

// const ROOT_URL = join(__dirname, '..', 'webapp', 'index.html');
const ROOT_URL = join(__dirname, '..', 'dist', 'index.html');

const { ipcMain, app, BrowserWindow } = require('electron');

/* prevent App launching after install */
if (require('electron-squirrel-startup')) app.quit();

const db = require(join(__dirname, '..', 'db', 'create_db.js'));

/* Create DB Structure */
db.createDataBaseFromFile();

let mainWindow;

// linha abaixo nao funciona, mas talvez no futuro
app.commandLine.appendSwitch('lang', 'pt-br');

const createWindow = () => { 
  'use strict'

  try {

    console.log("> Locale: " + app.getLocale());

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 800,
      webPreferences: {
        nodeIntegration: true
      }
  //    show: false
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
    
    // console.log(new Date().toISOString() + `: ABRE DEV Tools`);
    // devtools = new BrowserWindow();
    // mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    // mainWindow.webContents.openDexevTools({ mode: 'detach' });  
    
  // não funciona o codigo abaixo quando é chamado da rede dentro da VM (fix acima)
  //  mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  //  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //  Menu.setApplicationMenu(mainMenu);
  } catch (err) {
    app.quit();  
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// const mainMenuTemplate = [
//   { label: 'File', 
//     submenu: [ 
//       {
//         label: '&Add Item',
//         accelerator: 'Alt+a',
//         click() {
//           console.log("Abrir DEVTOOLS");
//           mainWindow.webContents.openDevTools(); }
//       },
//       {
//         label: '-'
//       },
//       {
//         label: 'Sair',
//         click() {
//           app.quit();
//         }
//       },
//   ] 
//   },
//   { label: 'DevTools' }  
// ]

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  'use strict'
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  'use strict'
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//const ipc = app.ipcMain;

ipcMain.on("go-back-button", () => {
  'use strict'
  mainWindow.webContents.goBack(); 
});

