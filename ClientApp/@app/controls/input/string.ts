import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { HtmlUtils } from '@app/common/utils/html';

const dom = ko.utils.dom,
    ddt = ko.utils.domData,
    ddkey = '__dom_elements__',
    regEvent = ko.utils.registerEventHandler;

@handler({
    virtual: false,
    bindingName: 'string'
})
export class StringBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        HtmlUtils.createInput(valueAccessor(), element);

        return { controlsDescendantBindings: true };
    }
}