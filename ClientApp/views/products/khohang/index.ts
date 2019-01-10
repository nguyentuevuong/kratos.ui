import { component } from '@app/common/ko';
@component({
    url: '/product/khohang',
    icon: "far fa-check-square",
    title: '#product_khohang',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class ProductKhoHangViewModel {

}