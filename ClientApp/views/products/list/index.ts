import { component } from '@app/common/ko';

@component({
    title: 'product',
    url: '/product/list',
    icon: "fas fa-list",
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductListViewModel {

}