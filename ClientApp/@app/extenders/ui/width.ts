import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $width: (target: ValidationObservable<number>, width: number) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$width)) {
            target.$width(ko.toJS(width));
        } else {
            ko.utils.extend(target, {
                $width: ko.observableOrig(ko.toJS(width))
            });
        }

        return target;
    }
});