/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0
 */

/* exported init */

const GETTEXT_DOMAIN = 'brightness_controller';

const { GObject, St, GLib } = imports.gi;
const ByteArray = imports.byteArray;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

/**
 * Helper function to get a list of connected outputs using xrandr.
 * Returns an array of output names.
 */
function getConnectedOutputs() {
    // Run the command to query xrandr.
    let [ok, stdout] = GLib.spawn_command_line_sync("xrandr --query");
    if (!ok) {
        log("Failed to run xrandr --query");
        return [];
    }

    // Convert the output from a byte array to a string.
    let output = ByteArray.toString(stdout);
    let lines = output.split('\n');
    let outputs = [];
    for (let line of lines) {
        // Look for lines that indicate a connected output.
        if (line.includes(" connected ")) {
            let parts = line.split(" ");
            outputs.push(parts[0]);
        }
    }
    return outputs;
}

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Brightness Controller'));

        // Create an icon that matches brightness control.
        let icon = new St.Icon({
            icon_name: 'display-brightness-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(icon);

        // Get the connected outputs via xrandr.
        let outputs = getConnectedOutputs();
        if (outputs.length === 0) {
            // If no outputs are found, provide a fallback.
            outputs = ["default"];
        }

        // Create a menu item (label + slider) for each output.
        outputs.forEach((outputName) => {
            // Label for the output.
            let labelItem = new PopupMenu.PopupMenuItem(outputName, { reactive: false });
            this.menu.addMenuItem(labelItem);

            // Slider for brightness. Initialize slider to 1.0 (100% brightness).
            let sliderItem = new PopupMenu.PopupSliderMenuItem(1.0);
            sliderItem.connect('value-changed', (slider, value) => {
                // The xrandr brightness value ranges from 0.0 to 1.0.
                let command = `xrandr --output ${outputName} --brightness ${value}`;
                log(`Setting brightness for ${outputName} to ${value}`);
                // Execute the xrandr command asynchronously.
                GLib.spawn_command_line_async(command);
            });
            this.menu.addMenuItem(sliderItem);
        });
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
