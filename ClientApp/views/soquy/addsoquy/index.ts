import { component } from '@app/common/ko';
@component({
    url: '/soquy',
    icon: "fas fa-plus-circle",
    title: '#soquy_addsoquy',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class AddSoQuyViewModel {

}