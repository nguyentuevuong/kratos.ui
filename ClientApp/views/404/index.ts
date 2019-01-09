import { ko } from '@app/providers';
import { component } from '@app/common/ko';

@component({
    name: 'page_404',
    title: '#page_404',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class Page404ViewModel {
    constructor(params: any, private element: HTMLElement) {
    }
}