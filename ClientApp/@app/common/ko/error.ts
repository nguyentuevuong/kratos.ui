import { ko } from '@app/providers';

// context for all primitive errors
ko.utils.extend(ko, {
    errors: ko.observableArrayOrig([]),
    clearError: () => {
        ko.errors.removeAll.apply(ko.errors);
    },
    routes: ko.observableArrayOrig([])
});

// override push, remove and removeAll method;
let orgiP = ko.errors.push,
    origR = ko.errors.remove,
    origRA = ko.errors.removeAll;

ko.utils.extend(ko.errors, {
    push: (b: any) => {
        let items = ko.unwrap(ko.errors);

        if (items.indexOf(b) == -1) {
            orgiP.apply(ko.errors, [b]);
        }
    },
    remove: (b: any) => {
        let items = origR.apply(ko.errors, [b]);

        ko.utils.arrayForEach(items, (item: KnockoutObservable<any>) => {
            if (item.clearError) {
                item.clearError.apply(item);
            }
        });

        return items;
    },
    removeAll: (items: any) => {
        let _items = origRA.apply(ko.errors, items);

        ko.utils.arrayForEach(_items, (item: KnockoutObservable<any>) => {
            if (item.clearError) {
                item.clearError.apply(item);
            }
        });

        return _items;
    },
    showDialog: ko.observableOrig(true)
});