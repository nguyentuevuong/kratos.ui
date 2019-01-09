import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    $enable: (target: ValidationObservable<number>, enable: boolean) => {
        extend(target);

        if (!_.isEqual(ko.toJS(target.$enable), enable)) {
            // extend enable prop of observable
            if (ko.isObservable(target.$enable)) {
                target.$enable(ko.toJS(enable));
            } else {
                ko.utils.extend(target, {
                    $enable: ko.observableOrig(ko.toJS(enable))
                });
            }

            // extend disabled prop of observable
            target.extend({
                $disable: !enable
            });
        }

        return target;
    }
});