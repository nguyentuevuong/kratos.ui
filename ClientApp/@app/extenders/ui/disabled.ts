import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';
ko.utils.extend(ko.extenders, {
    $disable: (target: ValidationObservable<number>, disable: boolean) => {
        extend(target);

        if (!_.isEqual(ko.toJS(target.$disable), disable)) {
            // extend disabled prop of observable
            if (ko.isObservable(target.$disable)) {
                target.$disable(ko.toJS(disable));
            } else {
                ko.utils.extend(target, {
                    $disable: ko.observableOrig(ko.toJS(disable))
                });
            }

            // extend enable prop of observable
            target.extend({
                $enable: !disable
            });
        }

        return target;
    }
});