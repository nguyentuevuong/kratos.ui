import { ko } from '@app/providers';
import { random } from '@app/common/utils';

let orgSet = ko.utils.setPrototypeOfOrExtend;

// default extender for all observable
ko.utils.extend(ko.utils, {
    setPrototypeOfOrExtend: (obj: KnockoutObservable<any>, proto: any) => {
        orgSet(obj, proto);

        // extend observable :|
        if (ko.observable.org !== true) {
            obj.extend({
                $focus: false,
                $enable: true,
                required: false,
                $attr: {
                    id: random.id
                },
                $columns: ['col-md-12', 'col-md-12']
            });
        }

        if (!ko.utils.has(obj, 'beforeValue')) {
            let origVwm = obj.valueWillMutate;

            ko.utils.extend(obj, {
                valueWillMutate: () => {
                    obj.beforeValue = ko.toJS(obj);

                    origVwm!.apply(obj);
                }
            });
        }

        ko.observable.org = false;

        return obj;
    }
});

ko.utils.extend(ko, {
    observableOrig: function (initialValue?: any) {
        ko.observable.org = true;

        return ko.observable(initialValue);
    },
    observableArrayOrig: function (initialValues?: Array<any>) {
        initialValues = initialValues || [];

        if (typeof initialValues != 'object' || !('length' in initialValues))
            throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

        ko.observable.org = true;
        let result = ko.observable(initialValues);

        ko.observable.org = true;
        ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);

        return result.extend({ 'trackArrayChanges': true });
    },
    observableString: function (initialValue?: string) {
        return ko.observable(initialValue)
            .extend({
                $type: {
                    bind: 'string',
                    mask: String,
                }
            });
    },
    observableDate: function (initialValue?: Date) {
        return ko.observable(initialValue)
            .extend({
                $type: {
                    bind: 'date',
                    mask: Date,
                    min: new Date(1900, 1, 1),
                    max: new Date(9999, 12, 31)
                }
            });
    },
    observableTime: function (initialValue?: number) {
        return ko.observable(initialValue)
            .extend({
                $icons: {
                    after: 'fa fa-clock-o'
                },
                $type: {
                    bind: 'time',
                    min: 0,     // 00:00 (0h today)
                    max: 2160   // 36:00 (12h tomorow)
                },
                //$width: 130,
                $value: initialValue, // convert to display value
                $raw: {
                    unmaskedValue: initialValue
                }
            });
    },
    observableClock: function (initialValue?: number) {
        return ko.observable(initialValue)
            .extend({
                $type: {
                    bind: 'clock',
                    mask: Number,
                    min: -720,  // -12:00 (12h yesterday)
                    max: 2160   // 36:00 (12h tomorow)
                }
            });
    },
    observableNumber: function (initialValue?: number) {
        return ko.observable(initialValue)
            .extend({
                $type: {
                    bind: 'number',
                    mask: Number
                }
            });
    },
    observableBoolean: function (initialValue?: boolean) {
        return ko.observable(initialValue);
    },
    observableSelection: function (initialValue?: any) {
        return ko.observable(initialValue)
            .extend({
                dataSources: []
            });
    }
});

// extend fn from origObservable
ko.utils.extend(ko.observableArrayOrig, {
    fn: ko.observableArray['fn']
});