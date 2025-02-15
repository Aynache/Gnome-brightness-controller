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

const { St, Clutter, GObject, Meta, Gio, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

let panelButton;
let buttonLabel;


function getBrightness() {
    try {
        let [success, stdout, stderr] = GLib.spawn_command_line_sync('python3 Monitors.py get');
        if (success) {
            let brightness = parseInt(stdout.toString().trim(), 10);
            log(`Current Brightness: ${brightness}`);
            return brightness;
        } else {
            logError(`Error: ${stderr.toString()}`);
            return null;
        }
    } catch (e) {
        logError(`Failed to run script: ${e}`);
        return null;
    }
}

function getMonitorCount() {
    let display = global.display;
    return display.get_n_monitors();
}

function updateButtonLabel() {
    let monitorCount = getMonitorCount();
    buttonLabel.set_text(`Brightness ${monitorCount}`);
}

function enable() {

    let brightness = getBrightness();
    log(`Brightness fetched: ${brightness}`);

    // Create a new panel menu button
    panelButton = new PanelMenu.Button(0.0, 'Brightness Controller', false);

    // Create a label for the button
    buttonLabel = new St.Label({
        text: 'Brightness',
        y_align: Clutter.ActorAlign.CENTER
    });

    // Update label with the number of monitors
    updateButtonLabel();

    panelButton.add_child(buttonLabel);

    // Create a slider inside a menu item
    let sliderMenuItem = new PopupMenu.PopupBaseMenuItem();
    let slider = new Slider.Slider(brightness);  // 0.5 means 50% initial value

    // Connect a callback to handle slider changes
    slider.connect('notify::value', () => { 
        let percentage = Math.round(slider.value * 100);
        log(`Slider value changed to: ${percentage}%`);
    });

    // Add the slider to the menu item, then add the item to the button's menu
    sliderMenuItem.actor.add_child(slider);
    panelButton.menu.addMenuItem(sliderMenuItem);

    // Add the button to the top bar (status area)
    Main.panel.addToStatusArea('BrightnessButton', panelButton);
}

function disable() {
    // Clean up
    if (panelButton) {
        panelButton.destroy();
        panelButton = null;
    }
}




