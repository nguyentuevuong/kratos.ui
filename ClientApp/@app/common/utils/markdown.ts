import { ko } from '@app/providers';

export { MarkDown as md };

/**
 * Markdown - A very basic regex-based Markdown parser
 *
 * - Headers
 * - Links
 * - Bold
 * - Emphasis
 * - Deletions
 * - Quotes
 * - Inline code
 * - Blockquotes
 * - Ordered/unordered lists
 * - Horizontal rules
 *
 * Author: Tue Vuong <nguyentuevuong@gmail.com>
 * Website: http://nhanvuong.vn
 * License: MIT
 */
export class MarkDown {
    private static Regexs: {
        [key: string]: RegExp
    } = {
            hr: /^(?:([-_=*] ?)+)\1\1$/gm,
            headline: /^(\#{1,6})([^\n]+)$/gm,
            code: /(`{3})\n?([^`]+)\1/g,

            reflinks: /\[([^\]]+)\]\[([^\]]+)\]/g,
            reftarget: /\[.+\]:\s*(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?\n/g,

            links: /!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g,
            mail: /(&(amp;)*lt;|\<)*(([a-z0-9_\-\.])+\@([a-z0-9_\-\.])+\.([a-z]{2,7}))(&(amp;)*gt;|\>)*/gmi,

            lists: /^((\s*(\+|-|\d\.)\s[^\n]+)\n)+/gm,
            tables: /(([^|\n]+ *\| *)+([^|\n]+\n))((:?\-+:?\|)+(:?\-+:?)*\n)((([^|\n]+ *\| *)+([^|\n]+)\n)+)/g,

            url: /\s(&(amp;)*lt;|\<)*(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?(&(amp;)*gt;|\>)*\s/g
        };

    static parse(str: string) {
        let refs: Array<{ [key: string]: string }> = [];

        // convert return carier to newline charactor
        str = str
            .replace(/(\r)/g, '§§§')
            .replace(/(§{3,}\n|\n§{3,})/g, '\n');

        /* code */
        str = str.replace(MarkDown.Regexs.code, match => {
            let lang = '',
                code = match
                    .replace(/`{3}([a-z0-9\s])*\n/, match => {
                        lang = match.replace(/(`|\n)/g, '');
                        return '';
                    })
                    .replace(/\n/g, '§§§')
                    .replace(/`/g, '')
                    .replace(/\s+/g, ' ').trim();

            if (lang.match(/norender/)) {
                return ko.utils.escape(match).replace(/norender(\s)*/, '');
            } else if (lang == 'raw') {
                return `<pre class="pretty-print">${code.replace(/[\#\`\-\_\=\*\>\<\/\~\[\]\(\)\|]/g, match => '§' + ko.utils.escape(match).replace(/\n/g, '§§§').replace(/§{3}/g, '<br />'))}</pre>`;
            }

            return `<pre data-bind='code: "", type: "${lang}"'>${ko.utils.escape(code).replace(/§{3}/g, '<br />')}</pre>`;
        });

        /* inline code */
        str = str.replace(/\`{1}?([^`\n]+)\`{1}/g, match => {
            if (match.match(/norender/)) {
                return ko.utils.escape(match)
                    .replace(/norender/, '')
                    .replace(/[\#\`\-\_\=\*\>\<\/\~\[\]\(\)]/g, match => '§' + match);
            } else {
                return `<code>${ko.utils.escape(match).replace(/`/g, '').replace(/[\#\`\-\_\=\*\>\<\/\~\[\]\(\)]/g, match => '§' + match)}</code>`;
            }
        });

        /* horizontal line */
        str = str.replace(MarkDown.Regexs.hr, () => `<hr />`);

        /* headlines */
        str = str.replace(MarkDown.Regexs.headline, match => {
            let string = match.replace(/^#{1,6}/, '').trim(),
                length = ko.utils.size((match.match(/^#{1,6}/) || [''])[0]),
                hrefId = (string.match(/#\{.*\}$/) || [''])[0].replace(/[#\{\}]/g, '').trim();

            return `<h${length} ${hrefId ? `id='${hrefId}'` : ''}>${string.replace(/(#\{.*\}|\n)$/, '').trim()}</h${length}>`;
        });

        /* delete */
        str = str.replace(/(\~{2}?([^\*]+)\~{2})/g, match => {
            if (match.match(/^\~{2}§*\~{2}$/)) {
                return match;
            }

            return `<del>${match.replace(/\~{2}/g, '')}</del>`;
        });

        /* bold & italic */
        for (var i = 3; i >= 1; i--) {
            for (var j = 0; j <= 1; j++) {
                let m = (j == 0 ? '_' : '*'),
                    regx = new RegExp(`([${m}]{${i},})([^(${m})]+)\\1`, 'g'),
                    tags = i == 3 ? ['<b><i>', '</i></b>'] : i == 2 ? ['<b>', '</b>'] : ['<i>', '</i>'];

                str = str.replace(regx, match => {
                    if (match.match(new RegExp(`(§\\${m})$`))) {
                        return match;
                    }

                    return `${tags[0]}${match.replace(new RegExp(`[${m}]{${i},}`, 'g'), '')}${tags[1]}`;
                });
            }
        }

        /* checkbox */
        str = str.replace(/\[(\s|x)*\]/g, match => `<i class='fa fa-${match.match(/x/) ? 'check-circle-o' : 'circle-o'}'></i>`);

        /* bock quotes */
        str = str.replace(/^( *(\&gt;|&amp;gt;|&amp;amp;gt|\>)[^\n]+(\n(?!def)[^\n]+)*)+/gm, match => {
            let quotes = [].slice.call(match.split('\n') || [])
                .filter((str: string) => !!str)
                .map((line: string) => line
                    .replace(/^( *(&(&amp;)*gt;|\>)\s*)/g, '')
                    .replace(/\n/g, '§§§').trim());

            return `<blockquote class="blockquote">${quotes.join('§§§')}</blockquote>`;
        });

        /* List */
        str = str.replace(MarkDown.Regexs.lists, (match: string) => {
            let orul: Array<string> = [],
                hir: number = -1,
                hirs: Array<number> = [],
                rows: Array<string> = match
                    .split(/\n/g)
                    .filter(f => !!f.trim()),
                html: Array<string> = [];

            [].slice.call(rows).forEach((row: string) => {
                let text = row.trim(),
                    uro = text.indexOf('-') == 0 || text.indexOf('+') == 0,
                    indent = row.match(/^\s*/)![0].length;

                if (hir == -1) {
                    hirs.push(indent);
                    html.push(uro ? '<ul>' : '<ol>');
                    orul.push(uro ? '</ul>' : '</ol>');

                    html.push(`<li>${text.substring(text.indexOf(' ') + 1)}</li>`);
                } else if (hir != indent) {
                    if (hir > indent) {
                        while (hirs[hirs.length - 1] > indent) {
                            hirs.pop();
                            html.push(orul.pop() || '');
                        }
                    }

                    if (hir < indent) {
                        hirs.push(indent);
                        html.push(uro ? '<ul>' : '<ol>');
                        orul.push(uro ? '</ul>' : '</ol>');
                    }

                    html.push(`<li>${text.substring(text.indexOf(' ') + 1)}</li>`);
                } else {
                    html.push(`<li>${text.substring(text.indexOf(' ') + 1)}</li>`);
                }

                hir = indent;
            });

            while (orul.length > 0) {
                hirs.pop();
                html.push(orul.pop() || '');
            }

            return html.join('');
        });

        /* tables */
        str = str.replace(MarkDown.Regexs.tables, match => {
            if (match.match(/\:norender\:/)) {
                return match
                    .replace(/\:norender\:/, '')
                    .replace(/[\#\`\-\_\=\*\>\<\/\~\[\]\(\)]/g, match => '§' + match);
            } else {
                let rows = match
                    .split(/\n/g)
                    .filter(f => !!f)
                    .map(m => m.trim()),
                    align: string = [].slice.call(rows)
                        .filter((r: string) => !!r.match(/^(-|_|:)(-|_|:|\|)+(-|_|:)$/g))[0],
                    cols: Array<{
                        align: string
                    }> = align.split(/\|/g).map((m: string) => {
                        m = m.trim();

                        if (m.indexOf(':') == 0 && m.lastIndexOf(':') == m.length - 1) {
                            return { align: 'center' }
                        } else if (m.indexOf(':') == 0) {
                            return { align: 'left' };
                        } else if (m.indexOf(':') == m.length - 1) {
                            return { align: 'right' };
                        }

                        return { align: '' };
                    }),
                    html: Array<string> = ['<table class="table table-bordered"><thead>'];

                [].slice.call(rows).forEach((row: string) => {
                    let _cols = row
                        .split(/\|/g)
                        .map(m => ({ name: m.trim() }));

                    if (row.match(/^(-|_|:)(-|_|:|\|)+(-|_|:)$/g)) {
                        html.push('</thead><tbody>');
                    } else {
                        let body = html.indexOf('</thead><tbody>') > -1;
                        html.push(`<tr>${_cols.map((m: any, index: number) => `<t${body ? 'd' : 'h'} align="${(cols[index] || { align: '' }).align}">${m.name}</t${body ? 'd' : 'h'}>`).join('')}</tr>`)
                    }
                });

                html.push('</tbody></table>');
                return html.join('');
            }
        });

        /* mailto: */
        str = str.replace(MarkDown.Regexs.mail, match => {
            let email = match.replace(/((\&(amp;)*lt;|\<)|(\&(amp;)*gt;|\>))/g, '');

            return `<a href="mailto:${email}">${email}</a>`;
        });

        /* links */
        str = str.replace(MarkDown.Regexs.links, (match: string) => {
            let url = match.match(/\]\(.+\)$/),
                text = match.match(/^\[.+\]\(/);

            if (text) {
                let string = text[0].replace(/(^\[|\]\($)/g, '');

                if (url) {
                    let _url = url[0].replace(/^\]\(|\)/g, '');

                    if (match.indexOf('!') !== 0) {
                        return `<a href="${_url}">${string}</a>`;
                    } else {
                        return `<img src="${_url}" alt="${string}" />`;
                    }
                }
            } else if (url) {
                let _url = url[0].replace(/^\]\(|\)/g, '');

                if (match.indexOf('!') !== 0) {
                    return `<a href="${_url}">${_url}</a>`;
                } else {
                    return `<img src="${_url}" alt="${_url}" />`;
                }
            }

            return match;
        });

        // match all reflinks
        str = str.replace(MarkDown.Regexs.reftarget, match => {
            let links: Array<string> = match.split(/\]:\s*/)
                .map(m => m.replace(/^\[/g, '').trim());

            if (links[0] && links[1]) {
                let kv: any = {};
                kv[links[0].toLowerCase()] = links[1];

                refs.push(kv);
            }

            return '';
        });

        // ref url with title
        str = str.replace(MarkDown.Regexs.reflinks, match => {
            let links: Array<string> = match.split(/\]\s*\[/)
                .map(m => m.replace(/(^\[|\]$)/g, '').trim()),
                k = links[1].toLowerCase(),
                kv = refs.filter(f => !!f[k]);

            if (kv.length) {
                return `<a href="${kv[0][k]}" ${k.match(/^\d+$/) ? '' : `title="${links[1]}"`}>${links[0]}</a>`;
            }

            return match;
        });

        // single ref url
        str = str.replace(/\[([^\]]+)\]/g, match => {
            let k = match.replace(/(^\[|\]$)/g, '').trim(),
                kv = refs.filter(f => !!f[k]);

            if (kv.length) {
                return `<a href="${kv[0][k]}" ${k.match(/^\d+$/) ? '' : `title="${k}"`}>${k}</a>`;
            }

            return match;
        });

        // raw url
        //str = str.replace(MarkDown.Regexs.url, match => {
        //    if (match.match(/^\d{1,}$/)) {
        //        return match;
        //    } else {
        //        let url = match
        //            .replace(/(((&(amp;)*lt;|\<))|((&(amp;)*gt;|\>)))*/g, '');

        //        return `<a href="${(url.trim().indexOf('http') != 0 ? 'http://' : '') + url.trim()}">${url}</a>`;
        //    }
        //});

        return str
            .replace(/\n/g, '§§§') // convert newline to special chars
            .replace(/§{3,}/g, '§§§') // remove multi break
            .replace(/((§{3,}\<h(r|\d))|(h(r|\d)(\/*)\>§{3,}))/g, match => match.replace(/§{3,}/g, ''))
            .replace(/(pre\>§{3,})/g, match => match.replace(/§{3,}/, ''))
            .replace(/§{3,}/g, '<br />')
            .replace(/§{1}/g, '');
    };
}