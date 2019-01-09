import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $icons: (target: ValidationObservable<number>, icons: { before?: string, after?: string }) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$icons)) {
            target.$icons(ko.toJS(icons));
        } else {
            ko.utils.extend(target, {
                $icons: ko.observableOrig(ko.toJS(icons))
            });
        }

        return target;
    }
});