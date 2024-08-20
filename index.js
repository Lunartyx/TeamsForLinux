const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const iconPath = path.join(__dirname, 'assets', 'Microsoft_Teams.png');
console.log('Icon Path:', iconPath);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false, // Ensure nodeIntegration is disabled for security
        },
    });

    // Load Microsoft Teams web app
    mainWindow.loadURL('https://teams.microsoft.com/v2/?clientexperience=t2');

    // Handle new window event (like 2FA pop-ups)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        const authWindow = new BrowserWindow({
            width: 500,
            height: 600,
            parent: mainWindow, // Set the parent window
            modal: true, // Make it a modal window
            icon: iconPath,
            webPreferences: {
                nodeIntegration: false, // Disable nodeIntegration for security
                contextIsolation: true,
            },
        });

        authWindow.loadURL(url);

        authWindow.on('closed', () => {
            authWindow = null;
        });

        return { action: 'deny' }; // Prevent Electron from opening the URL in a default manner
    });

    // Optionally, remove the menu bar
    mainWindow.removeMenu();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
