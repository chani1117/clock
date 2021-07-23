const {app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path')
const url = require('url')
const scripts = require('./script.js');



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win



function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    // backgroundColor: "rgba(0,0,0,0.2)",
    titleBarStyle: 'customButtonsOnHover',
    alwaysOnTop: true,
    width: 640,
    height: 175,
    frame: false,
    transparent: true,
    x: 0,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })


}

app.on('browser-window-focus', function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log('control r')
      if(win!=null)win.reload();
  });
  globalShortcut.register("F5", () => {
    console.log('f5')
      if(win!=null)win.reload();
  });
});

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})


ipcMain.on('insert', (event, arg, arg2) => {
  console.log("=================main.js=================");
  scripts.insert(arg, arg2);
});

ipcMain.on('chAddCharName',(evt,payload)=>{
  console.log(payload)
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.);
