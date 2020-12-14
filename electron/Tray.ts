import * as electron from 'electron';

interface TrayOptions {
  onShowDevbookClick: () => void;
  onOpenAtLoginClick: () => void;
  openPreferences: () => void;
  onQuitClick: () => void;
  shouldOpenAtLogin: boolean;
  version: string;
  restartAndUpdate: () => void;
  isUpdateAvailable: boolean;
}

class Tray {
  private tray: electron.Tray;
  private contextMenu: electron.Menu | undefined;

  private shouldOpenAtLogin = false;
  private isUpdateAvailable = false;

  public constructor(icon: electron.NativeImage, private opts: TrayOptions) {
    this.tray = new electron.Tray(icon);
    this.tray.setIgnoreDoubleClickEvents(true);

    this.shouldOpenAtLogin = opts.shouldOpenAtLogin;
    this.isUpdateAvailable = opts.isUpdateAvailable;

    this.buildContextMenu();
    this.setContextMenu();

    this.tray.on('click', () => {
      if (this.contextMenu) {
        this.tray.setContextMenu(this.contextMenu)
      }
    });
  }

  private setContextMenu() {
    if (this.contextMenu) {
      this.tray.setContextMenu(this.contextMenu);
    }
  }

  private buildContextMenu() {
    this.contextMenu = electron.Menu.buildFromTemplate([
      {
        click: this.opts.onShowDevbookClick,
        label: 'Show Devbook',
      },
      {
        click: this.opts.onOpenAtLoginClick,
        type: 'checkbox',
        label: 'Should open at login',
        checked: this.shouldOpenAtLogin,
      },
      {
        click: this.opts.openPreferences,
        label: 'Preferences',
      },
      {
        click: this.opts.onQuitClick,
        label: 'Quit',
        role: 'quit',
      },
      { type: 'separator' },
      {
        type: 'normal',
        label: this.isUpdateAvailable ? 'Restart && Update' : 'v' + this.opts.version,
        click: this.opts.restartAndUpdate,
        enabled: this.isUpdateAvailable,
      }
    ]);
  }

  public setOpenAtLogin(checked: boolean) {
    if (this.contextMenu) {
      this.shouldOpenAtLogin = checked;
      this.buildContextMenu();
      this.setContextMenu();
    }
  }

  public setIsUpdateAvailable(isUpdateAvailable: boolean) {
    if (this.contextMenu) {
      this.isUpdateAvailable = isUpdateAvailable;
      this.buildContextMenu();
      this.setContextMenu();
    }
  }
}

export default Tray;
