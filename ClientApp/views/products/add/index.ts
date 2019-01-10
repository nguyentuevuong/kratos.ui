import { component } from '@app/common/ko';
@component({
    url: '/product/add',
    icon: "fas fa-plus-circle",
    title: '#product_add',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductAddViewModel {

}