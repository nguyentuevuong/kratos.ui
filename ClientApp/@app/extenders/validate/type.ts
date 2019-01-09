import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $type: (target: ValidationObservable<number>, type: { [key: string]: any }) => {
        extend(target);

        // init type object
        if (!ko.isObservable(target.$type)) {
            target.$type = ko.observableOrig({});
        }

        let $type: { [key: string]: KnockoutObservable<any> } = ko.toJS(target.$type);

        if (!type) {
            _.forIn(target.$type, (value: any, key: string) => {
                if (ko.isObservable($type[key])) {
                    $type[key](undefined);
                }
            });
        } else {
            _.forIn(type, (value: any, key: string) => {
                if (ko.isObservable($type[key])) {
                    $type[key](value);
                } else {
                    $type[key] = ko.observableOrig(ko.toJS(value));
                }
            });
        }

        target.$type!($type);

        return target;
    }
});