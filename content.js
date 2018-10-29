(function () {
    'use strict';

    var option = {};
    chrome.storage.sync.get({
        parsed: {
            exact: ['develop', 'staging', 'master'],
            prefix: ['f_yosia', 'b_yosia'],
        },
        lastUpdate: 0,
        hideUnpinned: true
    }, function (items) {
        option.parsed = items.parsed;
        option.lastUpdate = items.lastUpdate;
        option.hideUnpinned = items.hideUnpinned;
    });

    var lastToken;
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
            option[key] = changes[key].newValue;
            if (key == 'hideUnpinned') toggleUnpinned(lastToken);
        }
    });

    // from stackoverflow
    const addEventForChild = function (parent, eventName, childSelector, cb) {
        parent.addEventListener(eventName, function (event) {
            const clickedElement = event.target,
                matchingChild = clickedElement.closest(childSelector)
            if (matchingChild) cb(matchingChild)
        });
    };
    const collectBranch = function (scope, arr, mod) {
        var src = '';
        var i, j, q, el;
        for (var i = 0; i < arr.length; i++) {
            q = mod(arr[i])
            el = scope.querySelectorAll(q);
            for (j = 0; j < el.length; j++) {
                el[j].setAttribute('pinned', option.lastUpdate);
                el[j].classList.remove('d-none');
                src += el[j].outerHTML;
                el[j].remove();
            }
        }
        return src;
    };
    const toggleUnpinned = function (token) {
        if (!token) token = option.lastUpdate
        var unpinned = document.querySelectorAll('.select-menu a.select-menu-item:not([pinned="' + token + '"])')
        if (option.hideUnpinned) {
            for (var i = 0; i < unpinned.length; i++) {
                unpinned[i].classList.add('d-none');
            }
        } else {
            for (var i = 0; i < unpinned.length; i++) {
                unpinned[i].classList.remove('d-none');
            }
        }
    };
    // from stackoverflow
    const nthIndex = function (str, pat, n) {
        var L = str.length, i = -1;
        while (n-- && i++ < L) {
            i = str.indexOf(pat, i);
            if (i < 0) break;
        }
        return i;
    }
    addEventForChild(document.querySelector('.application-main'), 'click', '.select-menu .branch, .select-menu [data-hotkey="w"]', function (_this) {
        if (_this.getAttribute('lastcheck') == option.lastUpdate) return
        lastToken = option.lastUpdate;

        var param = window.location.href;
        var index = nthIndex(param, '/', 7);
        if (index < 0) index = param.indexOf('?');
        param = param.substring(index);
        if (index < 0) param = '';

        var scope = _this.parentNode;
        var src = '';
        var ddtype = _this.querySelector('i').innerHTML;
        if (ddtype == 'base:') {
            src += collectBranch(scope, option.parsed.exact, function (branch) {
                return 'a[href*="compare/' + branch + '.."]'
            });
            src += collectBranch(scope, option.parsed.prefix, function (branch) {
                return 'a[href*="compare/' + branch + '"]'
            });
        } else if (ddtype == 'compare:') {
            src += collectBranch(scope, option.parsed.exact, function (branch) {
                return 'a[href$="..' + branch + param + '"]'
            });
            src += collectBranch(scope, option.parsed.prefix, function (branch) {
                return 'a[href*="..' + branch + '"]'
            });
        } else if (ddtype == 'Branch:' || ddtype == 'Tree:') {
            src += collectBranch(scope, option.parsed.exact, function (branch) {
                return 'a[href$="tree/' + branch + param + '"]'
            });
            src += collectBranch(scope, option.parsed.prefix, function (branch) {
                return 'a[href*="tree/' + branch + '"]'
            });
            src += collectBranch(scope, option.parsed.exact, function (branch) {
                return 'a[href$="blob/' + branch + param + '"]'
            });
            src += collectBranch(scope, option.parsed.prefix, function (branch) {
                return 'a[href*="blob/' + branch + '"]'
            });
        }

        var currentActive = scope.querySelector('a.select-menu-item');
        currentActive.setAttribute('aria-selected', 'false');
        currentActive.classList.remove('navigation-focus');
        scope.querySelector('.select-menu-list > div').insertAdjacentHTML('afterbegin', src);
        scope.querySelector('a.select-menu-item').setAttribute('aria-selected', 'true');
        _this.setAttribute('lastcheck', option.lastUpdate);
        toggleUnpinned();
    })
})();