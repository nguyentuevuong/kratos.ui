import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $constraint: (target: ValidationObservable<number>, constraint: string) => {
        extend(target);

        // extend constraint prop of observable
        if (ko.isObservable(target.$constraint)) {
            target.$constraint(ko.toJS(constraint));
        } else {
            ko.utils.extend(target, {
                $constraint: ko.observableOrig(ko.toJS(constraint))
            });
        }

        return target;
    }
});