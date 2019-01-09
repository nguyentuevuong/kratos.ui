import { ko } from '@app/providers';
ko.utils.extend(ko.extenders, {
    dataSources: (target: ValidationObservable<number>, dataSources: Array<any>) => {
        // extend name prop of observable
        if (ko.isObservable(target.dataSources)) {
            target.dataSources(ko.toJS(dataSources));
        } else {
            ko.utils.extend(target, {
                dataSources: ko.observableArrayOrig(ko.toJS(dataSources))
            });
        }

        return target;
    }
});