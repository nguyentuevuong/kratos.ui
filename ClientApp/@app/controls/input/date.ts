import { ko } from '@app/providers';
import { handler } from '@app/common/ko';
import { HtmlUtils } from '@app/common/utils/html';
import { InputMaskCore } from '@app/common/utils/mask';

const dom = ko.utils.dom,
    ddt = ko.utils.domData,
    ddkey = '__dom_elements__',
    regEvent = ko.utils.registerEventHandler;

@handler({
    virtual: false,
    bindingName: 'date'
})
export class DateBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let elements = HtmlUtils.createInput(valueAccessor(), element);

        InputMaskCore.init(elements.input, {
            mask: '__/__/____',
            definitions: {
                '_': /\d/
            }
        });

        return { controlsDescendantBindings: true };
    }
}