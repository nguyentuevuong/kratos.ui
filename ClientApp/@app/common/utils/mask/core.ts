import { ko } from '@app/providers';

interface ISelection {
    start: number;
    end: number;
    direction?: string;
}

interface IOptions {
    mask: string;
    definitions: {
        [key: string]: RegExp | Function;
    }
}

const dd = ko.utils.domData,
    trgEvent = ko.utils.triggerEvent,
    regEvent = ko.utils.registerEventHandler;

export { InputMaskCore as core };

export class InputMaskCore {
    private masks: Array<string | RegExp | Function> = [];
    private values: Array<string> = [];
    private histories: Array<string> = [];

    private ctrl: HTMLInputElement = document.createElement('input');

    constructor(ctrl: HTMLInputElement, mask: IOptions | Array<string | RegExp | Function>) {
        let self = this;

        if (ctrl && mask) {
            self.ctrl = ctrl;

            self.updateMask(mask);

            self.bindEvents();

            // show mask for first
            self.render();
        }
    }

    public static init(ctrl: HTMLInputElement, mask: IOptions | Array<string | RegExp | Function>) {
        return new InputMaskCore(ctrl, mask);
    }

    protected bindEvents() {
        let self = this,
            ctrl = self.ctrl;

        regEvent(ctrl, 'copy', (evt: PasteEvent) => {
            evt.clipboardData.setData('text/plain', self.value);
            evt.preventDefault();
        });

        regEvent(ctrl, 'paste', (evt: PasteEvent) => {
            self.value = evt.clipboardData.getData('text/plain');
            evt.preventDefault();
        });

        regEvent(ctrl, 'selectstart', (event: Event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        // move caret to lastest input value
        regEvent(ctrl, 'focus', () => { self.render() });

        // prevent drop/select event
        regEvent(ctrl, 'drop', (evt: DragEvent) => { evt.preventDefault() });

        // select
        regEvent(ctrl, 'mouseup', self.mouseup.bind(self));

        // disable move caret by keydown
        regEvent(ctrl, 'keydown', self.move.bind(self));

        regEvent(ctrl, 'keydown', self.remove.bind(self));

        regEvent(ctrl, 'keydown', self.keydown.bind(self));

        //regEvent(ctrl, 'keyup', self.keyup.bind(self));
    }

    /**
     * Push current value to history map for undo event
     */
    protected pushHistory(hist: string) {
        let self = this;

        if (self.histories[self.histories.length - 1] != hist) {
            self.histories.push(hist);
        }
    }

    protected get masked() {
        return !!(this.masks && this.masks.length);
    }

    protected get success() {
        return this.value.indexOf('_') == -1;
    }

    protected get caret() {
        return this.ctrl.selectionStart || 0;
    }

    protected set caret(start: number) {
        this.ctrl.setSelectionRange(start, start);
    }

    protected get minCaret() {
        let self = this;

        return self.moveables.indexOf(true);
    }

    protected get maxCaret() {
        let self = this;

        return self.moveables.lastIndexOf(true);
    }

    protected get prevCaret() {
        let self = this,
            caret = self.caret,
            prev = self.moveables
                .map((f: boolean | undefined, i: number) => !!f && i < caret)
                .lastIndexOf(true);

        return prev > -1 ? prev : caret;
    }

    protected get nextCaret() {
        let self = this,
            caret = self.caret,
            next = self.moveables
                .map((f: boolean | undefined, i: number) => !!f && i > caret)
                .indexOf(true);

        return next > -1 ? next : caret;
    }

    protected get moveables() {
        let self = this,
            mask = self.masks.map(m => typeof m != 'string'),
            steps = self.masks.map((m: string | RegExp | Function, i: number) => {
                if (typeof m == 'string') {
                    return false;
                } else if (m instanceof RegExp || m instanceof Function) {
                    if (self.values[i] == '_') {
                        return false;
                    } else {
                        return true;
                    }
                }
            }),
            liot = steps.lastIndexOf(true) + 1,
            comps = steps.map((m: boolean | undefined, i: number) => mask[i] == m)
                .indexOf(false);

        if (comps > -1) {
            steps[comps] = true;
        }

        if (liot >= comps) {
            steps[liot] = true;
        }

        return steps;
    }

    /**
     * Get real index of char from mask
     * @param mi index of char in mask
     */
    protected indexs(mi: number) {
        let self = this;

        return self.masks
            .map((m: string | Function | RegExp, i: number) => typeof m != 'string' ? i : -1)
            .filter(m => m != -1)
            .map((m: number, i: number) => m == mi ? i : -1)
            .filter(m => m != -1)[0];
    }

    private get selection(): ISelection {
        let self = this,
            ctrl = self.ctrl;

        return { start: ctrl.selectionStart || 0, end: ctrl.selectionEnd || 0, direction: '' };
    }

    private set selection(range: ISelection) {
        let self = this,
            masks = self.masks.map(m => typeof m == 'string'),
            froto = masks.filter((m: boolean, i: number) => i >= range.start && i < range.end),
            allst = !!froto.filter(m => !m).length;

        if (allst) {
            if (typeof self.masks[range.start] == 'string') {
                let rights = masks.filter((m: boolean, i: number) => i >= range.start + 1 && i <= range.end),
                    steps = rights.filter((m: boolean, i: number) => i < rights.indexOf(false));

                range.start += steps.length;
            }

            if (typeof self.masks[range.end - 1] == 'string') {
                let lefts = masks.filter((m: boolean, i: number) => i >= range.start && i <= range.end - 1),
                    steps = lefts.filter((m: boolean, i: number) => i > lefts.lastIndexOf(false));

                range.end -= steps.length;
            }
        } else {
            let next = range.start + masks.filter((m: boolean, i: number) => i >= range.start).indexOf(false);

            if (next > self.maxCaret) {
                next = self.maxCaret;
            }

            range = { start: next, end: next };
        }

        self.ctrl.setSelectionRange(range.start, range.end);
    }

    protected render(start?: number, end?: number) {
        let self = this;

        if (self.masked) {
            self.ctrl.value = self.masks.map((m: string | RegExp | Function, i: number) => {
                if (typeof m === 'string') {
                    self.values[i] = m;
                } else if (m instanceof RegExp) {
                    self.values[i] = m.test(self.values[i] || '') ? self.values[i] : '_';
                } else {
                    self.values[i] = (!self.values[i] || self.values[i] == '_') ? '_' : (m.apply(m, [self, self.values[i], self.indexs(i)]) ? self.values[i] : '_');
                }

                return self.values[i];
            }).join('');

            if (start != undefined && end == undefined) {
                self.caret = start;
            } else if (start != undefined && end != undefined) {
                if (start <= self.minCaret) {
                    start = self.minCaret;
                } else if (end >= self.maxCaret) {
                    end = self.maxCaret;
                }

                self.selection = { start: <number>start, end: <number>end }
            } else {
                let cr = self.values.indexOf('_');
                self.caret = cr > -1 ? cr : self.maxCaret || 0;
            }
        }
    }

    protected mouseup(event: MouseEvent) {
        let self = this,
            range = self.selection;

        if (self.masked) {
            if (range.start == range.end) {
                if (self.caret <= self.minCaret) {
                    self.render(self.minCaret);
                } else if (self.caret >= self.maxCaret) {
                    self.render(self.maxCaret)
                } else {
                    if (typeof self.masks[self.caret] == 'string') {
                        self.caret += 1;
                        self.mouseup(event);
                    } else {
                        self.render(self.caret);
                    }
                }
            } else {
                if (range.start <= self.minCaret && range.end <= self.minCaret) {
                    self.render(self.minCaret);
                } else if (range.start >= self.maxCaret && range.end >= self.maxCaret) {
                    self.render(self.maxCaret);
                } else if ((range.start <= self.minCaret && range.end >= self.maxCaret) ||
                    (range.end <= self.minCaret && range.start >= self.maxCaret)) {
                    self.render(self.maxCaret);
                    //self.render(self.minCaret, self.maxCaret);
                } else if (range.start <= self.minCaret && range.end < self.maxCaret) {
                    self.render(range.end);
                    //self.render(self.minCaret, range.end);
                } else if (range.start > self.minCaret && range.end >= self.maxCaret) {
                    self.render(self.maxCaret);
                    //self.render(range.start, self.maxCaret);
                } else {
                    self.render(range.end);
                    //self.render(range.start, range.end);
                }
            }
        }
    }

    protected move(event: KeyboardEvent) {
        let self = this,
            masks = self.masks.map(m => typeof m == 'string');

        if (self.masked) {
            if (!event.shiftKey) {
                if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                    if (event.keyCode == 37) {
                        self.caret = self.prevCaret;
                    } else if (event.keyCode == 38) {
                        self.caret = self.minCaret;
                    } else if (event.keyCode == 39) {
                        self.caret = self.nextCaret;
                    } else if (event.keyCode == 40) {
                        self.caret = self.maxCaret;
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else if (event.keyCode == 8) {
                    if (self.selection.start == self.selection.end) {
                        if (self.caret <= self.minCaret) {
                            self.caret = self.minCaret;

                            event.preventDefault();
                            event.stopImmediatePropagation();
                        } else if (masks[self.caret - 1]) {
                            self.caret = self.prevCaret + 1;
                        }
                    }
                }
            } else {
                if (event.keyCode == 37 && self.caret > self.minCaret) {
                    self.selection = { start: self.caret - 1, end: self.selection.end };

                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else if (event.keyCode == 39 && self.caret < self.maxCaret) {
                    self.selection = { start: self.selection.start, end: self.caret + 1 };

                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        }
    }

    protected remove(event: KeyboardEvent) {
        let self = this,
            caret = self.caret,
            range = self.selection;

        if (self.masked) {
            if (!event.shiftKey) {
                if (event.which === 8) { // backspace
                    if (range.start !== range.end) {
                        for (let i = range.end - 1; i >= range.start; i--) {
                            self.pushHistory(self.value);

                            self.values[i] = '_';
                        }

                        self.render(range.start);
                    } else {
                        if (typeof self.masks[caret - 1] === 'string') {
                            self.caret = self.prevCaret;
                            self.keydown(event);
                        } else if (self.masks[caret - 1] instanceof RegExp || self.masks[caret - 1] instanceof Function) {
                            self.pushHistory(self.value);

                            self.values[caret - 1] = '_';
                            self.render(caret - 1);
                        }
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else if (event.which == 46) { // delete
                    if (range.start !== range.end) {
                        for (let i = range.end - 1; i >= range.start; i--) {
                            self.pushHistory(self.value);

                            self.values[i] = '_';
                        }

                        self.render(range.start);
                    } else if (self.masks[caret] instanceof RegExp || self.masks[caret] instanceof Function) {
                        if (self.values[caret] != '_') {
                            self.pushHistory(self.value);

                            self.values[caret] = '_';
                        } else {
                            for (var i = caret + 1; i < self.values.length; i++) {
                                if (self.values[i] != '_') {
                                    self.pushHistory(self.value);

                                    self.values[i] = '_';
                                    break;
                                }
                            }
                        }

                        self.render(caret);
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        }
    }

    // input event
    protected keydown(event: KeyboardEvent) {
        let self = this,
            caret = self.caret,
            mask = self.masks[caret],
            minCaret = self.minCaret,
            maxCaret = self.maxCaret;

        if (self.masked) {
            if (!event.metaKey && !event.ctrlKey && !event.altKey) {
                if (event.key.length == 1) {
                    if (mask && (caret >= minCaret || caret < maxCaret)) {
                        if (typeof mask === 'string') {
                            self.values[caret] = mask;
                        } else if (mask instanceof RegExp) {
                            if (!!mask.test(event.key)) {
                                self.pushHistory(self.value);

                                self.values[caret] = event.key;
                            }
                        } else if (mask instanceof Function) {
                            if (!!mask.apply(self, [self, event.key, self.indexs(self.caret)])) {
                                self.pushHistory(self.value);

                                self.values[caret] = event.key;
                            }
                        }

                        self.render(self.nextCaret);
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            } else if (event.metaKey || event.ctrlKey) {
                if (event.keyCode == 90) {
                    let hist = self.histories.pop();

                    if (hist) {
                        self.value = hist;
                        // remove again;
                        self.histories.pop();
                    }
                }
            }
        }
    }

    public get valid() {
        let self = this,
            masks = self.masks,
            values = self.values;

        if (self.masked) {
            return !masks.map((m: string | RegExp | Function, index: number) => {
                if (typeof m == 'string') {
                    return values[index] == m;
                } else if (m instanceof RegExp) {
                    return m.test(values[index]) || values[index] == "_";
                } else if (m instanceof Function) {
                    return !!m.apply(self, [self, self.values[index], self.indexs(index)]) || values[index] == "_";
                }
            }).filter(f => !f).length;
        } else {
            return true;
        }
    }

    public get value() {
        let self = this,
            mask = self.masks.map(m => typeof m == 'string');

        if (self.masked) {
            return self.values.map((m: string, i: number) => mask[i] ? undefined : m).filter(m => !!m).join('');
        } else {
            return self.ctrl.value;
        }
    }

    public set value(value: string) {
        let idx = 0,
            self = this,
            masks = self.masks.map(m => typeof m == 'string' ? m : undefined);

        if (self.masked) {
            self.pushHistory(self.value);

            masks.forEach((m: string | undefined, index: number) => {
                if (m == undefined) {
                    self.values[index] = value[idx++];
                } else {
                    let pattern = <string>masks[index];

                    if (value[idx] == pattern) {
                        idx += 1;
                    }

                    self.values[index] = pattern;
                }
            });

            self.render();
        } else {
            self.ctrl.value = value;
        }
    }

    public get viewValue() {
        let self = this;

        if (self.masked) {
            return self.values.join('');//.replace(/\s+/g, ' ');
        } else {
            return self.value;
        }
    }

    public updateMask(mask: IOptions | Array<string | RegExp | Function>) {
        let self = this;

        if (Array.isArray(mask)) {
            if (mask.length > 0) {
                self.masks = [];
                self.values = [];

                mask.forEach(m => {
                    if (typeof m != 'string') {
                        self.masks.push(m);
                    } else {
                        [].slice.call(m).forEach(s => self.masks.push(s));
                    }
                });
            } else {
                let value = self.values.join('');

                self.values = [];
                self.value = value;
            }
        } else if (mask.mask) {
            self.masks = [];
            self.values = [];

            [].slice.call(mask.mask).forEach((c: string) => {
                self.masks.push(mask.definitions[c] || c);
            });
        } else {
            let value = self.values.join('');

            self.values = [];
            self.value = value;
        }
    }
}