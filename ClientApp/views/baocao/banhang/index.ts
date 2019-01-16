import { component } from '@app/common/ko';
@component({
    url: '/baocao/banhang',
    icon: "far fa-newspaper",
    title: '#baocao_banhang',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class BaoCaoBanHangViewModel {

}