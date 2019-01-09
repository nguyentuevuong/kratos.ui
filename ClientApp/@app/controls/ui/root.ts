import { ko } from '@app/providers';
import { handler, component } from '@app/common/ko';

/**
 * root binding for spa
 */

@handler({
    virtual: false,
    bindingName: 'root'
})
export class RootAppBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => KnockoutObservable<IComponent>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let dom = ko.utils.dom,
            app = dom.create('div'),
            root = dom.create('div', { 'class': 'container-fluid' }),
            mnutop = dom.create('header', { 'data-bind': "component: { name }" });

        element.appendChild(mnutop);
        ko.applyBindings({ name: 'mnutop' }, mnutop);

        root.appendChild(app);
        element.appendChild(root);

        ko.computed({
            read: () => {
                let component: IComponent = ko.toJS(valueAccessor());

                ko.cleanNode(app);

                dom.empty(app);
                dom.removeAttr(app, 'role');
                dom.removeAttr(app, "class");
                dom.removeAttr(app, 'data-bind');

                if (component.url.indexOf('sample') == -1) {
                    dom.addClass(app, "app");
                    dom.setAttr(app, 'data-bind', "component: { name, params }");
                } else {
                    dom.addClass(app, "row sample");
                    dom.setHtml(app, `<div class="col-md-2" data-bind="component: side"></div><div class="col-md-10" data-bind="component: { name, params }"></div>`);
                }

                ko.applyBindings({ side: 'mnuside', name: component.name, params: component.params }, app);
            }
        });

        return { controlsDescendantBindings: true };
    }
}