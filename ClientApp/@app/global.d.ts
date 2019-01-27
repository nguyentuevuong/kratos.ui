declare interface IBindingParams {
    virtual?: boolean;
    bindingName: string;
    validatable?: boolean;
    resources?: {
        [lang: string]: {
            [key: string]: string;
        }
    }
}

declare interface BindingConstructor {
    new(): any;
}

declare interface IDecoratorComponent {
    url?: string;
    title?: string;
    icon?: string;
    name?: string;
    styles?: string;
    template: string;
    resources?: {
        [lang: string]: {
            [key: string]: string
        }
    };
    options?: object;
}

declare interface ComponentConstructor {
    new(
        params: any,
        element: HTMLElement,
        templateNodes?: Array<HTMLElement>
    ): any;
    name?: string;
}

declare interface ElementRef {
    element: HTMLElement,
    templateNodes: Array<HTMLElement>
}


declare interface IView {
    afterRender(): void
}

declare interface IDispose {
    dispose(): void;
}

declare interface IModal {
    onClose(callback: void): void;
}

declare interface Ii18n {
    html?: string;
    text?: string;
    title?: string;
    placeholder?: string;
}

declare interface IComponent {
    url: string;
    name: string;
    icon: string;
    title: string;
    params?: {
        [key: string]: string | null;
    }
}

declare interface IMenu {
    id: number;
    name: string;
    parent?: IMenu;
    childs: Array<IMenu>;
    component?: IComponent;
}

declare interface IRule {
    [key: string]: any | boolean;
}

declare interface IMessages {
    [key: string]: string;
}

declare interface ISubscribeValidates {
    [key: string]: any;
}

interface PasteEvent extends Event {
    clipboardData: {
        getData: (format: string) => string;
        setData: (format: string, data: string) => void;
    };
}

declare interface History {
    listener: (listener: (data: any, url: string) => void) => void;
    initState: (data: any, title: string, url?: string | null) => void;
}

declare interface KnockoutStatic {
    bindingContext: KnockoutBindingContext;
    // Extender observable (has some extend)
    observable: KnockoutObservableStatic;
    // Original observable
    observableOrig: KnockoutObservableStatic;
    observableArrayOrig: KnockoutObservableArrayStatic;
    observableDate: KnockoutObservableDateStatic;
    observableTime: KnockoutObservableTimeStatic;
    observableClock: KnockoutObservableClockStatic;
    observableNumber: KnockoutObservableNumberStatic;
    observableString: KnockoutObservableStringStatic;
    observableBoolean: KnockoutObservableBooleanStatic;
    observableSelection: KnockoutObservableSelectionStatic;
    errors: KnockoutObservableError;
    clearError: () => void;
    router: {
        back: () => void;
        goto: (url: string, params: any) => void;
        current: KnockoutObservable<IComponent>;
    }
}

declare interface KnockoutObservable<T> {
    beforeValue: any;
}

declare interface KnockoutObservableTime extends KnockoutObservable<number | undefined> {
    toString: () => string;
}

declare interface KnockoutObservableClock extends KnockoutObservable<number | undefined> {
    toString: () => string;
}

declare interface KnockoutObservableDate extends KnockoutObservable<Date | undefined> {
    toString: (format: string) => string;
}

declare interface KnockoutObservableNumber extends KnockoutObservable<number | undefined> {
    toLocateString: () => string;
    toCurrencyString: () => string;
}

declare interface KnockoutObservableString extends KnockoutObservable<string | undefined> {
}

declare interface KnockoutObservableBoolean extends KnockoutObservable<boolean | undefined> {
}

declare interface KnockoutObservableSelection extends KnockoutObservable<any | undefined> {
    dataSources: KnockoutObservableArray<any>;
    extend(requestedExtenders: { [key: string]: any; }): KnockoutObservableSelection;
}

declare interface KnockoutObservableDateStatic {
    fn: KnockoutObservableFunctions<Date>;

