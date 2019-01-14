import { component } from '@app/common/ko';

@component({
    title: 'product_addproducts',
    url: '/product/modal/addproducts',
    icon: "fas fa-list",
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductModalAddProductsViewModel {

}