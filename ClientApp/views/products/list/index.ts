import { component } from '@app/common/ko';

@component({
    url: '/product/list',
    icon: "fas fa-list",
    title: '#product_list',
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductListViewModel {

}