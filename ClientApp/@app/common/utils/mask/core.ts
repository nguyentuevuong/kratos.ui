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

        regEvent(ctrl, 'select', () => {
            self.caret = self.caret;

            if (!self.moveables[self.caret]) {
                self.caret = self.nextCaret;
            }
        });

        // prevent drop/select event
        regEvent(ctrl, 'drop', (event: DragEvent) => {
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        regEvent(ctrl, 'copy', (event: PasteEvent) => {
            event.clipboardData.setData('text/plain', self.value);
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        regEvent(ctrl, 'paste', (event: PasteEvent) => {
            self.value = event.clipboardData.getData('text/plain');
            event.preventDefault();
            event.stopImmediatePropagation();
        });


        // move caret to moveable point
        regEvent(ctrl, 'focus', self.mouseup.bind(self));
        regEvent(ctrl, 'mouseup', self.mouseup.bind(self));

        // disable move caret by keydown
        regEvent(ctrl, 'keydown', self.move.bind(self));

        regEvent(ctrl, 'keydown', self.remove.bind(self));

        regEvent(ctrl, 'keydown', self.keydown.bind(self));
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
            lioft = steps.lastIndexOf(true) + 1,
            comps = steps.map((m: boolean | undefined, i: number) => mask[i] == m)
                .indexOf(false);

        if (comps > -1) {
            steps[comps] = true;
        }

        if (lioft >= comps) {
            steps[lioft] = true;
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

    protected render(caret?: number) {
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

            if (!!caret) {
                self.caret = caret;

                if (!self.moveables[caret]) {
                    self.caret = self.nextCaret;
                }
            } else {
                self.caret = self.maxCaret;
            }
        }
    }

    protected mouseup(event: MouseEvent) {
        let self = this,
            caret = self.values.indexOf('_');

        if (self.masked) {
            if (caret > -1) {
                if (caret <= self.minCaret) {
                    self.caret = self.minCaret;
                } else if (caret >= self.maxCaret) {
                    self.caret = self.maxCaret;
                } else {
                    self.caret = caret;

                    if (!self.moveables[caret]) {
                        self.caret = self.nextCaret;
                    }
                }
            } else if (self.caret <= self.minCaret) {
                self.caret = self.minCaret;
            } else if (self.caret >= self.maxCaret) {
                self.caret = self.maxCaret;
            } else if (!self.moveables[self.caret]) {
                self.caret = self.nextCaret;
            } else {
                self.caret = self.caret;

                if (!self.moveables[self.caret]) {
                    self.caret = self.nextCaret;
                }
            }

            event.preventDefault();
            event.stopImmediatePropagation();
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
                    if (self.caret <= self.minCaret) {
                        self.caret = self.minCaret;

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    } else if (masks[self.caret - 1]) {
                        self.caret = self.prevCaret + 1;
                    }
                }
            } else {
                if (self.caret >= self.minCaret && self.caret <= self.maxCaret) {
                    if (event.keyCode == 37) {
                        self.caret = self.prevCaret;

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    } else if (event.keyCode == 39) {
                        self.caret = self.nextCaret;

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                } else {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        }
    }

    protected remove(event: KeyboardEvent) {
        let self = this,
            caret = self.caret;

        if (self.masked) {
            if (!event.shiftKey) {
                if (event.which === 8) { // backspace
                    if (typeof self.masks[self.prevCaret] === 'string') {
                        self.caret = self.prevCaret;
                        self.keydown(event);
                    } else if (self.masks[self.prevCaret] instanceof RegExp || self.masks[self.prevCaret] instanceof Function) {
                        self.pushHistory(self.value);

                        self.values[self.prevCaret] = '_';
                        self.render(self.prevCaret);
                    }

                    event.preventDefault();
                    event.stopImmediatePropagation();
                } else if (event.which == 46) { // delete
                    if (self.masks[caret] instanceof RegExp || self.masks[caret] instanceof Function) {
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