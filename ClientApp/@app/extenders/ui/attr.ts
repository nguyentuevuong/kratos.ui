import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $attr: (target: ValidationObservable<number>, attr: { [key: string]: any }) => {
        extend(target);

        // init attr object
        if (!ko.isObservable(target.$attr)) {
            target.$attr = ko.observableOrig({});
        }

        let $attr: { [key: string]: KnockoutObservable<any> } = ko.toJS(target.$attr);

        if (!attr) {
            _.forIn(target.$attr, (value: any, key: string) => {
                if (ko.isObservable($attr[key])) {
                    $attr[key](undefined);
                }
            });
        } else {
            _.forIn(attr, (value: any, key: string) => {
                if (ko.isObservable($attr[key])) {
                    $attr[key](value);
                } else {
                    $attr[key] = ko.observableOrig(ko.toJS(value));
                }
            });
        }

        target.$attr!($attr);

        return target;
    }
});