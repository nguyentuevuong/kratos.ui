import { component } from '@app/common/ko';
@component({
    url: '/product/add',
    icon: "fas fa-plus-circle",
    title: '#product_add',
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductAddViewModel {

}