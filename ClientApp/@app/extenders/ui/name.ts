import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $name: (target: ValidationObservable<number>, name: string) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$name)) {
            target.$name(ko.toJS(name));
        } else {
            ko.utils.extend(target, {
                $name: ko.observableOrig(ko.toJS(name))
            });
        }

        ko.utils.extend(target, {
            name: ko.toJS(name)
        });

        return target;
    }
});