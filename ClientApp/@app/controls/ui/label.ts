import { handler } from '@app/common/ko';
import { HtmlUtils } from '@app/common/utils/html';

@handler({
    bindingName: 'label'
})
export class LabelControlBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => ValidationObservable<any>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        HtmlUtils.createLabel(valueAccessor(), element);

        return { controlsDescendantBindings: true };
    }
}