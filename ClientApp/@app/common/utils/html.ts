import { ko } from '@app/providers';
import { i18text } from '@app/common/lang';

const dom = ko.utils.dom;

export class HtmlUtils {
    /**
     * Create label for form group from observable
     * @param obsr KnockoutObservable<any>
     * @param element binding container for form group
     */
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

    /**
     * create all element for form group (not contain input/select element)
     */
    private static createFormGroup(obsr: ValidationObservable<any>, element?: HTMLElement): { container: HTMLElement, group: HTMLElement } {
        let lbc = dom.create('div'),
            ipc = dom.create('div'),
            label = dom.create('label'),
            inpg = dom.create('div', { 'class': 'input-group input-group-transparent' }), //input-group-transparent
            iga = dom.create('div', { 'class': 'input-group-append' }),
            icb = dom.create('i'),
            ica = dom.create('i'),
            igp = dom.create('div', { 'class': 'input-group-prepend' });

        element = element || dom.create('div', { 'class': 'row' });

        if (element) {
            dom.addClass(element, 'row form-group');

            HtmlUtils.createLabel(obsr, label);

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

            element.appendChild(lbc);
            element.appendChild(ipc);

            lbc.appendChild(label);

            ipc.appendChild(inpg);
        }

        return { container: element, group: inpg };
    }

    /**
     * 
     * @param obsr KnockoutObservable<any>
     * @param element binding container for form group
     */
    public static createInput(obsr: ValidationObservable<any>, element?: HTMLElement): { container: HTMLElement, input: HTMLInputElement } {
        let id = ko.toJS(obsr.$id) || ko.toJS(obsr.$attr).id,
            input = dom.create('input', { type: 'text', class: 'form-control' }) as HTMLInputElement,
            elements = HtmlUtils.createFormGroup(obsr, element);

        dom.setAttr(input, 'id', id);
        elements.group.appendChild(input);

        return { container: elements.container, input: input };
    }

    /**
     * 
     * @param obsr KnockoutObservable<any>
     * @param element binding container for form group
     */
    public static createSelect(obsr: ValidationObservable<any>, element?: HTMLElement): { container: HTMLElement, select: HTMLSelectElement } {
        let id = ko.toJS(obsr.$id) || ko.toJS(obsr.$attr).id,
            select = dom.create('select', { class: 'form-control' }) as HTMLSelectElement,
            elements = HtmlUtils.createFormGroup(obsr, element);

        dom.setAttr(select, 'id', id);
        elements.group.appendChild(select);

        return { container: elements.container, select: select };
    }

    /**
     * 
     * @param obsr KnockoutObservable<any>
     * @param element binding container for form group
     */
    public static createCheckBoxs(obsr: ValidationObservable<any>, element?: HTMLElement): { container: HTMLElement, select: HTMLSelectElement } {
        let id = ko.toJS(obsr.$id) || ko.toJS(obsr.$attr).id,
            select = dom.create('select', { class: 'form-control' }) as HTMLSelectElement,
            elements = HtmlUtils.createFormGroup(obsr, element);

        dom.setAttr(select, 'id', id);
        elements.group.appendChild(select);

        return { container: elements.container, select: select };
    }
}