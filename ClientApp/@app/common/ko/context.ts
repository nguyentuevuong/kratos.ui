import { ko } from '@app/providers';

let hasOwnProperty = Object.prototype.hasOwnProperty,
    origBinding2Desc = ko.applyBindingsToDescendants;

ko.utils.extend(ko, {
    applyBindingsToDescendants: (viewModelOrBindingContext: any, rootNode: HTMLElement) => {
        if (viewModelOrBindingContext.$component) {
            ko.utils.extend(viewModelOrBindingContext, {
                $vm: viewModelOrBindingContext.$component
            })
        }

        origBinding2Desc(viewModelOrBindingContext, rootNode);
    }
});

ko.utils.extend(ko.utils, {
    extendBindingsAccessor: (accessor: () => any, prop: any) => {
        let oldBindings = accessor();

        ko.utils.objectForEach(oldBindings, (key: string, value: any) => {
            if (ko.utils.has(prop, key) && prop[key] instanceof Function) {
                let oldFunc1 = prop[key],
                    oldFunc2 = oldBindings[key];

                prop[key] = function () {
                    oldFunc1.apply(prop, arguments);
                    oldFunc2.apply(oldBindings, arguments);
                };
            }
        });

        return () => ko.utils.extend(oldBindings, prop);
    },
    removeEventHandler: (element: any, eventType: string | any, handler: (evt: any) => any) => {
        element.removeEventListener(eventType, handler, false);
    },
    registerOnceEventHandler: (element: HTMLElement, eventType: string | any, handler: (evt: any) => any) => {
        ko.utils.registerEventHandler(element, eventType, function handlerWrapper(evt: any) {
            handler(evt);
            ko.utils.removeEventHandler(element, eventType, handlerWrapper);
        });
    },
    extendAllBindingsAccessor: (accessor: KnockoutAllBindingsAccessor, prop: any) => {
        let oldBindings = accessor();

        ko.utils.extend(oldBindings, prop);

        return ko.utils.extend(() => oldBindings, {
            get: (key: string) => ko.utils.get(oldBindings, key),
            has: (key: string) => ko.utils.has(oldBindings, key)
        });
    },
    size: (object: Array<any> | string | any | Function) => {
        if (object instanceof Function) {
            if (!ko.isObservable(object)) {
                object = object.apply();
            } else {
                object = ko.toJS(object);
            }
        }

        if (typeof object === 'string') {
            return object.length;
        }

        if (object instanceof Array) {
            return [].slice.call(object).length;
        }

        return Object.keys(object).length;
    },
    has: (obj: any, prop: string) => {
        return obj != null && hasOwnProperty.call(obj, prop);
    },
    isNull: (obj: any) => {
        return obj == null;
    },
    isEmpty: (object: any) => {
        if (object instanceof Array || typeof object === 'string') {
            return ![].slice.call(object).length;
        }

        return true;
    },
    escape: (string: string) => {
        /** Used to map characters to HTML entities. */
        let htmlEscapes: {
            [key: string]: string
        } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return (string || '').replace(/[&<>"']/g, (chr: string) => htmlEscapes[chr]);
    },
    unescape: (string: string) => {
        /** Used to map characters to HTML entities. */
        let htmlUnescapes: {
            [key: string]: string
        } = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'"
        };

        return (string || '').replace(/&(?:amp|lt|gt|quot|#39);/g, (chr: string) => htmlUnescapes[chr]);
    },
    isArray: (object: any) => {
        return Array.isArray(object);
    },
    get: (object: any | undefined, path: Array<string> | string, defaultVal?: any) => {
        let _path = Array.isArray(path) ? path : (path || '').split('.').filter(i => i.length);

        if (!_path.length) {
            return object === undefined ? defaultVal : object
        }

        return ko.utils.get(object[_path.shift() || -1], _path, defaultVal);
    },
    omit: (object: any, path: Array<string> | string) => {
        let _path = Array.isArray(path) ? path : (path || '')
            .split('.').filter(i => i.length),
            child: string = _path.shift() || '';

        if (!ko.utils.isNull(object)) {
            if (_path.length) {
                if (object[child] instanceof Object) {
                    ko.utils.omit(object[child], _path);
                }
            } else {
                delete object[child];
            }
        }

        return object;
    },
    set: (object: any, path: Array<string> | string, value: any) => {
        let _path = Array.isArray(path) ? path : (path || '')
            .split('.').filter(i => i.length),
            child: string = _path.shift() || '';

        if (!ko.utils.isNull(object)) {
            if (_path.length) {
                if (!ko.utils.has(object, child)) {
                    object[child] = {};
                }

                if (object[child] instanceof Object) {
                    ko.utils.set(object[child], _path, value);
                }
            } else {
                object[child] = value;
            }
        }

        return object;
    },
    merge: (object: any, source: any) => {
        ko.utils.objectForEach(source, (key: string, value: any) => {
            let override = ko.utils.get(object, key);

            if (ko.utils.isNull(override)) {
                ko.utils.set(object, key, value);
            } else if (override instanceof Object) {
                ko.utils.merge(override, value);
            }
        });

        return object;
    },
    keys: (object: Array<any> | string | any | Function) => {
        if (object instanceof Function) {
            if (!ko.isObservable(object)) {
                object = object.apply();
            } else {
                object = ko.toJS(object);
            }
        }

        if (object instanceof Array || typeof object === 'string') {
            return [].slice.call(object).map((v: any, i: number) => String(i));
        }

        return Object.keys(object);
    },
    date: {
        gmt(year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number) {
            return new Date(year, month - 1, day || 1, hour || 0, minute || 0, second || 0, ms || 0);
        },
        utc(year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number) {
            return new Date(Date.UTC(year, month - 1, day || 1, hour || 0, minute || 0, second || 0, ms || 0));
        },
        addDays(date: Date, day: number) {
            date.setDate(date.getDate() + day);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        addMonths(date: Date, month: number) {
            date.setMonth(date.getMonth() + month);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        addYears(date: Date, year: number) {
            date.setFullYear(date.getFullYear() + year);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        addHours(date: Date, hour: number) {
            date.setHours(date.getHours() + hour);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        addMinutes(date: Date, minute: number) {
            date.setMinutes(date.getMinutes() + minute);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        addSeconds(date: Date, second: number) {
            date.setSeconds(date.getSeconds() + second);

            return date = ko.utils.date.utc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        },
        format(date: Date, mask?: string, utc?: boolean) {
            let token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                timezoneClip = /[^-+\dA-Z]/g,
                pad = function (val: String | number, len?: number) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) val = "0" + val;
                    return val;
                }, masks: {
                    [key: string]: string
                } = {
                    "default": "ddd mmm dd yyyy HH:MM:ss",
                    shortDate: "m/d/yy",
                    mediumDate: "mmm d, yyyy",
                    longDate: "mmmm d, yyyy",
                    fullDate: "dddd, mmmm d, yyyy",
                    shortTime: "h:MM TT",
                    mediumTime: "h:MM:ss TT",
                    longTime: "h:MM:ss TT Z",
                    isoDate: "yyyy-mm-dd",
                    isoTime: "HH:MM:ss",
                    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
                };

            mask = String(masks[mask || ''] || mask || masks["default"]);

            // Allow setting the utc argument via the mask
            mask = mask.replace(/^(UTC:)/, () => { utc = true; return ''; });

            let d: number = utc ? date.getUTCDate() : date.getDate(),
                D: number = utc ? date.getUTCDay() : date.getDay(),
                m: number = utc ? date.getUTCMonth() : date.getMonth(),
                y: number = utc ? date.getUTCFullYear() : date.getFullYear(),
                H: number = utc ? date.getUTCHours() : date.getHours(),
                M: number = utc ? date.getUTCMinutes() : date.getMinutes(),
                s: number = utc ? date.getUTCSeconds() : date.getSeconds(),
                L: number = utc ? date.getUTCMilliseconds() : date.getMilliseconds(),
                o: number = utc ? 0 : date.getTimezoneOffset(),
                flags: {
                    [key: string]: any
                } = {
                    d: d,
                    dd: pad(d),
                    ddd: ko.utils.date.dayNames[D],
                    dddd: ko.utils.date.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: ko.utils.date.monthNames[m],
                    mmmm: ko.utils.date.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop()!.replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : Number(d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, $0 => $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1));
        },
        from: (dateStr: string, format?: string, utc?: boolean) => {
            let gtc = utc ? ko.utils.date.utc : ko.utils.date.gmt,
                isInteger = function (val: string) {
                    for (var i = 0; i < val.length; i++) {
                        if ("1234567890".indexOf(val.charAt(i)) == -1) {
                            return false;
                        }
                    }
                    return true;
                },
                getInt = function (str: string, i: number, minlength: number, maxlength: number) {
                    for (var x = maxlength; x >= minlength; x--) {
                        var token = str.substring(i, i + x);
                        if (token.length < minlength) {
                            return null;
                        }
                        if (isInteger(token)) {
                            return String(token);
                        }
                    }
                    return null;
                };

            // If no format is specified, try a few common formats
            if (typeof (format) == "undefined" || format == null || format == "") {
                let preferAmericanFormat = true,
                    generalFormats = new Array('y-m-d', 'mmm d, y', 'mmm d,y', 'y-mmm-d', 'd-mmm-y', 'mmm d', 'mmm-d', 'd-mmm'),
                    monthFirst = new Array('m/d/y', 'm-d-y', 'm.d.y', 'm/d', 'm-d'),
                    dateFirst = new Array('d/m/y', 'd-m-y', 'd.m.y', 'd/m', 'd-m'),
                    checkList = new Array(generalFormats, preferAmericanFormat ? monthFirst : dateFirst, preferAmericanFormat ? dateFirst : monthFirst);

                for (var i = 0; i < checkList.length; i++) {
                    var l = checkList[i];
                    for (var j = 0; j < l.length; j++) {
                        var d = ko.utils.date.from(dateStr, l[j]);
                        if (d != null) {
                            return d;
                        }
                    }
                }
                return null;
            };

            dateStr = dateStr + "";
            format = format + "";

            let i_val = 0,
                i_format = 0,
                c = "",
                token = "",
                token2 = "",
                x = 0,
                y = 0,
                year: string | null = new Date().getFullYear().toString(),
                month: string | null = '1',
                date: string | null = '1',
                hh: string | null = '0',
                mm: string | null = '0',
                ss: string | null = '0',
                ampm: string | null = "";

            while (i_format < format.length) {
                // Get next token from format string
                c = format.charAt(i_format);
                token = "";
                while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                    token += format.charAt(i_format++);
                }
                // Extract contents of value based on format token
                if (token == "yyyy" || token == "yy" || token == "y") {
                    if (token == "yyyy") {
                        x = 4; y = 4;
                    }
                    if (token == "yy") {
                        x = 2; y = 2;
                    }
                    if (token == "y") {
                        x = 2; y = 4;
                    }
                    year = getInt(dateStr, i_val, x, y);
                    if (year == null) {
                        return null;
                    }

                    i_val += year.length;

                    if (year.length == 2) {
                        if (Number(year) > 70) {
                            year = String(1900 + (Number(year) - 0));
                        }
                        else {
                            year = String(2000 + (Number(year) - 0));
                        }
                    }
                }
                else if (token == "mmm" || token == "NNN") {
                    month = '0';
                    for (var i = 0; i < 12; i++) {
                        var month_name = ko.utils.date.monthNames[i + (token == "mmm" ? 12 : 0)];
                        if (dateStr.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                            month = String((i % 12) + 1);
                            i_val += month_name.length;
                            break;
                        }
                    }
                    if ((Number(month) < 1) || (Number(month) > 12)) {
                        return null;
                    }
                }
                else if (token == "EE" || token == "E") {
                    for (var i = 0; i < 7; i++) {
                        var day_name = ko.utils.date.dayNames[i + (token == "EE" ? 7 : 0)];
                        if (dateStr.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                            i_val += day_name.length;
                            break;
                        }
                    }
                }
                else if (token == "mm" || token == "m") {
                    month = getInt(dateStr, i_val, token.length, 2);
                    if (month == null || (Number(month) < 1) || (Number(month) > 12)) {
                        return null;
                    }
                    i_val += month.length;
                }
                else if (token == "dd" || token == "d") {
                    date = getInt(dateStr, i_val, token.length, 2);
                    if (date == null || (Number(date) < 1) || (Number(date) > 31)) {
                        return null;
                    }
                    i_val += date.length;
                }
                else if (token == "hh" || token == "h") {
                    hh = getInt(dateStr, i_val, token.length, 2);
                    if (hh == null || (Number(hh) < 1) || (Number(hh) > 12)) {
                        return null;
                    }
                    i_val += hh.length;
                }
                else if (token == "HH" || token == "H") {
                    hh = getInt(dateStr, i_val, token.length, 2);
                    if (hh == null || (Number(hh) < 0) || (Number(hh) > 23)) {
                        return null;
                    }
                    i_val += hh.length;
                }
                else if (token == "KK" || token == "K") {
                    hh = getInt(dateStr, i_val, token.length, 2);
                    if (hh == null || (Number(hh) < 0) || (Number(hh) > 11)) {
                        return null;
                    }
                    i_val += hh.length;
                    hh = String(Number(hh) + 1);
                }
                else if (token == "kk" || token == "k") {
                    hh = getInt(dateStr, i_val, token.length, 2);
                    if (hh == null || (Number(hh) < 1) || (Number(hh) > 24)) {
                        return null;
                    }
                    i_val += hh.length;
                    hh = String(Number(hh) - 1);
                }
                else if (token == "MM" || token == "M") {
                    mm = getInt(dateStr, i_val, token.length, 2);
                    if (mm == null || (Number(mm) < 0) || (Number(mm) > 59)) {
                        return null;
                    }
                    i_val += mm.length;
                }
                else if (token == "ss" || token == "s") {
                    ss = getInt(dateStr, i_val, token.length, 2);
                    if (ss == null || (Number(ss) < 0) || (Number(ss) > 59)) {
                        return null;
                    }
                    i_val += ss.length;
                }
                else if (token == "a") {
                    if (dateStr.substring(i_val, i_val + 2).toLowerCase() == "am") {
                        ampm = "AM";
                    }
                    else if (dateStr.substring(i_val, i_val + 2).toLowerCase() == "pm") {
                        ampm = "PM";
                    }
                    else {
                        return null;
                    }
                    i_val += 2;
                }
                else {
                    if (dateStr.substring(i_val, i_val + token.length) != token) {
                        return null;
                    }
                    else {
                        i_val += token.length;
                    }
                }
            }
            // If there are any trailing characters left in the value, it doesn't match
            if (i_val != dateStr.length) {
                return null;
            }
            // Is date valid for month?
            if (Number(month) == 2) {
                // Check for leap year
                if (((Number(year) % 4 == 0) && (Number(year) % 100 != 0)) || (Number(year) % 400 == 0)) { // leap year
                    if (Number(date) > 29) {
                        return null;
                    }
                }
                else {
                    if (Number(date) > 28) {
                        return null;
                    }
                }
            }
            if ((Number(month) == 4) || (Number(month) == 6) || (Number(month) == 9) || (Number(month) == 11)) {
                if (Number(date) > 30) {
                    return null;
                }
            }
            // Correct hours value
            if (Number(hh) < 12 && ampm == "PM") {
                hh = String(Number(hh) - 0 + 12);
            }
            else if (Number(hh) > 11 && ampm == "AM") {
                hh = String(Number(hh) - 12);
            }

            return gtc(Number(year), Number(month), Number(date), Number(hh), Number(mm), Number(ss));
        },
        calendar(month: number, year: number) {
            let utc = ko.utils.date.utc,
                firstDate: Date = utc(year, month, 1),
                startIndex: number = firstDate.getDay();

            // set date to lastest saturday of preview month
            ko.utils.date.addDays(firstDate, -(startIndex + 1));

            return ko.utils.range(0, 41).map(() => ko.utils.date.addDays(firstDate, 1));
        },
        get dayNames() {
            return [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ];
        },
        get monthNames() {
            return [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
        }
    },
    dom: {
        create: (tag: string, options: { [key: string]: string | number }) => {
            let element = document.createElement(tag);

            if (options) {
                ko.utils.objectForEach(options, (key: string, value: string | number) => {
                    switch (key) {
                        case 'html':
                            ko.utils.setHtml(element, value.toString());
                            break;
                        case 'text':
                            ko.utils.setTextContent(element, value.toString());
                            break;
                        default:
                            ko.utils.dom.setAttr(element, key, value);
                            break;
                    }
                });
            }

            return element;
        },
        empty: (element: HTMLElement) => {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        remove: (element: HTMLElement) => {
            let parent: Node | null = element.parentNode;

            if (parent) {
                parent.removeChild(element);
                return true;
            }

            return false;
        },
        isEmpty: (element: HTMLElement) => {
            return element.hasChildNodes();
        },
        next: (element: HTMLElement) => {
            return element.nextSibling;
        },
        preview: (element: HTMLElement) => {
            return element.previousSibling;
        },
        setHtml: (element: HTMLElement, html: () => string) => {
            ko.utils.setHtml(element, html);
        },
        setAttr: (element: HTMLElement, key: string, value: string | number) => {
            element && element.setAttribute && element.setAttribute(key, value.toString());
        },
        getAttr: (element: HTMLElement, key: string) => {
            return element && element.getAttribute && element.getAttribute(key);
        },
        removeAttr: (element: HTMLElement, key: string) => {
            element && element.removeAttribute && element.removeAttribute(key);
        },
        hasClass: (element: HTMLElement, classCss: string) => {
            return element && element.className && element.classList.contains(classCss.trim());
        },
        addClass: (element: HTMLElement, classCss: Array<string> | string) => {
            if (element) {
                if (typeof classCss == 'string') {
                    if (classCss.indexOf(' ') == -1) {
                        classCss = [classCss];
                    } else {
                        classCss = [].slice.call(classCss.split(/\s/));
                    }
                }

                [].slice.call(classCss)
                    .forEach((c: string) => element.classList.add(c.trim()));
            }
        },
        removeClass: (element: HTMLElement, classCss: Array<string> | string) => {
            if (element) {
                if (typeof classCss == 'string') {
                    if (classCss.indexOf(' ') == -1) {
                        classCss = [classCss];
                    } else {
                        classCss = [].slice.call(classCss.split(/\s/));
                    }
                }

                [].slice.call(classCss)
                    .forEach((css: string) => element.classList.remove(css));

                if (!ko.utils.dom.getAttr(element, 'class')) {
                    ko.utils.dom.removeAttr(element, 'class');
                }
            }
        },
        toggleClass: (element: HTMLElement, classCss: Array<string> | string) => {
            if (element) {
                if (typeof classCss == 'string') {
                    if (classCss.indexOf(' ') == -1) {
                        classCss = [classCss];
                    } else {
                        classCss = [].slice.call(classCss.split(/\s/));
                    }
                }

                [].slice.call(classCss)
                    .forEach((css: string) => {
                        if (!ko.utils.dom.hasClass(element, css)) {
                            ko.utils.dom.addClass(element, css);
                        } else {
                            ko.utils.dom.removeClass(element, css);
                        }
                    });
            }
        },
        animate: (element: HTMLElement, classAnimated: string, removeAfterEnd: boolean = false) => {
            let rmClass = ko.utils.dom.removeClass,
                addClass = ko.utils.dom.addClass,
                rgOneEvent = ko.utils.registerOnceEventHandler;

            if (element) {
                if (classAnimated.indexOf('animated') == -1) {
                    classAnimated = `animated ${classAnimated.trim()}`;
                }

                rmClass(element, classAnimated);

                setTimeout(() => {
                    addClass(element, classAnimated);

                    if (removeAfterEnd) {
                        rgOneEvent(element, 'animationend', function () {
                            rmClass(element, classAnimated);
                        });
                    }
                }, 10);
            }
        },
        getScroll: (element: HTMLElement, side: string = 'top') => {
            if (element.nodeName === 'BODY' || element.nodeName === 'HTML') {
                let html = element.ownerDocument!.documentElement,
                    scrollingElement = element.ownerDocument!.scrollingElement || html;

                if (scrollingElement) {
                    return side === 'top' ? scrollingElement.scrollTop : scrollingElement.scrollLeft;
                }
            }

            return side === 'top' ? element.scrollTop : element.scrollLeft;
        },
        parent: (element: HTMLElement) => {
            return element.parentNode as HTMLElement;
        },
        parents: (element: HTMLElement, helper: string) => {
            return element.closest(helper) as HTMLElement;
        }
    }
});