import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    required: (target: ValidationObservable<any>, params: IRequireConfig | boolean) => {
        //add some sub-observables to our observable
        extend(target);

        if (!ko.isObservable(target.$require)) {
            target.$require = ko.observableOrig(false);
        }

        // add or update require validate
        if (!params) {
            // extend $require for label control
            target.$require(false);

            // remove validate required
            target.removeValidate!('required');
        } else {
            // extend $require for label control
            target.$require(true);

            // add validate required
            target.addValidate!('required', (value: any) => {
                if (typeof params == 'object') {
                    if (_.has(params, 'validate')) {
                        if (params.validate.apply(target, [value])) {
                            target.addError!('required', params.message || "#field_required");
                        } else {
                            target.removeError!('required');
                        }
                    } else {
                        if (_.isNil(value)) {
                            target.addError!('required', params.message || "#field_required");
                        } else {
                            target.removeError!('required');
                        }
                    }
                } else {
                    if (_.isString(value) ? _.isEmpty(value) : _.isNil(value)) {
                        target.addError!('required', "#field_required");
                    } else {
                        target.removeError!('required');
                    }
                }
            });
        }

        // clear error for first binding time
        target.removeError!('required');

        //return the original observable
        return target;
    }
});

interface IRequireConfig {
    message: string;
    validate: (value?: any) => boolean;
}