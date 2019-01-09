import { ko } from '@app/providers';
import { component } from "@app/common/ko";
import { menu } from '@app/common/utils/menu';

@component({
    name: 'mnuside',
    template: require('./index.html')
})
export class MenuSideViewModel {
    routes: IMenu[] = menu.sample;
    keyword: KnockoutObservableString = ko.observableOrig('');
    constructor() {
        ko.utils.extend(window, { ko, menu });
    }
}