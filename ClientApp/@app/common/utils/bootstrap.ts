import { ko } from '@app/providers';

document.addEventListener("click", function (e) {
    let clicked: HTMLElement | null = null;

    // dropdown menu
    ((evt: MouseEvent) => {
        for (let node = evt.target as HTMLElement; node != document.body; node = node.parentNode as HTMLElement) {
            if (!node || !node.parentNode) {
                break;
            }

            if (ko.utils.dom.getAttr(node, 'data-dismiss') == "false") {
                clicked = node;
                break;
            } else if (ko.utils.dom.hasClass(node, 'dropdown') || ko.utils.dom.hasClass(node, 'dropdown-toggle') || ko.utils.dom.getAttr(node, 'data-toggle') == "dropdown") {
                clicked = node;
                break;
            }
        }

        if (clicked) {
            [].slice.call(document.querySelectorAll('.dropdown-toggle, [data-toggle="dropdown"]'))
                .forEach((element: HTMLElement) => {
                    let parent = element.parentNode as HTMLElement,
                        dropdown = parent.querySelector('.dropdown-menu') as HTMLElement | null;

                    ko.utils.dom.addClass(parent, 'dropdown');
                    ko.utils.dom.removeClass(parent, 'dropup');

                    if (dropdown) {
                        if (clicked == element) {
                            if (!ko.utils.dom.hasClass(dropdown, 'show')) {
                                ko.utils.dom.addClass(dropdown, 'show');

                                let scrollTop = window.scrollY,
                                    scrollHeight = window.innerHeight,
                                    offsetTop = dropdown.getBoundingClientRect().top,
                                    offsetHeight = dropdown.offsetHeight;

                                if (scrollTop + scrollHeight <= offsetTop + offsetHeight) {
                                    ko.utils.dom.addClass(parent, 'dropup');
                                    ko.utils.dom.removeClass(parent, 'dropdown');
                                } else {
                                    ko.utils.dom.addClass(parent, 'dropdown');
                                    ko.utils.dom.removeClass(parent, 'dropup');
                                }
                            } else {
                                ko.utils.dom.removeClass(dropdown, 'show');
                            }
                        } else {
                            if (!clicked || clicked.getAttribute('data-dismiss') != 'false') {
                                ko.utils.dom.removeClass(dropdown, 'show');
                            }
                        }
                    }
                });
        } else {
            [].slice.call(document.querySelectorAll('.dropdown-menu'))
                .forEach((element: HTMLElement) => {
                    ko.utils.dom.removeClass(element, 'show');
                });
        }
    })(e);

    // tabs
    ((evt: MouseEvent) => {
        let target = evt.target as HTMLElement;

        if (ko.utils.dom.hasClass(target, 'nav-link') && !ko.utils.dom.hasClass(target, 'disabled')) {
            let parent = target.closest('.nav.nav-tabs'),
                href = ko.utils.dom.getAttr(target, 'href');

            if (parent) {
                [].slice.call(parent.querySelectorAll('.nav-link'))
                    .forEach((element: HTMLElement) => {
                        ko.utils.dom.removeClass(element, 'active');
                    });

                ko.utils.dom.addClass(target, 'active');

                let siblings = parent.nextSibling as HTMLElement;

                if (siblings && href.match(/#.+/)) {
                    let tab = siblings.querySelector(href) as HTMLElement;

                    [].slice.call(siblings.querySelectorAll('.tab-pane'))
                        .forEach((element: HTMLElement) => {
                            if (tab == element) {
                                ko.utils.dom.addClass(element, 'show active');
                            } else {
                                ko.utils.dom.removeClass(element, 'show active');
                            }
                        });
                }
            }
            evt.preventDefault();
        }
    })(e);

    // other event
});