    <T = Date>(value: T): KnockoutObservableDate;
    <T = Date>(value: null): KnockoutObservableDate;
    <T = Date>(): KnockoutObservableDate;
}

declare interface KnockoutObservableTimeStatic {
    fn: KnockoutObservableFunctions<number>;

    <T = number>(value: T): KnockoutObservableTime;
    <T = number>(value: null): KnockoutObservableTime;
    <T = number>(): KnockoutObservableTime;
}

declare interface KnockoutObservableClockStatic {
    fn: KnockoutObservableFunctions<number>;

    <T = number>(value: T): KnockoutObservableClock;
    <T = number>(value: null): KnockoutObservableClock;
    <T = number>(): KnockoutObservableClock;
}

declare interface KnockoutObservableNumberStatic {
    fn: KnockoutObservableFunctions<number>;

    <T = number>(value: T): KnockoutObservableNumber;
    <T = number>(value: null): KnockoutObservableNumber;
    <T = number>(): KnockoutObservableNumber;
}

declare interface KnockoutObservableStringStatic {
    fn: KnockoutObservableFunctions<string>;

    <T = string>(value: T): KnockoutObservableString;
    <T = string>(value: null): KnockoutObservableString;
    <T = string>(): KnockoutObservableString;
}

declare interface KnockoutObservableBooleanStatic {
    fn: KnockoutObservableFunctions<boolean>;

    <T = boolean>(value: T): KnockoutObservableBoolean;
    <T = boolean>(value: null): KnockoutObservableBoolean;
    <T = boolean>(): KnockoutObservableBoolean;
}

declare interface KnockoutBindingHandlers {
    i18n: KnockoutBindingHandler;
    init: KnockoutBindingHandler;
    label: KnockoutBindingHandler;
    input: KnockoutBindingHandler;
}

declare interface KnockoutObservableSelectionStatic {
    fn: KnockoutObservableFunctions<any>;

    <T = any>(value: T): KnockoutObservableSelection;
    <T = any>(value: null): KnockoutObservableSelection;
    <T = any>(): KnockoutObservableSelection;

    dataSources: KnockoutObservableArray<any>;
}

declare interface KnockoutObservableStatic {
    org: boolean;
}

declare interface KnockoutObservable<T> extends KnockoutSubscribable<T>, KnockoutObservableFunctions<T> {
    /** Check subscribe has error or not */
    hasError?: KnockoutObservable<boolean>;
    /** Method clear error of subscibe */
    clearError?: () => void;
    /** Method check subscribe has error or not */
    checkError?: (value?: any) => void;
    /** Error message of subscibe on view */
    validationMessage?: KnockoutObservable<string>;
}

declare interface ValidationObservable<T> extends KnockoutObservable<T> {
    /** Check observable has subscribe validation ? */
    hasSubscriptionsForValidation?: (subscribe: string) => boolean;
    /** Add error (with type) to validationMessages */
    addError?: (rule: string, message: string) => void;
    /** Remove error (with type) from validationMessages */
    removeError?: (rule: string) => void;
    /** Add validate (with type) to validationSubscribes */
    addValidate?: (key: string, subscribe: any) => void;
    /** Remove validate (with type) from validationSubscribes */
    removeValidate?: (key: string) => void;
    /** Repository of errors message  */
    validationMessages?: KnockoutObservable<IMessages>;
    $attr?: KnockoutObservable<{ [key: string]: KnockoutObservable<any> }>;
    $type?: KnockoutObservable<{ [key: string]: KnockoutObservable<any> }>;
    $id?: KnockoutObservable<string>;
    /** Name of control in view */
    $name?: KnockoutObservable<string>;
    /** Subscribe is focus or not in view */
    $focus?: KnockoutObservable<boolean>;
    /** Subscribe is require or not on view */
    $require?: KnockoutObservable<boolean>;
    $invalid?: KnockoutObservable<boolean>;
    $enable?: KnockoutObservable<boolean>;
    /** Subscribe is enable or disable on view */
    $disable?: KnockoutObservable<boolean>;
    $columns?: KnockoutObservableArray<string>;
    $value?: KnockoutObservable<string>;
    $constraint?: KnockoutObservable<string>;
    $multiline?: KnockoutObservable<boolean>;
    $complete?: KnockoutObservable<boolean>;
    regex?: KnockoutObservable<RegExp>;
    $width?: KnockoutObservable<number>;
    $icons?: KnockoutObservable<{ before: string, after: string }>;
    dataSources?: KnockoutObservableArray<any>;
}

