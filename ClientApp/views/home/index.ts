import { ko } from '@app/providers';
import { prop, component } from '@app/common/ko';

@component({
    url: '/',
    icon: 'fa fa-home',
    title: '#home',
    styles: require('./style.scss'),
    template: require('./index.html'),
    resources: require('./resources.json')
})
export class HomeViewModel implements IView, IDispose {
    public input = ko.observableString('')
        .extend({
            required: true,
            $name: 'home',
            $constraint: '#constraint',
            $columns: ['col-md-2', 'col-md-4'],
            $icons: {
                //before: ' fa fa-clock-o'
                //,after: 'fas fa-sort-down'
            }
        });

    @prop()
    public checkbox = ko.observableSelection('')
        .extend({
            required: false,
            $name: 'checkbox',
            $columns: ['col-md-2', 'col-md-4'],
            dataSources: ['Options 1', 'Options 2', 'Options 3']
        });

    constructor(params: any, private element: HTMLElement) {
        console.log(params);

        this.input.subscribe(v => {
            console.log(v);
        })

        ko.utils.extend(window, { inp: this.input });
    }

    dispose(): void {
        console.log("Home view disposed!");
    }

    afterRender(): void {
        console.log("Home view renderred!");
    }
}