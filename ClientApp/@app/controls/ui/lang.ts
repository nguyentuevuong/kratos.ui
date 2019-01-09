import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { i18text, lang, i18n } from '@app/common/lang';

@handler({
    virtual: false,
    bindingName: 'lang',
    resources: {
        "en": {
            "language": "Language",
            "jp": "Japan"
        },
        "vi": {
            "language": "Ngôn ngữ",
            "jp": "Japan"
        },
        "jp": {
            "language": "言語",
            "jp": "日本語"
        }
    }
})
export class LanguageBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let dom = ko.utils.dom,
            current = ko.toJS(lang),
            button = dom.create('a', {
                href: '#',
                class: 'nav-item nav-link dropdown-toggle mr-md-2',
                html: `<span>${i18text(current)}</span>`
            }),
            dropdown = dom.create('div', {
                text: i18text(current),
                class: 'dropdown-menu dropdown-menu-right'
            }),
            bindEvent = ko.utils.registerEventHandler;

        element.appendChild(button);
        element.appendChild(dropdown);
        dom.addClass(element, 'dropdown');

        bindEvent(dropdown, 'click', (evt: MouseEvent) => {
            let target = evt.target as HTMLElement;

            if (target && target.tagName == 'A') {
                current = ko.utils.domData.get(target, 'lang');

                if (current) {
                    lang(current);
                    ko.utils.setHtml(button, `<span>${i18text(current)}</span>`);
                }
            }
        });

        ko.computed({
            read: () => {
                let current = ko.toJS(lang),
                    regions: Array<string> = ko.utils.keys(i18n);

                dom.empty(dropdown);
                ko.utils.arrayForEach(regions, rgi => {
                    let item = dom.create('a', {
                        href: '#',
                        text: i18text(rgi)
                    });

                    dropdown.appendChild(item);
                    dom.addClass(item, 'dropdown-item');
                    ko.utils.domData.set(item, 'lang', rgi);

                    if (rgi === current) { dom.addClass(item, 'active'); }
                });
            }
        });
    }
}