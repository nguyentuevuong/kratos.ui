import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { InputMaskCore } from '@app/common/utils/mask/core';
import { StringMask } from '@app/common/utils/smask';
import { HtmlUtils } from '@app/common/utils/html';

const dom = ko.utils.dom,
    ddt = ko.utils.domData,
    ddkey = '__dom_elements__',
    regEvent = ko.utils.registerEventHandler;

@handler({
    virtual: false,
    bindingName: 'mask'
})
export class InputBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let ctrl = valueAccessor(),
            lblc = dom.create('div'),
            inpc = dom.create('div'),
            lbl = dom.create('label', { 'class': 'control-label mb-1' }), //control-label-block
            inpg = dom.create('div', { 'class': 'input-group' }), //input-group-transparent
            inp = dom.create('input', { 'type': 'text', 'class': 'form-control' }) as HTMLInputElement,
            iga = dom.create('div', { 'class': 'input-group-append' }),
            igp = dom.create('div', { 'class': 'input-group-prepend' });

        ddt.set(element, ddkey, {
            lbl: lbl,
            inp: inp,
            iga: iga,
            igp: igp,
            inpg: inpg,
            lblc: lblc,
            inpc: inpc
        });

        lblc.appendChild(lbl);
        element.appendChild(lblc);

        inpg.appendChild(inp);
        inpc.appendChild(inpg);
        element.appendChild(inpc);

        dom.addClass(element, 'form-group row');

        regEvent(inp, 'keydown', (evt: Event) => {

        });

        regEvent(inp, 'change', (evt: Event) => {
            //console.log(inp.value);
            ctrl(inp.value);
        });

        let k = InputMaskCore.init(inp, {
            mask: '当日 __ : __',
            definitions: {
                '_': (mask: InputMaskCore, key: string, index: number) => {
                    switch (index) {
                        case 0:
                            let p1 = /\d/.test(key);

                            if (p1) {
                                let n1 = Number(key);

                                if (n1 > 1) {
                                    let value = [].slice.call(mask.value).map((m: string) => m);

                                    value[0] = '0';
                                    value[1] = key;

                                    mask.value = value.join('');
                                    return false;
                                }

                                return true;
                            }
                            return false;
                        case 1:
                            let p2 = /\d/.test(key);

                            if (p2) {
                                let n1 = Number(mask.value[0]),
                                    n2 = Number(key);

                                if (n1 < 1) {
                                    return true;
                                } else {
                                    return n2 <= 1;
                                }
                            }

                            return false;
                        case 2:
                            return /[0-5]/.test(key);
                        case 3:
                            return /\d/.test(key);
                        default:
                            return false;
                    }
                }
            }
        });

        //[validate, validate, ' : ', validate, validate, '   AM']);
        //k.updateMask(['Ngày   ', /\d/, /\d/, '   tháng   ', /\d/, /\d/, '   năm   ', /\d/, /\d/, /\d/, /\d/]); //'±',]
        /*k.updateMask({
            mask: 'dd/mm/yyyy',
            definitions: {
                'd': /\d/,
                'm': /\d/,
                'y': /\d/
            }
        });*/

        k.value = '09101988';

        //console.log(k.valid);

        ko.utils.extend(window, { mask: k });

        //console.log(StringMask.apply('09101988', '00/00/0000'));

        return { controlsDescendantBindings: true };
    }

    update = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let elements: {
            iga: HTMLDivElement,
            igp: HTMLDivElement,
            lbl: HTMLLabelElement,
            inp: HTMLInputElement,
            inpg: HTMLDivElement,
            lblc: HTMLDivElement,
            inpc: HTMLDivElement
        } = ddt.get(element, ddkey),
            control = valueAccessor(),
            $icons: { before?: string; after?: string; } = ko.toJS(control.$icons) || {};

        if (!!$icons.after) {
            dom.empty(elements.iga);
            elements.iga.append(dom.create('span', { 'class': 'input-group-text ' + $icons.after }));

            elements.inpg.prepend(elements.iga);
        } else if (elements.inpg.contains(elements.iga)) {
            elements.inpg.removeChild(elements.iga);
        }

        if (!!$icons.before) {
            dom.empty(elements.igp);
            elements.igp.append(dom.create('span', { 'class': 'input-group-text ' + $icons.before }));

            elements.inpg.prepend(elements.igp);
        } else if (elements.inpg.contains(elements.igp)) {
            elements.inpg.removeChild(elements.igp);
        }

        if (!!$icons.before || !!$icons.after) {
            dom.addClass(elements.inpg, 'input-group-transparent');
        } else {
            dom.removeClass(elements.inpg, 'input-group-transparent');
        }

        // call label update

        HtmlUtils.createLabel(control, elements.lbl);

        // update column of group
        ko.bindingHandlers.$column.update!(elements.lblc, valueAccessor, ko.utils.extendAllBindingsAccessor(allBindingsAccessor, { type: 'label' }), viewModel, bindingContext);
        ko.bindingHandlers.$column.update!(elements.inpc, valueAccessor, ko.utils.extendAllBindingsAccessor(allBindingsAccessor, { type: 'input' }), viewModel, bindingContext);
    }
}

@handler({
    virtual: false,
    bindingName: '$column'
})
export class ColumnBindingHandler implements KnockoutBindingHandler {
    update = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let type: string = allBindingsAccessor().type,
            columns: Array<string> | string = ko.toJS(valueAccessor().$columns) || 'col-md-12';

        dom.removeAttr(element, 'class');
        dom.addClass(element, typeof columns == 'string' ? columns : (type == 'label' ? columns[0] : columns[1]));
    }
}