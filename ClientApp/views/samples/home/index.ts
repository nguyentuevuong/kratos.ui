import { component } from '@app/common/ko';

@component({
    url: 'sample/index',
    icon: 'fa fa-cogs',
    title: 'Index page',
    template: require('./index.html')
})
export class SampleIndexViewModel {

}