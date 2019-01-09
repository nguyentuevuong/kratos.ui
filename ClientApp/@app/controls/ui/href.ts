import { ko } from '@app/providers';
import { handler } from '@app/common/ko';

@handler({
    virtual: false,
    bindingName: 'href'
})
export class HrefBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => string | { url: string; data: any; }, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let route: string | { url: string; data: any; } = ko.toJS(valueAccessor());

        ko.utils.dom.setAttr(element, 'href', '#');

        ko.utils.registerEventHandler(element, 'click', (evt: MouseEvent) => {
            if (typeof route === 'string') {
                ko.router.goto(route.replace(/([\/|\-|\_]:\w+)+/g, ''), null);
            } else {
                ko.router.goto(route.url, route.data);
            }
            evt.preventDefault();
        });
    }
}