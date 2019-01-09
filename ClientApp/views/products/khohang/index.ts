import { component } from '@app/common/ko';
@component({
    url: '/product/khohang',
    icon: "fas fa-plus-circle",
    title: '#product_khohang',
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductKhoHangViewModel {

}