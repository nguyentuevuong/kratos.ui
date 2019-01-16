import { component } from '@app/common/ko';
@component({
    url: '/baocao/dathang',
    icon: "fas fa-shopping-basket",
    title: '#baocao_dathang',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class BaoCaoDatHangViewModel {

}