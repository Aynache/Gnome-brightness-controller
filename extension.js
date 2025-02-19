const { St, Clutter, GObject, Meta, Gio, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const Mainloop = imports.mainloop;

const MonitorExtension = GObject.registerClass(
class MonitorExtension extends PanelMenu.Button {

    _init () {
        super._init(0.5, "Monitor Count");
        this._monitors = this._getMonitors();

        this.indicatorText = new St.Label({
            text: _("Monitors: " + this._monitors.length),
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.indicatorText);

        this._monitorItems = {};

        this._buildMenu();
        this._refresh();

        this._monitorsChangedSignal = Main.layoutManager.connect('monitors-changed', () => {
            this._reloadMonitorInfo();
        });
    }

    _buildMenu () {
        this.menu.removeAll();
        this.menu.actor.set_width(this.menu.actor.get_width() * 1.3);

        let headerMenuItem = new PopupMenu.PopupMenuItem(_("Monitor Info :"), {
            reactive: true, hover: false, activate: false
        });
        let bin = new St.Bin({
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
        });

        this._monitorLabel = new St.Label({ text: 'Monitor Count: ' + this._monitors.length });
        bin.add_actor(this._monitorLabel);
        headerMenuItem.actor.add_actor(bin);
    
        this.menu.addMenuItem(headerMenuItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._monitorItems = {};
        
        for (let i = 0; i < this._monitors.length; i++) {
            let monitorName = `Display ${i + 1}`;
            let monitorMenuItem = new PopupMenu.PopupMenuItem(_(monitorName), {
                reactive: true, hover: false, activate: false
            });
    
            let bin = new St.Bin({
                x_expand: true,
                x_align: Clutter.ActorAlign.END,
            });
    
            let monitorLabel = new St.Label();
            bin.add_actor(monitorLabel);
    
            monitorMenuItem.actor.add_actor(bin);
            this.menu.addMenuItem(monitorMenuItem);

            let sliderMenuItem = new PopupMenu.PopupMenuItem("", {
                reactive: false
            });
            let slider = new Slider.Slider(0.5);
            sliderMenuItem.actor.add(slider);
            this.menu.addMenuItem(sliderMenuItem);

            this._monitorItems[i] = {
                menuItem: monitorMenuItem,
                sliderMenuItem: sliderMenuItem,
                label: monitorLabel,
                slider: slider
            };
        }
    }

    _refresh () {
        this._reloadMonitorInfo();
        this._removeTimeout();
        this._timeout = Mainloop.timeout_add_seconds(60, this._refresh.bind(this));
        return true;
    }

    _reloadMonitorInfo () {
        this._monitors = this._getMonitors();
        this._monitorLabel.text = 'Monitor Count: ' + this._monitors.length;
        this.indicatorText.set_text("Monitors: " + this._monitors.length);
        this._buildMenu();
    }

    _getMonitors () {
        return Main.layoutManager.monitors;
    }

    _removeTimeout () {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }
    }
    
    stop () {
        if (this._timeout)
            Mainloop.source_remove(this._timeout);
        this._timeout = undefined;

        Main.layoutManager.disconnect(this._monitorsChangedSignal);
        this.menu.removeAll();
    }
        
});

let menuMonitor;

function enable() {
    menuMonitor = new MonitorExtension();
    Main.panel.addToStatusArea('monitor-indicator', menuMonitor);
}

function disable() {
    if (menuMonitor) {
        menuMonitor.stop();
        menuMonitor.destroy();
        menuMonitor = null;
    }
}
