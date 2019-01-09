import { _, ko } from '@app/providers';
import { component } from '@app/common/ko';
import { CodeHighlighter } from '@app/common/utils/highlight';

@component({
    url: 'sample/documents/hightlight',
    icon: 'fa fa-cogs',
    title: '#style',
    styles: require('./style.scss'),
    template: require('./index.html')
})
export class HighLightDocumentViewModel {

}