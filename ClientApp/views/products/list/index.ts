import { component } from '@app/common/ko';

@component({
    url: '/product/list',
    title: '#product_list',
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductListViewModel {

}