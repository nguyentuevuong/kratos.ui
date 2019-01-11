import { component } from '@app/common/ko';
@component({
    url: '/doitac/khachhang',
    icon: "far fa-user",
    title: '#doitac_khachhang',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class DoiTacKhachHangViewModel {

}