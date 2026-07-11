/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * PRESETS MANAGEMENT
 *
 * A preset is a named, reusable bundle of one or more header rules (same
 * shape as a row in the main config table) that can be applied on top of
 * whatever configuration is already loaded, without replacing it.
 *
 * Built-in presets come from BUILTIN_PRESETS (presets-data.js).
 * Custom presets are stored in chrome.storage.local under the 'presets' key,
 * as a JSON array, kept separate from the main 'config' key so applying or
 * deleting a preset never touches the user's existing rules.
 *
 * Row selection for "save as preset" reuses the existing per-row "Export"
 * toggle button on the main screen (setExportButtonStatus / getButtonStatus
 * in config.js) rather than introducing a new selection UI.
 */

function initPresetsScreen() {
    document.getElementById('presets_button').addEventListener('click', function () {
        showPresetsScreen();
    });
    document.getElementById('exit_presets_screen_button').addEventListener('click', function () {
        hidePresetsScreen();
    });
    document.getElementById('save_preset_button').addEventListener('click', function () {
        openSavePresetDialog();
    });
    document.getElementById('cancel_save_preset_button').addEventListener('click', function () {
        closeSavePresetDialog();
    });
    document.getElementById('confirm_save_preset_button').addEventListener('click', function () {
        confirmSavePreset();
    });
}

function showPresetsScreen() {
    document.getElementById('main_screen').hidden = true;
    document.getElementById('presets_screen').hidden = false;
    renderPresetsList();
}

function hidePresetsScreen() {
    document.getElementById('main_screen').hidden = false;
    document.getElementById('presets_screen').hidden = true;
    closeSavePresetDialog();
}

/**
 * Load custom presets from storage and merge them with the built-in ones.
 * callback receives a single combined array.
 **/
function loadPresets(callback) {
    loadFromBrowserStorage(['presets'], function (result) {
        callback(BUILTIN_PRESETS.concat(loadCustomPresetsFromResult(result)));
    });
}

function loadCustomPresetsFromResult(result) {
    if (!result.presets) return [];
    try {
        return JSON.parse(result.presets);
    } catch (error) {
        console.log(error);
        return [];
    }
}

function storeCustomPresets(customPresets, callback) {
    storeInBrowserStorage({presets: JSON.stringify(customPresets)}, callback);
}

/** Escape user-provided text before inserting it as HTML **/
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

/** Build the list of presets shown on the presets screen **/
function renderPresetsList() {
    const tbody = document.getElementById('presets_tab');
    tbody.innerHTML = '';
    loadPresets(function (presets) {
        presets.forEach((preset) => {
            const headerSummary = preset.headers
                .map((h) => h.header_name + (h.action === 'delete' ? ' (delete)' : ''))
                .join(', ');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:left">${escapeHtml(preset.name)}</td>
                <td style="text-align:left">${escapeHtml(preset.description)}</td>
                <td style="text-align:left">${escapeHtml(headerSummary)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm apply-preset-btn">
                        <span class="glyphicon glyphicon-plus"></span> Apply
                    </button>
                </td>
                <td>
                    ${
                        preset.builtin
                            ? ''
                            : '<button type="button" class="btn btn-default btn-sm delete-preset-btn"><span class="glyphicon glyphicon-trash"></span></button>'
                    }
                </td>
            `;
            tr.querySelector('.apply-preset-btn').addEventListener('click', function () {
                applyPreset(preset);
            });
            const deleteBtn = tr.querySelector('.delete-preset-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function () {
                    deletePreset(preset.id);
                });
            }
            tbody.appendChild(tr);
        });
    });
}

/**
 * Apply a preset: append its header rule(s) as new rows in the main config
 * table. This only touches the in-page table - like adding a line manually,
 * the user still needs to click "Save" on the main screen to persist and
 * activate it.
 **/
function applyPreset(preset) {
    preset.headers.forEach((h) => {
        appendLine(
            h.url_contains || '',
            h.action,
            h.header_name,
            h.header_value,
            h.comment || '',
            h.apply_on,
            h.status || 'on'
        );
    });
    reshapeTable();
    hidePresetsScreen();
}

function openSavePresetDialog() {
    document.getElementById('save_preset_dialog').hidden = false;
}

function closeSavePresetDialog() {
    document.getElementById('save_preset_dialog').hidden = true;
    document.getElementById('new_preset_name').value = '';
    document.getElementById('new_preset_description').value = '';
}

/**
 * Collect the rows currently marked "To export" on the main screen and
 * save them as a new custom preset.
 **/
function confirmSavePreset() {
    const name = document.getElementById('new_preset_name').value.trim();
    if (!name) {
        alert('Please enter a name for the preset');
        return;
    }
    const description = document.getElementById('new_preset_description').value.trim();

    const tr_elements = document.querySelectorAll('#config_tab tr');
    const headers = [];
    for (let i = 0; i < tr_elements.length; i++) {
        if (getButtonStatus(tr_elements[i].children[7].children[0]) === 'on') {
            headers.push({
                url_contains: tr_elements[i].children[0].children[0].value,
                action: tr_elements[i].children[1].children[0].value,
                header_name: tr_elements[i].children[2].children[0].value,
                header_value: tr_elements[i].children[3].children[0].value,
                comment: tr_elements[i].children[4].children[0].value,
                apply_on: tr_elements[i].children[5].children[0].value,
                status: 'on'
            });
        }
    }

    if (headers.length === 0) {
        alert('No rows are selected. Check the "Export" column on the rows you want to include, then try again.');
        return;
    }

    const preset = {
        id: 'custom-' + Date.now(),
        name: name,
        description: description,
        builtin: false,
        headers: headers
    };

    loadFromBrowserStorage(['presets'], function (result) {
        const custom = loadCustomPresetsFromResult(result);
        custom.push(preset);
        storeCustomPresets(custom, function () {
            closeSavePresetDialog();
            renderPresetsList();
        });
    });
}

function deletePreset(id) {
    if (!window.confirm('Delete this preset?')) return;
    loadFromBrowserStorage(['presets'], function (result) {
        const custom = loadCustomPresetsFromResult(result).filter((p) => p.id !== id);
        storeCustomPresets(custom, function () {
            renderPresetsList();
        });
    });
}
