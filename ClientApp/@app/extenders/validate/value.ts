import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $value: (target: ValidationObservable<number>, value: string) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$value)) {
            let store: string = ko.toJS(target.$value);

            if (store != value) {
                target.$value(ko.toJS(value));
            } else {
                target.$value!.valueHasMutated!();
            }
        } else {
            ko.utils.extend(target, {
                $value: ko.observableOrig(ko.toJS(value))
            });
        }

        return target;
    }
});