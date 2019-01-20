import { ko } from '@app/providers';
import { i18text } from '@app/common/lang';

const dom = ko.utils.dom;

export class HtmlUtils {
    public static createLabel(obsr: ValidationObservable<any>, element?: HTMLElement) {
        element = element || dom.create('div');

        dom.addClass(element, 'noselect');

        ko.computed({
            read: () => {
                let $id = ko.toJS(obsr.$attr).id,
                    $name = ko.toJS(obsr.$name),
                    $require = ko.toJS(obsr.$require),
                    $constraint = ko.toJS(obsr.$constraint);

                if (element) {
                    dom.empty(element);

                    // bind for attr
                    dom.setAttr(element, 'for', $id);

                    dom.addClass(element, 'control-label mb-1');
                    // missing block or inline style
                    dom.addClass(element, 'control-label-block');

                    if ($require) {
                        dom.addClass(element, 'control-label-danger');
                    } else {
                        dom.removeClass(element, 'control-label-danger');
                    }

                    if (!$name) {
                        dom.addClass(element, 'd-none');
                    } else {
                        dom.removeClass(element, 'd-none');
                        element.appendChild(dom.create('span', { text: i18text($name) }));
                    }

                    if ($constraint) {
                        element.appendChild(dom.create('span', { text: i18text($constraint) }));
                    }
                }
            },
            disposeWhen: () => false
        });

        return element;
    }

    public static createInputGroup(obsr: ValidationObservable<any>, element?: HTMLElement): { container: HTMLElement, input: HTMLInputElement } {
        let id = ko.toJS(obsr.$id) || ko.toJS(obsr.$attr).id,
            lbc = dom.create('div'),
            ipc = dom.create('div'),
            label = dom.create('label'),
            inpg = dom.create('div', { 'class': 'input-group input-group-transparent' }), //input-group-transparent
            input = dom.create('input', { type: 'text', class: 'form-control' }) as HTMLInputElement,
            iga = dom.create('div', { 'class': 'input-group-append' }),
            icb = dom.create('i'),
            ica = dom.create('i'),
            igp = dom.create('div', { 'class': 'input-group-prepend' });

        element = element || dom.create('div', { 'class': 'row' });

        igp.appendChild(icb);
        iga.appendChild(ica);

        ko.computed({
            read: () => {
                let cols = ko.toJS(obsr.$columns) || ['col-md-12', 'col-md-12'];

                if (cols[0]) {
                    dom.setAttr(lbc, 'class', cols[0]);
                }

                if (cols[1]) {
                    dom.setAttr(ipc, 'class', cols[1]);
                }
            },
            disposeWhen: () => false
        });

        ko.computed({
            read: () => {
                let icons: { before?: string; after?: string; } = ko.toJS(obsr.$icons);

                if (icons) {
                    if (icons.after) {
                        if (!inpg.contains(iga)) {
                            inpg.prepend(iga);
                        }

                        ica.setAttribute('class', `input-group-text ${icons.after}`);
                    }

                    if (icons.before) {
                        if (!inpg.contains(igp)) {
                            inpg.prepend(igp);
                        }

                        icb.setAttribute('class', `input-group-text ${icons.before}`);
                    }
                } else {
                    if (inpg.contains(igp)) {
                        inpg.removeChild(igp);
                    }

                    if (inpg.contains(iga)) {
                        inpg.removeChild(iga);
                    }
                }
            },
            disposeWhen: () => false
        });

        if (element) {
            dom.addClass(element, 'row form-group');

            element.appendChild(lbc);
            element.appendChild(ipc);

            lbc.appendChild(label);

            ipc.appendChild(inpg);
            inpg.appendChild(input);

            dom.setAttr(input, 'id', id);

            HtmlUtils.createLabel(obsr, label);
        }

        return { container: element, input: input };
    }
}