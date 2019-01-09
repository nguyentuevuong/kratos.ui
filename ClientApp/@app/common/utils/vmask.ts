import { ko } from '@app/providers';

const DIGIT = "9",
    ALPHA = "A",
    ALPHANUM = "S",
    BY_PASS_KEYS = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91, 92, 93],
    isAllowedKeyCode = function (keyCode: number) {
        for (var i = 0, len = BY_PASS_KEYS.length; i < len; i++) {
            if (keyCode == BY_PASS_KEYS[i]) {
                return false;
            }
        }
        return true;
    },
    mergeMoneyOptions = function (opts?: any) {
        opts = opts || {};
        opts = {
            precision: opts.hasOwnProperty("precision") ? opts.precision : 2,
            separator: opts.separator || ",",
            delimiter: opts.delimiter || ".",
            unit: opts.unit && (opts.unit.replace(/[\s]/g, '') + " ") || "",
            suffixUnit: opts.suffixUnit && (" " + opts.suffixUnit.replace(/[\s]/g, '')) || "",
            zeroCents: opts.zeroCents,
            lastOutput: opts.lastOutput
        };
        opts.moneyPrecision = opts.zeroCents ? 0 : opts.precision;
        return opts;
    },
    // Fill wildcards past index in output with placeholder
    addPlaceholdersToOutput = function (output: any, index: number, placeholder: string) {
        for (; index < output.length; index++) {
            if (output[index] === DIGIT || output[index] === ALPHA || output[index] === ALPHANUM) {
                output[index] = placeholder;
            }
        }

        return output;
    },
    dd = {
        get: (el: HTMLInputElement) => {
            return ko.utils.domData.get(el, '__lastData');
        },
        set: (el: HTMLInputElement, value: any) => {
            ko.utils.domData.set(el, '__lastData', value);
        }
    };

export class VanillaMasker {
    opts: any = {};
    elements: Array<HTMLInputElement> = [document.createElement('input')];

    constructor(elements: Array<HTMLInputElement>) {
        this.elements = elements;
    };

    unbindElementToMask() {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            dd.set(this.elements[i], '');

            this.elements[i].onkeyup = null;
            this.elements[i].onkeydown = null;

            if (this.elements[i].value.length) {
                this.elements[i].value = this.elements[i].value.replace(/\D/g, '');
            }
        }
    }

    bindElementToMask(maskFunction: string) {
        var that = this,
            onType = function (e: KeyboardEvent) {
                e = e || window.event;

                let source = (e.target || e.srcElement) as HTMLInputElement;

                if (isAllowedKeyCode(e.keyCode)) {
                    setTimeout(function () {
                        that.opts.lastOutput = dd.get(source);

                        source.value = VMasker.toFunc(maskFunction)(source.value, that.opts);

                        dd.set(source, source.value);

                        if (source.setSelectionRange && that.opts.suffixUnit) {
                            source.setSelectionRange(source.value.length, (source.value.length - that.opts.suffixUnit.length));
                        }
                    }, 0);
                }
            };

        for (var i = 0, len = this.elements.length; i < len; i++) {
            dd.set(this.elements[i], '');
            this.elements[i].onkeyup = onType;

            if (this.elements[i].value.length) {
                this.elements[i].value = VMasker.toFunc(maskFunction)(this.elements[i].value, this.opts);
            }
        }
    }

    maskMoney(opts?: any) {
        this.opts = mergeMoneyOptions(opts);
        this.bindElementToMask("toMoney");
    }

    maskNumber() {
        this.opts = {};
        this.bindElementToMask("toNumber");
    }

    maskAlphaNum() {
        this.opts = {};
        this.bindElementToMask("toAlphaNumeric");
    };

    maskPattern(pattern: any) {
        this.opts = {
            pattern: pattern
        };
        this.bindElementToMask("toPattern");
    };

    unMask() {
        this.unbindElementToMask();
    };
}

export class VMasker {
    constructor(el: Array<HTMLInputElement> | HTMLInputElement) {
        if (!el) {
            throw new Error("VanillaMasker: There is no element to bind.");
        }

        var elements: Array<HTMLInputElement> = ("length" in el) ? (el.length ? el : []) : [el];

        return new VanillaMasker(elements);
    }

