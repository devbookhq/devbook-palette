import * as electron from 'electron';

interface TrayOptions {
  onShowSidekickClick: () => void;
  onOpenAtLoginClick: () => void;
  onSignOutClick: () => void;
  onQuitClick: () => void;
  shouldOpenAtLogin: boolean;
}

class Tray {
  tray: electron.Tray;
  contextMenu: electron.Menu | undefined;

  public constructor(icon: electron.NativeImage, private opts: TrayOptions) {
    this.tray = new electron.Tray(icon);
    this.tray.setIgnoreDoubleClickEvents(true);

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
        click: this.opts.onShowSidekickClick,
        label: 'Show Sidekick',
      },
      {
        click: this.opts.onOpenAtLoginClick,
        type: 'checkbox',
        label: 'Should open at login',
        checked: this.opts.shouldOpenAtLogin,
      },
      {
        click: this.opts.onSignOutClick,
        label: 'Sign Out',
      },
      {
        click: this.opts.onQuitClick,
        label: 'Quit',
        role: 'quit',
      },
    ]);
  }

  public setOpenAtLogin(checked: boolean) {
    if (this.contextMenu) {
      this.contextMenu.items[0].checked = checked;
      this.setContextMenu();
    }
  }
}

export default Tray;