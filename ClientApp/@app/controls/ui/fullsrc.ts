import { ko } from '@app/providers';
import { handler } from '@app/common/ko';


const dom = ko.utils.dom,
    regEvent = ko.utils.registerEventHandler;

@handler({
    virtual: false,
    bindingName: 'fullsrc'
})
export class HrefBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: () => KnockoutObservable<boolean>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) => {
        let doc: any = document,
            body: any = doc.documentElement,
            route: KnockoutObservable<boolean> = valueAccessor(),
            anchor = dom.create('a', { 'class': 'nav-link' }),
            italic = dom.create('i', { 'class': 'fas fa-expand-arrows-alt' });

        anchor.appendChild(italic);
        element.appendChild(anchor);

        regEvent(element, 'click', () => {
            if (route()) {
                if (doc.exitFullscreen) {
                    doc.exitFullscreen();
                } else if (doc.mozCancelFullScreen) {
                    doc.mozCancelFullScreen();
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                } else if (doc.msExitFullscreen) {
                    doc.msExitFullscreen();
                }
            } else {
                if (body.requestFullscreen) {
                    body.requestFullscreen();
                } else if (body.mozRequestFullScreen) { /* Firefox */
                    body.mozRequestFullScreen();
                } else if (body.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                    body.webkitRequestFullscreen();
                } else if (body.msRequestFullscreen) { /* IE/Edge */
                    body.msRequestFullscreen();
                }
            }

            route(!ko.toJS(route));

            //dom.toggleClass(italic, 'fa-expand-arrows-alt');
            //dom.toggleClass(italic, 'fa-compress-arrows-alt');
        });
    }
}