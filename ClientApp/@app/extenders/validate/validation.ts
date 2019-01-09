import { _, ko } from '@app/providers';

export function extend(target: ValidationObservable<any>) {
    // extend validations prop
    ko.utils.extend(target, {
        hasError: target.hasError || ko.observableOrig(false),
        addError: target.addError || function (rule: string, message: string) {
            let $disable: boolean = ko.toJS(target.$disable) || (ko.toJS(target.$attr) || {})['disabled'];

            if (!$disable) {
                let msgs: IMessages = ko.toJS(target.validationMessages);

                _.set(msgs, rule, message);
                target.validationMessages!(msgs);
            } else {
                target.clearError!();
            }
        },
        clearError: target.clearError || function () {
            target.validationMessages!({});
        },
        removeError: target.removeError || function (rule: string) {
            let msgs: IMessages = ko.toJS(target.validationMessages);

            _.unset(msgs, rule);
            target.validationMessages!(msgs || {});
        },
        checkError: target.checkError || function (value?: any) {
            let args = arguments;

            if (!ko.toJS(target.$disable)) {
                _.each(_.get(target, "_subscriptions.change"), (subscribe: { validate: string, callback: (value: any) => void }) => {
                    if (subscribe && !!ko.toJS(subscribe.validate)) {
                        subscribe.callback(_.size(args) ? value : ko.toJS(target));
                    }
                });
            }
        },
        hasSubscriptionsForValidation: target.hasSubscriptionsForValidation || function (key: string) {
            return !!_.find(_.get(target, '_subscriptions.change'), (subc: { validate: string }) => _.isEqual(subc.validate, key));
        },
        validationMessage: target.validationMessage || ko.observableOrig(''),
        validationMessages: target.validationMessages || ko.observableOrig({}),
        addValidate: target.addValidate || function (key: string, subscribe: any) {
            target.removeValidate!(key);

            if (!target.hasSubscriptionsForValidation!(key)) {
                let subscription = target.subscribe(subscribe);

                ko.utils.extend(subscription, {
                    validate: key
                });
            }
        },
        removeValidate: target.removeValidate || function (key: string) {
            let subscription: { dispose: () => void } | undefined = _.find(_.get(target, '_subscriptions.change'), (subc: { validate: string, dispose: () => void }) => _.isEqual(subc.validate, key));

            if (subscription) {
                subscription.dispose();
            }
        }
    });

    // accept only subscibe for show or hide message error
    if (!target.validationMessages!.getSubscriptionsCount()) {
        target.validationMessages!.subscribe((msgs: IMessages) => {
            if (_.isEmpty(msgs)) {
                target.hasError!(false);
                target.validationMessage!('');

                // remove observable in errors list
                ko.errors.remove(target);
            } else {
                target.hasError!(true);
                target.validationMessage!(_.first(_.values(msgs)) || '');

                // add observable to errors list
                ko.errors.push(target);
            }
        });
    }
}