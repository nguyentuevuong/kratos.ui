import { component } from "@app/common/ko";
import { menu } from '@app/common/utils/menu';

@component({
    name: 'mnutop',
    template: require('./index.html')
})
export class MenuTopViewModel {
    routes: IMenu[] = menu.top;
}