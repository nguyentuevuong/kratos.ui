import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $multiline: (target: ValidationObservable<number>, multiline: boolean) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$multiline)) {
            target.$multiline(ko.toJS(multiline));
        } else {
            ko.utils.extend(target, {
                $multiline: ko.observableOrig(ko.toJS(multiline))
            });
        }
        
        return target;
    }
});