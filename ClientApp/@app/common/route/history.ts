import { ko } from '@app/providers';

let locz = window.location,
    history = window.history,
    pushState = history.pushState,
    replaceState = history.replaceState,
    forEach = ko.utils.arrayForEach,
    go = history.go,
    back = history.back,
    forward = history.forward,
    _listeners: Array<(data: any, url: string) => void> = [],
    msg = 'Plz register once listener for history state change!';

ko.utils.extend(history, {
    listener: (listener: (data: any, url: string) => void) => {
        _listeners.push(listener);
    },
    go: (delta?: number) => {
        if (_listeners.length >= 1) {
            go.apply(history, [delta]);
            forEach(_listeners, _listener => _listener(history.state, locz.pathname));
        } else if (_listeners.length == 0) {
            throw msg;
        }
    },
    back: () => {
        if (_listeners.length >= 1) {
            back.apply(history);
            forEach(_listeners, _listener => _listener(history.state, locz.pathname));
        } else if (_listeners.length == 0) {
            throw msg;
        }
    },
    forward: () => {
        if (_listeners.length >= 1) {
            forward.apply(history);
            forEach(_listeners, _listener => _listener(history.state, locz.pathname));
        } else if (_listeners.length == 0) {
            throw msg;
        }
    },
    initState: function (data: any, title: string, url?: string | null) {
        if (_listeners.length == 1) {
            if (ko.utils.size(arguments) == 1) {
                url = data;
            } else if (ko.utils.size(arguments) == 2) {
                url = title;
            }

            history.replaceState(data, title, url);
        } else if (_listeners.length == 0) {
            throw msg;
        }
    },
    pushState: function (data: any, title: string, url?: string | null) {
        if (_listeners.length >= 1) {
            let cul = locz.pathname,
                cda = history.state;

            if (ko.utils.size(arguments) == 1) {
                url = data;
            } else if (ko.utils.size(arguments) == 2) {
                url = title;
            }

            if (url != cul || data != cda) {
                pushState.apply(history, [data, title, url]);
                forEach(_listeners, _listener => _listener(history.state, locz.pathname));
            }
        } else if (_listeners.length == 0) {
            throw msg;
        }
    },
    replaceState: function (data: any, title: string, url?: string | null) {
        if (_listeners.length >= 1) {
            if (ko.utils.size(arguments) == 1) {
                url = data;
            } else if (ko.utils.size(arguments) == 2) {
                url = title;
            }

            replaceState.apply(history, [data, title, url]);
            forEach(_listeners, _listener => _listener(history.state, locz.pathname));
        } else if (_listeners.length == 0) {
            throw msg;
        }
    }
});

// replace state when back or forward button clicked
ko.utils.registerEventHandler(window, 'popstate', () => forEach(_listeners, _listener => _listener(history.state, locz.pathname)));