const { St, Clutter, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let panelButton;
let buttonLabel;
let monitorsChangedSignal;

function getMonitors() {
    return Main.layoutManager.monitors;
}
function updateMonitorCountLabel() {
    const monitors = getMonitors();
    buttonLabel.set_text(`Monitors: ${monitors.length}`);
}

/**
 * Clear the existing popup menu items and re-populate them, creating
 * one item (icon + slider) per monitor.
 */
function rebuildPopupMenu() {
    // Remove any existing items from the popup menu
    panelButton.menu.removeAll();
    const monitors = getMonitors();
    for (let i = 0; i < monitors.length; i++) {
        // Create a new PopupBaseMenuItem for each monitor
        const menuItem = new PopupMenu.PopupBaseMenuItem();
        // Horizontal box to hold icon, label, and slider
        let hbox = new St.BoxLayout({ vertical: false, x_expand: true });
        // Icon (using a symbolic icon name; you can choose any icon you like)
        let icon = new St.Icon({
            icon_name: 'display-brightness-symbolic',
            style_class: 'popup-menu-icon'  // ensures consistent sizing
        });
        hbox.add_child(icon);
        // Optional label: Monitor # (or you could show more info)
        let label = new St.Label({
            text: `Screen ${i + 1}`,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true  // push slider to the right
        });
        hbox.add_child(label);

        // Create a slider (0.0 to 1.0 by default)
        let slider = new Slider.Slider(0.5);
        // Listen for changes
        slider.connect('notify::value', (obj) => {
            let percentage = Math.round(obj.value * 100);
            log(`Screen ${i+1}: slider changed to ${percentage}%`);
            // Here is where you'd set brightness or do something per monitor
        });
        hbox.add_child(slider);

        // Add our hbox into the popup menu item
        menuItem.actor.add_child(hbox);

        // Add the menu item to the panel button’s menu
        panelButton.menu.addMenuItem(menuItem);
    }
}

/**
 * Called when the extension is enabled.
 */
function enable() {
    // Create the panel button
    panelButton = new PanelMenu.Button(0.0, 'Monitor Count', false);
    // Create a label for the top bar button
    buttonLabel = new St.Label({
        text: 'Monitors: 0',
        y_align: Clutter.ActorAlign.CENTER
    });
    panelButton.add_child(buttonLabel);
    // Add the button to the top bar
    Main.panel.addToStatusArea('monitorCount', panelButton);
    // Connect to "monitors-changed" so we update the label dynamically
    monitorsChangedSignal = Main.layoutManager.connect('monitors-changed', () => {
        updateMonitorCountLabel();
        rebuildPopupMenu();
    });
    // Adjust menu position when shown
    panelButton.menu.connect('open-state-changed', (menu, isOpen) => {
        if (isOpen) {
            setPopupMenuPosition();
        }
    });

    // Initialize
    updateMonitorCountLabel();
    rebuildPopupMenu();
}


function setPopupMenuPosition() {
    if (!panelButton || !panelButton.menu) return;

    let buttonBox = panelButton.actor.get_transformed_position();
    let buttonWidth = panelButton.actor.get_transformed_size()[0];

    let menuBox = panelButton.menu.box.get_transformed_size();
    let menuWidth = menuBox ? menuBox[0] : 0;

    // Calculate new X position to center the popup
    let newX = buttonBox[0] + (buttonWidth / 2) - (menuWidth / 2);

    // Set the new position manually
    panelButton.menu.set_position(newX, buttonBox[1] + buttonWidth);
}
