import { _, ko } from '@app/providers';
import { extend } from '@app/extenders/validate';

ko.utils.extend(ko.extenders, {
    regex: (target: ValidationObservable<number>, pattern: RegExp | IRegex) => {
        extend(target);

        // extend name prop of observable
        if (!pattern) {
            target.removeValidate!('regex');
        } else {
            target.addValidate!('regex', (value: any) => {

                if (_.has(pattern, 'test')) {
                    let regex = <RegExp>pattern;

                    if (!regex.test(value)) {
                        target.removeError!('regex');
                    } else {
                        let g: string = regex.global ? 'g' : '',
                            i: string = regex.ignoreCase ? 'i' : '',
                            m: string = regex.multiline ? 'm' : '';

                        target.addError!('regex', `This value is not match with pattern: \/${regex.source}\/${g}${m}${i}`);
                    }
                } else {
                    let param: IRegex = <IRegex>pattern,
                        regex: RegExp = param.pattern,
                        g: string = regex.global ? 'g' : '',
                        i: string = regex.ignoreCase ? 'i' : '',
                        m: string = regex.multiline ? 'm' : '';

                    if (!regex.test(value)) {
                        target.removeError!('regex');
                    } else {
                        target.addError!('regex', param.message.replace(/\$\{pattern\}/, `\/${regex.source}\/${g}${m}${i}`));
                    }
                }
            });
        }

        return target;
    }
});

interface IRegex {
    pattern: RegExp;
    message: string;
}