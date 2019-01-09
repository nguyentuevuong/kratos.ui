import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    validate: (target: ValidationObservable<any>, params: (value: any) => string | undefined) => {
        //add some sub-observables to our observable
        extend(target);

        //validate whenever the value changes
        if (!params) {
            target.removeValidate!('validate');
        } else {
            target.addValidate!('validate', (value: string) => {
                let invalid = params.apply(target, [value]);

                if (!!invalid) {
                    target.addError!('validate', invalid);
                } else {
                    target.removeError!('validate');
                }
            });
        }

        // clear error for first binding time
        target.removeError!('validate');

        //return the original observable
        return target;
    }
});