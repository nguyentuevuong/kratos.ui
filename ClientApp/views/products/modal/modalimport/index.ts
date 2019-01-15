import { component } from '@app/common/ko';

@component({
    title: 'product_modalimport',
    url: '/product/modal-modalimport',
    icon: "fas fa-list",
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductModalAddProductsViewModel {

}