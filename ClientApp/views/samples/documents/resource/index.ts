import { _, ko } from '@app/providers';
import { component } from '@app/common/ko';

@component({
    url: 'sample/documents/resource',
    icon: 'fa fa-cogs',
    title: '#resource',
    template: require('./index.html'),
    resources: {
        'en': {
        },
        'vi': {
        }
    }
})
export class ResourceDocumentViewModel {

}