import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $columns: (target: ValidationObservable<number>, columns: Array<string>) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$columns )) {
            target.$columns(ko.toJS(columns));
        } else {
            ko.utils.extend(target, {
                $columns: ko.observableArrayOrig(ko.toJS(columns))
            });
        }

        return target;
    }
});