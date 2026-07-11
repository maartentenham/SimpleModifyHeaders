/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Built-in header presets.
 *
 * Each preset bundles one or more header rules using the exact same shape
 * as a row in the main config table (see appendLine() / create_configuration_data()
 * in config.js), so a preset's headers can be dropped straight into the
 * table with no conversion.
 *
 * To add your own built-in preset, just push another object onto this array.
 */
const BUILTIN_PRESETS = [
    {
        id: 'builtin-cors-allow-all',
        name: 'Allow CORS (any origin)',
        description: 'Adds Access-Control-Allow-Origin: * on responses',
        builtin: true,
        headers: [
            {
                action: 'add',
                header_name: 'Access-Control-Allow-Origin',
                header_value: '*',
                apply_on: 'res',
                comment: 'CORS preset',
                url_contains: '',
                status: 'on'
            }
        ]
    },
    {
        id: 'builtin-mobile-safari-ua',
        name: 'Mobile Safari User-Agent',
        description: 'Rewrites User-Agent to look like an iPhone running Safari',
        builtin: true,
        headers: [
            {
                action: 'modify',
                header_name: 'User-Agent',
                header_value:
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
                apply_on: 'req',
                comment: 'Mobile UA preset',
                url_contains: '',
                status: 'on'
            }
        ]
    },
    {
        id: 'builtin-strip-referer',
        name: 'Strip Referer',
        description: 'Removes the Referer header from requests',
        builtin: true,
        headers: [
            {
                action: 'delete',
                header_name: 'Referer',
                header_value: '',
                apply_on: 'req',
                comment: 'Privacy preset',
                url_contains: '',
                status: 'on'
            }
        ]
    },
    {
        id: 'builtin-no-cache',
        name: 'No Cache',
        description: 'Forces responses not to be cached',
        builtin: true,
        headers: [
            {
                action: 'add',
                header_name: 'Cache-Control',
                header_value: 'no-cache, no-store, must-revalidate',
                apply_on: 'res',
                comment: 'No-cache preset',
                url_contains: '',
                status: 'on'
            },
            {
                action: 'add',
                header_name: 'Pragma',
                header_value: 'no-cache',
                apply_on: 'res',
                comment: 'No-cache preset',
                url_contains: '',
                status: 'on'
            }
        ]
    },
    {
        id: 'builtin-bearer-token',
        name: 'Bearer Token Placeholder',
        description: 'Adds an Authorization: Bearer header - edit the value after applying',
        builtin: true,
        headers: [
            {
                action: 'add',
                header_name: 'Authorization',
                header_value: 'Bearer <token>',
                apply_on: 'req',
                comment: 'Auth preset',
                url_contains: '',
                status: 'on'
            }
        ]
    }
];
