import { ko, history } from '@app/providers';

import { Components } from '@app/common/ko';
import { URL } from '@app/common/route/url';
import { lang, i18text } from '@app/common/lang';

// History component needs no trailing slash
const base = document.querySelector('base'),
    title = document.querySelector('head>title'),
    baseUrl = base!.getAttribute('href') || '',
    baseName = baseUrl.substring(0, baseUrl.length - 1);

// route for spa
ko.utils.extend(ko, {
    router: {
        current: ko.observableOrig({ url: '/', name: 'home' }),
        back: () => history.back(),
        goto: (url: string, params: any) => history.pushState(params, url)
    },
});

// subscribe for title
ko.computed({
    read: () => {
        ko.toJS(lang);
        let route = ko.toJS(ko.router.current);

        if (title) {
            title.textContent = !!route.title ? i18text(route.title) : (route.url || '');
        }
    }
});

history.listener((data: any, url: string) => {
    let first = ko.utils.arrayFirst,
        component = first(Components.map((r: IComponent) => ({
            url: r.url,
            name: r.name,
            icon: r.icon,
            title: r.title,
            match: URL.pathToRegexp(r.url).exec(url)
        })), (m: { name: string; match: RegExpExecArray | null; }) => !!m.match);

    if (!component) {
        ko.router.current({
            url: url,
            icon: 'd-none',
            name: 'page_404',
            title: '#page_404'
        });
    } else {
        let params: any = {},
            urlVals: RegExpMatchArray | null = component.match,
            urlKeys: RegExpMatchArray | null = component.url.match(/:[^\s/]+/g);

        if (urlVals && urlKeys) {
            let vals = urlVals.slice(1),
                keys = urlKeys.map(m => m.replace(/(^:|\?$)/g, ''));

            ko.utils.arrayForEach(keys, (k: string, i: number) => params[k] = vals[i]);
        }

        ko.utils.merge(params, data);

        ko.router.current({
            url: url,
            name: component.name,
            icon: component.icon,
            title: component.title,
            params: params
        });
    }
});

ko.utils.registerEventHandler(document, 'click', (evt: MouseEvent) => {
    let target: HTMLElement | null = evt.target as HTMLElement,
        clickPrevent = (anchor: HTMLAnchorElement) => {
            let href = anchor.getAttribute('href') || '#';

            if (href.indexOf(`${baseName}/`) === 0) {
                href = href.substring(baseName.length);

                if (href != location.pathname) {
                    history.pushState(null, href.substring(baseName.length));
                }

                evt.preventDefault();
            } else if (href == "#") {
                evt.preventDefault();
            }
        };

    if (target) {
        if (target.tagName === 'A') {
            clickPrevent(target as HTMLAnchorElement);
        } else {
            target = target.closest('a') as HTMLElement;
            if (target) {
                clickPrevent(target as HTMLAnchorElement);
            }
        }
    }
});