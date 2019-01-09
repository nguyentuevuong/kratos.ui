import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    invalid: (target: ValidationObservable<any>, params: IRequireConfig | boolean) => {
        //add some sub-observables to our observable
        extend(target);

        // add or update require validate
        if (!params) {
            target.removeValidate!('invalid');
        } else {
            target.addValidate!('invalid', (value: any) => {
                if (_.isNil(value)) {
                    target.removeError!('required');
                    target.addError!('invalid', "#field_invalid");
                } else {
                    target.removeError!('invalid');
                }
            });
        }

        // clear error for first binding time
        target.removeError!('invalid');

        //return the original observable
        return target;
    }
});

interface IRequireConfig {
    message: string;
    validate: () => boolean;
}