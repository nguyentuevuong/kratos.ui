import { ko } from '@app/providers';
import { component } from '@app/common/ko';
import { lang } from '@app/common/lang';

@component({
    url: 'sample/documents/route',
    icon: 'fa fa-cogs',
    title: '#route',
    template: require('./index.html'),
    resources: {
        'en': {
        },
        'vi': {
        }
    }
})
export class RouteDocumentViewModel {
    resources: { [key: string]: string } = {
        vi: require('./contents/vi.txt'),
        en: require('./contents/en.txt')
    };
}