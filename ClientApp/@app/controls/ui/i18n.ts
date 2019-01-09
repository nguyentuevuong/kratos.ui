import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { i18text } from '@app/common/lang';

@handler({
    virtual: false,
    bindingName: 'i18n'
})
export class I18nBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => KnockoutObservable<Ii18n | string | number> | Ii18n | string | number, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        ko.computed({
            read: () => {
                let i18n: number | string | Ii18n = ko.toJS(valueAccessor()),
                    params: { [key: string]: string } = ko.toJS(allBindingsAccessor().params);

                if (['number', 'string'].indexOf(typeof i18n) > -1) {
                    element.innerText = i18text(i18n.toString(), params);
                } else {

                    ko.utils.objectForEach(i18n, (key: string, value: string) => {
                        if (typeof value === 'string') {
                            if (key == 'html') {
                                element.innerHTML = i18text(value, params);
                            } else if (key == 'text') {
                                element.innerText = i18text(value, params);
                            } else {
                                element.setAttribute(key, i18text(value, params));
                            }
                        }
                    });
                }
            }
        });
    }
}