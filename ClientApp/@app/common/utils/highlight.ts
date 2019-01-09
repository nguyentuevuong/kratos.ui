/* Unobtrustive Code Highlighter By Dan Webb 11/2005
   Version: 0.4
	
	Usage:
		Add a script tag for this script and any stylesets you need to use
		to the page in question, add correct class names to CODE elements, 
		define CSS styles for elements. That's it! 
	
	Known to work on:
		IE 5.5+ PC
		Firefox/Mozilla PC/Mac
		Opera 7.23 + PC
		Safari 2
		
	Known to degrade gracefully on:
		IE5.0 PC
	
	Note: IE5.0 fails due to the use of lookahead in some stylesets.  To avoid script errors
	in older browsers use expressions that use lookahead in string format when defining stylesets.
	
	This script is inspired by star-light by entirely cunning Dean Edwards
	http://dean.edwards.name/star-light/.  
*/

import { ko } from '@app/providers';

interface ILangStyleSet {
    name: string;
    rules: ILangRule;
    ignoreCase?: boolean;
}

interface ILangRule {
    [rule: string]: {
        exp: String | RegExp;
        replacement?: String | Function;
    }
}

export { CodeHighlighter as Highlighter };

export class CodeHighlighter {
    static styleSets: Array<ILangStyleSet> = [{
        name: "html",
        rules: {
            comment: {
                exp: /&lt;!\s*(--([^-]|[\r\n]|-[^-])*--\s*)&gt;/
            },
            attribute: {
                exp: /\b([a-zA-Z-:]+)(=)/,
                replacement: "<span class=\"$0\">$1</span>$2"
            },
            'attribute-value': {
                exp: /'[^']*'|"[^"]*"/
            },
            tag: {
                exp: /(&lt;\/?)([a-zA-Z]+)/,
                replacement: "<span class=\"brackets\">$1</span><span class=\"$0\">$2</span>"
            },
            brackets: {
                exp: /(&gt;)/,
                replacement: "<span class=\"brackets\">$1</span>"
            },
            value: {
                exp: /"([a-zA-Z0-9])+"/
            },
            doctype: {
                exp: /(&lt;)(!DOCTYPE)(([^&]|&[^g]|&g[^t])*)(&gt;)/,
                replacement: "<span class='brackets'>$1</span><span class='$0'>$2</span><span class='attribute-value'>$3</span><span class='brackets'>&gt;</span>"
            }
        },
        ignoreCase: false
    }, {
        name: "css",
        rules: {
            comment: {
                exp: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//
            },
            keywords: {
                exp: /@\w[\w\s]*/
            },
            selectors: {
                exp: "([\\w-:\\[.#][^{};>]*)(?={)"
            },
            properties: {
                exp: "([\\w-]+)(?=\\s*:)"
            },
            units: {
                exp: /([0-9]+)(em|en|px|%|pt)\b/,
                replacement: "<span class=\"$0\">$1$2</span>"
            },
            urls: {
                exp: /(url)(\()([^\)]*)(\))/,
                replacement: "<span class='url-name'>$1</span><span class='url-brackets'>$2</span><span class='url-value'>$3</span><span class='url-brackets'>$4</span>"
            },
            brackets: {
                exp: /\{|\}/
            },
            comma: {
                exp: /:|;/
            }
        }
    }, {
        name: "javascript",
        rules: {
            comment: {
                exp: /(\/\/[^\n]*(\n|$))|(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)/
            },
            const: {
                exp: /(window|document|function|href|typeof|var)/
            },
            blocks: {
                exp: /{|}|;/
            },
            groups: {
                exp: /(\[)(.+)(\])/,
                replacement: "<span class='groups'>$1</span><span class='groups-value'>$2</span><span class='groups'>$3</span>"
            },
            brackets: {
                exp: /\(|\)/
            },
            string: {
                exp: /'[^'\\]*(\\.[^'\\]*)*'|"[^"\\]*(\\.[^"\\]*)*"/
            },
            keywords: {
                exp: /(\s{1})(arguments|break|case|continue|default|delete|do|else|for|if|in|instanceof|new|null|open|return|switch|void|while|with)(\s{1})/
            },
            global: {
                exp: /(\s{1})(valueOf|element|prototype|constructor|escape|unescape|parseInt|parseFloat|setTimeout|clearTimeout|setInterval|clearInterval|NaN|isNaN|Infinity)(\s{1})/
            },
            typeof: {
                exp: /(this|true|false|Date|Number|String)/
            },
            prototype: {
                exp: /(\.)(length|indexOf|toString|(get(Date|Day|Month|Year)s*)|getElementsByTagName)/,
                replacement: "<span class='comma'>$1</span><span class='$0'>$2</span>"
            },
            event: {
                exp: /(on)*((dbl)*click|mousedown|mouseup|mouseenter|mousemove|mouseleave|load)/,
                replacement: "<span class='$0'>$1$2</span>"
            }
        }
    }, {
        name: "python",
        rules: {
            comment: {
                exp: /#[^\n]+/
            },
            brackets: {
                exp: /\(|\)/
            },
            string: {
                exp: /'[^'\\]*(\\.[^'\\]*)*'|"[^"\\]*(\\.[^"\\]*)*"|""".*"""/
            },
            keywords: {
                exp: /\b(and|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|raise|return|try|while|yield|as|None)\b/
            }
        }
    }, {
        name: "ruby",
        rules: {
            comment: {
                exp: /#[^\n]+/
            },
            brackets: {
                exp: /\(|\)/
            },
            string: {
                exp: /'[^'\\]*(\\.[^'\\]*)*'|"[^"\\]*(\\.[^"\\]*)*"/
            },
            keywords: {
                exp: /\b(do|end|self|class|def|if|module|yield|then|else|for|until|unless|while|elsif|case|when|break|retry|redo|rescue|require|raise)\b/
            },
            /* Added by Shelly Fisher (shelly@agileevolved.com) */
            symbol: {
                exp: /([^:])(:[A-Za-z0-9_!?]+)/
            }
        }
    }];

    public static addStyle(name: string, rules: ILangRule, ignoreCase: boolean = false) {
        let self = this;

        // using push test to disallow older browsers from adding styleSets
        self.styleSets.push({
            name: name,
            rules: rules,
            ignoreCase: ignoreCase
        });

        // only set the event when the first style is added
        if (self.styleSets.length == 1) {
            // set highlighter to run on load (use LowPro if present)
            let old = window.onload;

            if (!old) {
                window.onload = () => CodeHighlighter.init();
            } else {
                window.onload = (evt: Event) => {
                    CodeHighlighter.init();
                    // call old onload func
                    old && old.apply(window, [evt]);
                }
            }
        }
    }

    public static init() {
        let rules: Array<any> = [],
            codeEls: Array<HTMLElement> = [].slice.call(document.querySelectorAll("code")) || [];

        // joins regexes into one big parallel regex
        rules.toString = () => rules.map(m => m.exp).join("|");

        let addRule = function (className: string, rule: any) {
            // add a replace rule
            var exp = (typeof rule.exp != "string") ? String(rule.exp).substr(1, String(rule.exp).length - 2) : rule.exp;
            // converts regex rules to strings and chops of the slashes
            rules.push({
                className: className,
                exp: "(" + exp + ")",
                length: (exp.match(/(^|[^\\])\([^?]/g) || "").length + 1, // number of subexps in rule
                replacement: rule.replacement || null
            });
        }, parse = function (text: string, ignoreCase: boolean) {
            // main text parsing and replacement
            return text.replace(new RegExp(rules.toString(), (ignoreCase) ? "gi" : "g"), function () {
                let i = 0,
                    j = 1,
                    rule;

                while (rule = rules[i++]) {
                    if (arguments[j]) {
                        // if no custom replacement defined do the simple replacement
                        if (!rule.replacement) {
                            return "<span class=\"" + rule.className + "\">" + arguments[0] + "</span>";
                        } else {
                            // replace $0 with the className then do normal replaces
                            var str = rule.replacement.replace("$0", rule.className);

                            for (var k = 1; k <= rule.length - 1; k++) {
                                str = str.replace("$" + k, arguments[j + k]);
                            }

                            return str;
                        }
                    } else {
                        j += rule.length;
                    }
                }
            });
        }, highlightCode = function (styleSet: any) {
            // clear rules array
            let parsed,
                clsRx = new RegExp("(\\s|^)" + styleSet.name + "(\\s|$)"),
                // get stylable elements by filtering out all code elements without the correct className	
                stylableEls = codeEls.filter(function (item: any) { return clsRx.test(item.className) });

            // reset size of rulesjbo
            rules.length = 0;

            // add style rules to parser
            for (var className in styleSet.rules) {
                addRule(className, styleSet.rules[className]);
            }

            // replace for all elements
            ko.utils.arrayForEach(stylableEls, (element: HTMLElement) => {
                if (!ko.utils.domData.get(element, 'highlight')) {
                    let parentNode: HTMLElement | null = element.parentElement;

                    if (/MSIE/.test(navigator.appVersion) && parentNode && parentNode.nodeName === 'PRE') {
                        parsed = parentNode.innerHTML.replace(/(<code[^>]*>)([^<]*)<\/code>/i, function () {
                            return arguments[1] + parse(arguments[2], styleSet.ignoreCase) + "</code>"
                        });

                        parsed = parsed.replace(/\n( *)/g, function () {
                            let spaces = "";

                            for (let i = 0; i < arguments[1].length; i++) {
                                spaces += "&nbsp;";
                            }

                            return `\n<span>${spaces}</span>`; // "\n" + spaces;
                        });

                        parentNode.innerHTML = parsed
                            .replace(/\n(<\/\w+>)?/g, "$1<br />")
                            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                        //.replace(/<br \/>[\n\r\s]*<br \/>/g, "<p><br></p>");
                    } else {
                        element.innerHTML = parse(element.innerHTML, styleSet.ignoreCase)
                            .replace(/\n(<\/\w+>)?/g, "$1<br />")
                            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                    }

                    [].slice.call(element.childNodes)
                        .forEach((child: HTMLElement) => {
                            if (child.nodeType == 3) {
                                let replacement = ko.utils.dom.create('span', { text: child.nodeValue || '' });

                                if (!child.nodeValue) {
                                    element.removeChild(child);
                                } else {
                                    element.replaceChild(replacement, child);
                                }
                            }
                        });

                    ko.utils.domData.set(element, 'highlight', true);
                }
            });
        };

        // run highlighter on all stylesets
        ko.utils.arrayForEach(this.styleSets, (item: ILangStyleSet) => highlightCode(item));
    }
}