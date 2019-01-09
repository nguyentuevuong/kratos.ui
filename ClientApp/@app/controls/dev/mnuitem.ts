import { ko } from '@app/providers';
import { handler } from '@app/common/ko';

@handler({
    virtual: false,
    bindingName: 'mnuitem'
})
export class MenuItemBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => IMenu, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let menu: IMenu = valueAccessor();

        if (!menu.component) {

        } else {

        }
    }
}