    static toMoney(value: string, opts: any) {
        opts = mergeMoneyOptions(opts);
        if (opts.zeroCents) {
            opts.lastOutput = opts.lastOutput || "";
            var zeroMatcher = ("(" + opts.separator + "[0]{0," + opts.precision + "})"),
                zeroRegExp = new RegExp(zeroMatcher, "g"),
                digitsLength = value.toString().replace(/[\D]/g, "").length || 0,
                lastDigitLength = opts.lastOutput.toString().replace(/[\D]/g, "").length || 0;
            value = value.toString().replace(zeroRegExp, "");
            if (digitsLength < lastDigitLength) {
                value = value.slice(0, value.length - 1);
            }
        }

        var number = value.toString().replace(/[\D]/g, ""),
            clearDelimiter = new RegExp("^(0|\\" + opts.delimiter + ")"),
            clearSeparator = new RegExp("(\\" + opts.separator + ")$"),
            money = number.substr(0, number.length - opts.moneyPrecision),
            masked = money.substr(0, money.length % 3),
            cents = new Array(opts.precision + 1).join("0");

        money = money.substr(money.length % 3, money.length);

        for (var i = 0, len = money.length; i < len; i++) {
            if (i % 3 === 0) {
                masked += opts.delimiter;
            }
            masked += money[i];
        }

        masked = masked.replace(clearDelimiter, "");
        masked = masked.length ? masked : "0";

        if (!opts.zeroCents) {
            var beginCents = number.length - opts.precision,
                centsValue = number.substr(beginCents, opts.precision),
                centsLength = centsValue.length,
                centsSliced = (opts.precision > centsLength) ? opts.precision : centsLength;
            cents = (cents + centsValue).slice(-centsSliced);
        }

        var output = opts.unit + masked + opts.separator + cents + opts.suffixUnit;

        return output.replace(clearSeparator, "");
    };

    static toPattern(value: any, opts: any) {
        var pattern = (typeof opts === 'object' ? opts.pattern : opts),
            patternChars = pattern.replace(/\W/g, ''),
            output = pattern.split(""),
            values = value.toString().replace(/\W/g, ""),
            charsValues = values.replace(/\W/g, ''),
            index = 0,
            i,
            outputLength = output.length,
            placeholder = (typeof opts === 'object' ? opts.placeholder : undefined);

        for (i = 0; i < outputLength; i++) {
            // Reached the end of input
            if (index >= values.length) {
                if (patternChars.length == charsValues.length) {
                    return output.join("");
                } else if ((placeholder !== undefined) && (patternChars.length > charsValues.length)) {
                    return addPlaceholdersToOutput(output, i, placeholder).join("");
                } else {
                    break;
                }
            }
            // Remaining chars in input
            else {
                if ((output[i] === DIGIT && values[index].match(/[0-9]/)) || (output[i] === ALPHA && values[index].match(/[a-zA-Z]/)) || (output[i] === ALPHANUM && values[index].match(/[0-9a-zA-Z]/))) {
                    output[i] = values[index++];
                } else if (output[i] === DIGIT || output[i] === ALPHA || output[i] === ALPHANUM) {
                    if (placeholder !== undefined) {
                        return addPlaceholdersToOutput(output, i, placeholder).join("");
                    } else {
                        return output.slice(0, i).join("");
                    }
                }
            }
        }
        return output.join("").substr(0, i);
    }

    static toNumber(value: any) {
        return value.toString().replace(/(?!^-)[^0-9]/g, "");
    }

    static toAlphaNumeric(value: any) {
        return value.toString().replace(/[^a-z0-9 ]+/i, "");
    }

    static toFunc(func: string): Function {
        switch (func) {
            case "toAlphaNumeric":
                return VMasker.toAlphaNumeric;
            case "toMoney":
                return VMasker.toMoney;
            case "toPattern":
                return VMasker.toPattern;
            case "toPattern":
                return VMasker.toPattern;
            default:
            case "toString":
                return VMasker.toString;
        }
    }
}