import { _, ko } from '@app/providers';
import { component } from '@app/common/ko';

@component({
    url: 'sample/documents/view',
    icon: 'fa fa-cogs',
    title: '#view',
    template: require('./index.html'),
    resources: {
        'en': {
            'sample|documents': 'Documents'
        },
        'vi': {
            'sample|documents': 'Tài liệu hướng dẫn'
        }
    }
})
export class ResourceDocumentViewModel {
    content: string = require('./content.txt');
}