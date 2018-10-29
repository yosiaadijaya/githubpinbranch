// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Saves options to chrome.storage
function save_options() {
    var exact = document.getElementById('exact').textContent;
    var prefix = document.getElementById('prefix').textContent;
    var hideUnpinned = document.getElementById('hide-unpinned').checked;
    var d = new Date();
    
    var exac = [];
    var pref = [];

    exac = exact.split(",");
    exac.forEach(function (item, index) {
        exac[index] = item.trim();
    });
    pref = prefix.split(',');
    pref.forEach(function (item, index) {
        pref[index] = item.trim();
    });

    var parsed = {
        exact: exac,
        prefix: pref,
    };

    chrome.storage.sync.set({
        exact: exact,
        prefix: prefix,
        parsed: parsed,
        lastUpdate: d.getTime(),
        hideUnpinned: hideUnpinned,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 1800);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        exact: 'develop, staging, master, production',
        prefix: 'f_yosia, b_yosia',
        hideUnpinned: true

    }, function (items) {
        document.getElementById('exact').textContent = items.exact;
        document.getElementById('prefix').textContent = items.prefix;
        document.getElementById('hide-unpinned').checked = items.hideUnpinned;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented) {
        return;
    }

    var key = event.key || event.keyCode;
    if (key === 's' && event.ctrlKey) {
        save_options();
    }
});