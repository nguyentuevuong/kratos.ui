import { ko } from '@app/providers';
import { component } from '@app/common/ko';

@component({
    url: '/',
    icon: 'fa fa-home',
    title: '#home',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class HomeViewModel implements IView, IDispose {
    input = ko.observable('').extend({ required: true, $name: 'label', $constraint: '#constraint', $columns: ['col-md-2', 'col-md-4'], /*$icons: { before: ' fa fa-clock-o', after: 'fas fa-sort-down' }*/ });

    constructor(params: any, private element: HTMLElement) {
        console.log(params);

        this.input.subscribe(v => {
            console.log(v);
        })
    }

    dispose(): void {
        console.log("Home view disposed!");
    }

    afterRender(): void {
        console.log("Home view renderred!");
    }
}