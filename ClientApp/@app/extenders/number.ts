import { ko } from '@app/providers';

ko.utils.extend(ko.extenders, {
    number: (target: KnockoutObservable<number>, precision: number) => {
        //create a writable computed observable to intercept writes to our observable
        let result = ko.pureComputed({
            read: target,  //always return the original observables value
            write: function (newValue: any) {
                var current = target(),
                    roundingMultiplier = Math.pow(10, precision),
                    newValueAsNum = isNaN(newValue) ? 0 : +newValue,
                    valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

                //only write if it changed
                if (valueToWrite !== current) {
                    target(valueToWrite);
                } else {
                    //if the rounded value is the same, but a different value was written, force a notification for the current field
                    if (newValue !== current) {
                        target.notifySubscribers(valueToWrite);
                    }
                }
            }
        }).extend({ notify: 'always' });

        //initialize with current value to make sure it is rounded appropriately
        result(target());

        //return the new computed observable
        return result;
    }
});