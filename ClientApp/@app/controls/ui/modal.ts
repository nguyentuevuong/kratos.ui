import { _, ko } from '@app/providers';
import { i18text } from '@app/common/lang';
import { handler, Modals } from '@app/common/ko';

const dom = ko.utils.dom,
    trgEvent = ko.utils.triggerEvent,
    regEvent = ko.utils.registerEventHandler;

@handler({
    virtual: true,
    bindingName: 'modal'
})
export class ModalBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: any, allBindingsAccessor: any, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let accessor: any = valueAccessor(),
            params: any = ko.unwrap(accessor.params),
            viewName: string = ko.toJS(accessor.viewName),
            configs: IModalConfigs = ko.unwrap(accessor.configs) || {};



        regEvent(element, 'click', (evt: MouseEvent) => {
            if (!ko.utils.isEmpty(viewName)) {
                let modal = dom.create('div', { 'class': 'modal fade', tabindex: -1 }),
                    dialog = dom.create('div', { 'class': 'modal-dialog' }),
                    content = dom.create('div', { 'class': 'modal-content' }),
                    header = dom.create('div', { 'class': 'modal-header' }),
                    title = dom.create('h4', { 'class': 'modal-title' }),
                    close = dom.create('span', { 'class': 'close', html: '&times;' }),
                    body = dom.create('div', { 'class': 'modal-body' }),
                    _comp = ko.utils.arrayFirst(Modals, (c: IComponent) => c.name == viewName);


                if (configs && configs.size) {
                    let size: string = ko.toJS(configs.size);

                    if (size.indexOf('modal-') == -1) {
                        size = 'modal-' + size;
                    }

                    dom.addClass(dialog, size);
                }

                modal.appendChild(dialog);
                dialog.appendChild(content);

                content.appendChild(header);

                header.appendChild(title);
                header.appendChild(close);

                content.appendChild(body);

                if (_comp) {
                    let icon = dom.create('i', { 'class': _comp.icon || 'd-none' }),
                        name = dom.create('span', { html: i18text(_comp.title) });

                    title.appendChild(icon);
                    title.appendChild(name);
                }

                ko.bindingHandlers.component.init!(body, () => ({ name: viewName || 'no-component' }), allBindingsAccessor, viewModel, bindingContext);

                document.body.appendChild(modal);

                dom.addClass(document.body, 'modal-open');

                dom.addClass(modal, 'animated fadeInDown show');

                // close dialog
                regEvent(close, 'click', (evt: MouseEvent) => {
                    ko.cleanNode(body);

                    document.body.removeChild(modal);
                    dom.removeClass(document.body, 'modal-open');
                });
            }
        });

        /*$element.on('click', () => {
            if (_.isString(viewName) && !_.isEmpty(viewName)) {
                let $modal = $('<div>', { 'class': 'modal fade', role: 'dialog', tabindex: -1 }),
                    $dialog = $('<div>', { 'class': 'modal-dialog', role: 'document' }), //modal-lg modal-dialog-centered
                    $content = $('<div>', { 'class': 'modal-content' }),
                    $header = $('<div>', { 'class': 'modal-header' }),
                    $htitle = $('<h4>', { 'class': 'modal-title', html: '#noname' }),
                    $hclose = $('<span>', { 'class': 'close', 'data-dismiss': 'modal', html: '&times;' }),
                    $body = $('<div>', { 'class': 'modal-body' });

                $modal.append($dialog);
                $dialog.append($content);

                let _comp = _.find(Components, (c: IComponent) => _.isEqual(c.name, viewName));

                if (!_.isNil(_comp)) {
                    $htitle.empty();
                    $htitle.append($('<i>', { 'class': `${_comp.icon} mr-2` })).append($('<span>', { text: getText(_comp.title || '') }));
                }

                $header.append($htitle).append($hclose);

                $content
                    .append($header)
                    .append($body);

                $('body').append($modal);

                $modal.modal({
                    show: true,
                    focus: true,
                    backdrop: !!ko.toJS(configs.backdrop),
                });

                ko.computed({
                    read: () => {
                        let modaless: boolean = ko.toJS(configs.modaless);

                        if (modaless) {
                            $modal.addClass('modaless');
                        } else {
                            $modal.removeClass('modaless');
                        }
                    }
                });

                $modal
                    .on('shown.bs.modal', () => {
                        let modaless: boolean = ko.toJS(configs.modaless);

                        if (!modaless) {
                            // remove tabindex of all input item
                            $('body [tabindex], body a, body button, body input, body select, body textarea').each((i, tab) => {
                                let $tab = $(tab);

                                $tab
                                    .attr({
                                        'data-tabindex': _.isNil($tab.attr('tabindex')) ? -1 : $tab.attr('tabindex')
                                    }).attr({
                                        'tabindex': '-1'
                                    });
                            });

                            $body.find('[tabindex]').each((i, tab) => {
                                let $tab = $(tab);

                                if ($tab.attr('data-tabindex') != '-1') {
                                    $tab
                                        .attr({
                                            'tabindex': $tab.attr('data-tabindex')
                                        })
                                } else {
                                    $tab.removeAttr('tabindex');
                                }

                                $tab.removeAttr('data-tabindex');
                            });
                        }

                        // bind component to modal
                        ko.bindingHandlers['component'].init!($body[0], () => ({ name: viewName || 'no-component', params: params }), allBindingsAccessor, viewModel, bindingContext);
                    })
                    .on('hidden.bs.modal', () => {
                        // remove modal when hide
                        $modal.modal('dispose').remove();

                        // restore all tabindex
                        $('body').find('[tabindex]').each((i, tab) => {
                            let $tab = $(tab);

                            if ($tab.attr('data-tabindex') != '-1') {
                                $tab
                                    .attr({
                                        'tabindex': $tab.attr('data-tabindex')
                                    })
                            } else {
                                $tab.removeAttr('tabindex');
                            }

                            $tab.removeAttr('data-tabindex');
                        });

                        // focus to old element
                        $element.focus();
                    }).find('.modal-content').draggable({
                        handle: ".modal-header"
                    });
            }
        }); */
    }
}

export interface IModalConfigs {
    size: 'lg' | 'md' | 'sm' | KnockoutObservable<string>,
    backdrop: boolean | KnockoutObservable<boolean>,
    closeBtn: boolean | KnockoutObservable<boolean>,
    modaless: boolean | KnockoutObservable<boolean>
}

/**
 * Register event close dialog for all button in dialog
 */
regEvent(document, 'click', (evt: MouseEvent) => {
    let target: HTMLElement = evt.target as HTMLElement;

    if (target && target.getAttribute('data-close') == 'modal') {
        let dialog = dom.parents(target, '.modal');

        if (dialog) {
            trgEvent(dialog.querySelector('.close'), 'click');
        }
    }
});