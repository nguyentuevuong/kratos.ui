import { ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $focus: (target: ValidationObservable<number>, focus: boolean) => {
        extend(target);

        // extend name prop of observable
        if (ko.isObservable(target.$focus)) {
            target.$focus(ko.toJS(focus));
        } else {
            ko.utils.extend(target, {
                $focus: ko.observableOrig(ko.toJS(focus))
            });
        }

        // extends tabindex attr
        target.extend({
            $attr: {
                tabindex: (ko.toJS(target.$attr) || {}).tabindex || 0
            }
        });

        return target;
    }
});