declare interface KnockoutExtenders {
    $attr: (target: ValidationObservable<any>, attr: { [key: string]: any }) => ValidationObservable<any>;
    $name: (target: ValidationObservable<any>, name: string) => ValidationObservable<any>;
    $focus: (target: ValidationObservable<any>, focus: boolean) => ValidationObservable<any>;
    $enable: (target: ValidationObservable<any>, enable: boolean) => ValidationObservable<any>;
    $disbale: (target: ValidationObservable<any>, disbale: boolean) => ValidationObservable<any>;
    $required: (target: ValidationObservable<any>, required: any | boolean) => ValidationObservable<any>;
    $validate: (target: ValidationObservable<any>, validate: (value: any) => string) => ValidationObservable<any>;
    dataSources: (target: ValidationObservable<any>, dataSources: Array<any>) => ValidationObservable<any>;
}

declare interface KnockoutObservable<T> extends KnockoutSubscribable<T>, KnockoutObservableFunctions<T> {
    /** Check subscribe has error or not */
    hasError?: KnockoutObservable<boolean>;
    /** Method clear error of subscibe */
    clearError?: () => void;
    /** Method check subscribe has error or not */
    checkError?: (value?: any) => void;
    /** Error message of subscibe on view */
    validationMessage?: KnockoutObservable<string>;
}

declare interface ValidationObservable<T> extends KnockoutObservable<T> {
    /** Check observable has subscribe validation ? */
    hasSubscriptionsForValidation?: (subscribe: string) => boolean;
    /** Add error (with type) to validationMessages */
    addError?: (rule: string, message: string) => void;
    /** Remove error (with type) from validationMessages */
    removeError?: (rule: string) => void;
    /** Add validate (with type) to validationSubscribes */
    addValidate?: (key: string, subscribe: any) => void;
    /** Remove validate (with type) from validationSubscribes */
    removeValidate?: (key: string) => void;
    /** Repository of errors message  */
    validationMessages?: KnockoutObservable<IMessages>;
    $attr?: KnockoutObservable<{ [key: string]: KnockoutObservable<any> }>;
    $type?: KnockoutObservable<{ [key: string]: KnockoutObservable<any> }>;
    $id?: KnockoutObservable<string>;
    /** Name of control in view */
    $name?: KnockoutObservable<string>;
    /** Subscribe is focus or not in view */
    $focus?: KnockoutObservable<boolean>;
    /** Subscribe is require or not on view */
    $require?: KnockoutObservable<boolean>;
    $invalid?: KnockoutObservable<boolean>;
    $enable?: KnockoutObservable<boolean>;
    /** Subscribe is enable or disable on view */
    $disable?: KnockoutObservable<boolean>;
    $columns?: KnockoutObservableArray<string>;
    $value?: KnockoutObservable<string>;
    $constraint?: KnockoutObservable<string>;
    $multiline?: KnockoutObservable<boolean>;
    $complete?: KnockoutObservable<boolean>;
    regex?: KnockoutObservable<RegExp>;
    $width?: KnockoutObservable<number>;
    $icons?: KnockoutObservable<{ before: string, after: string }>;
    dataSources?: KnockoutObservableArray<any>;
}

