import { ko } from '@app/providers';
import { md } from '@app/common/utils';
import { lang } from '@app/common/lang';
import { handler } from '@app/common/ko';

@handler({
    virtual: false,
    bindingName: 'markdown'
})
export class I18nBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let markdown = valueAccessor();

        ko.utils.dom.addClass(element, 'markdown markdown-html-preview');

        ko.computed({
            read: () => {
                let _lang: string = ko.toJS(lang),
                    content: string | any = ko.toJS(markdown);

                if (typeof content == 'string') {
                    ko.utils.setHtml(element, md.parse(ko.toJS(content)));
                } else {
                    ko.utils.setHtml(element, md.parse(ko.toJS(content[_lang])));
                }

                //ko.cleanNode(element);
                //ko.applyBindings({}, element);
            }
        });

        return { controlsDescendantBindings: true };
    }
}