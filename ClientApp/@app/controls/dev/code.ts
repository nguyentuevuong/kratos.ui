import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { Highlighter } from '@app/common/utils';

@handler({
    virtual: false,
    bindingName: 'code'
})
export class I18nBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: any, allBindingsAccessor: any, viewModel: any, bindingContext: KnockoutBindingContext) => {
        element.classList.add('pretty-print');
        ko.bindingHandlers.html.init!(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
    update = (element: HTMLElement, valueAccessor: any, allBindingsAccessor: any, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let code: string | object = ko.unwrap(valueAccessor()),
            type: string = ko.toJS(ko.unwrap(allBindingsAccessor().type) || '');

        if (typeof code === 'string') {
            if (String(code).indexOf('#') == 0) {
                type = "xml";
                let selector = document.querySelector(code);
                if (selector) {
                    ko.cleanNode(selector);

                    code = ko.utils.unescape((selector.textContent || "").replace(/\<br\s*\/*\>/g, '\n').trim());
                }
            } else {
                if (!code) {
                    code = ko.utils.unescape((element.textContent || "").replace(/\<br\s*\/*\>/g, '\n').trim());
                }

                switch (type) {
                    case 'css':
                    case 'scss':
                        type = "css";
                        break;
                    default:
                    case 'xml':
                    case 'html':
                        type = "html";
                        break;
                    case 'javascript':
                    case 'typescript':
                        type = "javascript";
                        break;
                }
            }
        } else {
            type = "json";
        }

        ko.bindingHandlers.html.update!(element, () => `<code class='${type}'>${code}</code>`, allBindingsAccessor, viewModel, bindingContext);

        Highlighter.init();
    }
}