declare interface KnockoutExtenders {
    $attr: (target: ValidationObservable<any>, attr: { [key: string]: any }) => ValidationObservable<any>;
    $name: (target: ValidationObservable<any>, name: string) => ValidationObservable<any>;
    $focus: (target: ValidationObservable<any>, focus: boolean) => ValidationObservable<any>;
    $enable: (target: ValidationObservable<any>, enable: boolean) => ValidationObservable<any>;
    $disbale: (target: ValidationObservable<any>, disbale: boolean) => ValidationObservable<any>;
    $required: (target: ValidationObservable<any>, required: any | boolean) => ValidationObservable<any>;
    $validate: (target: ValidationObservable<any>, validate: (value: any) => string) => ValidationObservable<any>;
}

declare interface KnockoutUtils {
    keys: (object: Array<any> | string | any | Function) => Array<string>;
    merge: (object: any, other: any) => any;
    has: (object: any, prop: string) => boolean;
    omit: (object: any, path: Array<string> | string) => any;
    set: (object: any, path: Array<string> | string, value: any) => any;
    get: (object: any, path: Array<string> | string | undefined, defaultVal?: any) => any;
    size: (object: Array<any> | string | any | Function) => number;
    isNull: (obj: any) => boolean;
    isEmpty: (object: any) => boolean;
    isArray: (object: any) => boolean;
    escape: (string: string) => string;
    unescape: (string: string) => string;
    setPrototypeOfOrExtend: (obj: KnockoutObservable<any>, proto: any) => KnockoutObservable<any>;
    extendBindingsAccessor: (accessor: () => any, prop: any) => any;
    extendAllBindingsAccessor: (accessor: KnockoutAllBindingsAccessor, prop: any) => KnockoutAllBindingsAccessor;
    removeEventHandler: (element: any, eventType: any, handler: Function) => void;
    registerOnceEventHandler: (element: HTMLElement, any: any, handler: Function) => void;
    dom: {
        remove: (element: HTMLElement) => boolean;
        create: (tag: string, options?: { [key: string]: string | number }) => HTMLElement;
        empty: (element: HTMLElement) => void;
        isEmpty: (element: HTMLElement) => boolean;
        next: (element: HTMLElement) => HTMLElement | null;
        preview: (element: HTMLElement) => HTMLElement | null;
        setHtml: (element: HTMLElement, html: (() => string) | string) => void;
        setAttr: (element: HTMLElement, key: string, value: string | number) => void;
        getAttr: (element: HTMLElement, key: string) => string;
        removeAttr: (element: HTMLElement, key: string) => void;
        hasClass: (element: HTMLElement, classCss: string) => boolean;
        addClass: (element: HTMLElement, classCss: string) => void;
        removeClass: (element: HTMLElement, classCss: string) => void;
        toggleClass: (element: HTMLElement, classCss: Array<string> | string) => void;
        getScroll: (element: HTMLElement, side?: string) => number;
        parent: (element: HTMLElement) => HTMLElement;
        parents: (element: HTMLElement, helper: string) => HTMLElement;
        animate: (element: HTMLElement, classAnimated: string, removeAfterEnd?: boolean) => void;
    };
    date: {
        gmt: (year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number) => Date;
        utc: (year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number) => Date;
        addDays: (date: Date, day: number) => Date;
        addMonths: (date: Date, month: number) => Date;
        addYears: (date: Date, year: number) => Date;
        addHours: (date: Date, hour: number) => Date;
        addMinutes: (date: Date, minute: number) => Date;
        addSeconds: (date: Date, second: number) => Date;
        from: (date: Number | string, format?: string) => Date;
        format: (date: Date, format?: string, utc?: boolean) => string;
        calendar: (month: number, year: number) => Array<Date>;
        dayNames: Array<string>;
        monthNames: Array<string>;
    };
}

declare interface KnockoutObservableError extends KnockoutObservableArray<KnockoutObservable<any>> {
    showDialog: KnockoutObservableBoolean;
}

declare interface KnockoutObservableRoute extends KnockoutObservableArray<any> {
    currentRoute: KnockoutObservable<any>;
}