import { component } from '@app/common/ko';

@component({
    title: 'product_addcombo',
    url: '/product/modal-addcombo',
    icon: "fas fa-list",
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductModalAddProductsViewModel {

}