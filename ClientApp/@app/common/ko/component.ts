import { ko } from '@app/providers';
import { i18n } from '@app/common/lang';
import { md5, random } from '@app/common/utils';

const Components: IComponent[] = [],
    /**
     * Register Knockout component by decorating ViewModel class
     **/
    component = (params: IDecoratorComponent) => {
        return function (constructor: ComponentConstructor) {
            let id = random.id;

            // merge resources
            ko.utils.merge(i18n, params.resources);

            if (!params.name) {
                if (!params.url) {
                    params.name = id;
                } else {
                    params.name = md5.init(params.url.replace(/\/+/gi, '-').replace(/^-/gi, ''));
                }
            }

            // add all component to component
            if (params.url) {
                Components.push({
                    url: `/${params.url}`.replace(/\/+/gi, "/"),
                    name: params.name || id,
                    icon: params.icon || 'd-none',
                    title: params.title || params.name
                });
            }

            if (!!params.styles) {
                let rid: string = `[role="${id}"]`,
                    styles: string = params.styles;

                params.styles = styles
                    .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '')
                    // now all comments, newlines and tabs have been removed
                    .replace(/\s{2,}/g, ' ')
                    // now there are no more than single adjacent spaces left
                    // now unnecessary: replace( /(\s)+\./g, ' .' );
                    .replace(/\s([{:}])\s/g, '$1')
                    // remove space after ; or ,
                    .replace(/([;,])\s/g, '$1')
                    // remove space before important char
                    .replace(/\s!/g, '!')
                    // add rid to selector
                    .replace(/((([a-z]|.[a-z])|(}[a-z]|}.[a-z]))(-|_|[a-z]|[0-9])*,)/gi, `$1${rid} `)
                    .replace(/}(?!$)/gi, `}${rid} `)
                    // add rid to first selector of @media group
                    .replace(/\{([a-z]|.[a-z]|[a-z]\.[a-z])*(-|_|[a-z]|[0-9])*\{/gi, (st: string) => `{${rid} ${st.replace(/{/g, '')}{`)
                    // remove rid from last }
                    .replace(/\[role="([a-z0-9])+"\]\s}/gi, '}')
                    // replace rid from before @media by newline char*
                    .replace(/\[role="([a-z0-9])+"\]\s@media/gi, '\r@media')
                    // add newline (and) or tab to group 
                    .replace(/.+/gi, (st: string) => {
                        // add new line before rid
                        return st.replace(/(\[role=")/gi, '\r$1')
                            .replace(/(,\r\[role=")/gi, ',[role="')
                            .replace(/(\r\[role=")/gi, (rt: string) => `\r${st.indexOf('@media') == 0 ? '\t' : ''}${rt.trim()}`)
                            .replace(/}}/gi, '}\r}');
                    })
                    .replace(/:\s/gi, ':')
                    .replace(/;}/gi, '}');

                params.styles = `<style type='text/css'>${rid} ${params.styles}</style>`;
            }

            let hasUrl = !!params.url,
                viewName = params.name;
            ko.components.register(viewName, ko.utils.extend({
                viewModel: {
                    createViewModel: (params: any, elementRef: ElementRef) => {
                        let element = elementRef.element,
                            templateNodes: Array<HTMLElement> = [].slice.call(elementRef.templateNodes)
                                .filter((node: HTMLElement) => !!node.tagName);

                        element.setAttribute('role', id);

                        return new constructor(ko.utils.omit(params, ['$raw', 'component']), element, templateNodes);
                    }
                },
                template: `${params.styles || ''}
            ${hasUrl ? '<!-- ko template: { afterRender: ($vm.afterRender || function() {}).bind($vm) } -->' : ''}
            ${params.template || `<span data-bind="i18n: 'view_name'"></span><span>:&nbsp</span><span data-bind="i18n: '${viewName}'"></span>`}
            ${hasUrl ? '<!-- /ko -->' : ''}`.trim(),
                synchronous: true,
            }, params.options as Object));
        };
    };

export { Components, component };