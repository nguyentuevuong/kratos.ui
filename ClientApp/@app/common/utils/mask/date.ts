import { core, InputMaskCore } from './core';

export class InputDateMask {
    ctrl: HTMLInputElement = document.createElement('input');
    inputmask: InputMaskCore = core.init(document.createElement('input'), []);

    constructor(ctrl: HTMLInputElement, option: {}) {
        
    }
}