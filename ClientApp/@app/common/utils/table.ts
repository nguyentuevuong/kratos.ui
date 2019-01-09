import { ko } from '@app/providers';
import { random } from '@app/common/utils';

let toJS = ko.toJS,
    extend = ko.utils.extend,
    domData = ko.utils.domData,
    //triggerEvent = ko.utils.triggerEvent,
    registerEvent = ko.utils.registerEventHandler;

export class FixedTable {
    private container: HTMLDivElement = document.createElement('div');

    options: IOptions = {
        width: 0,
        displayRow: 10,
        fixedColumn: 0,
        rowHeight: 0,
        columns: [],
        boundRights: []
    };

    constructor(table?: HTMLTableElement, options?: {
        width?: number;
        displayRow?: number;
        fixedColumn?: number;
        columns: Array<number>;
    }) {
        if (table) {
            // init default elements;
            this.createElements();

            let self = this,
                elements = self.elements,
                rctnr = table.parentElement,
                dtbl = elements.tables.table,
                sbody = elements.body.scrollable;

            // extend external options
            self.updateOption(options || self.options);

            if (!table.className) {
                table.className = 'fx-table';
            } else {
                table.classList.add('fx-table');
            }

            if (rctnr) {
                rctnr.replaceChild(self.container, table);

                sbody.replaceChild(table, dtbl);

                self.initLayout();

                // reinit layout if window resize
                registerEvent(window, 'resize', () => self.initLayout());
            }
        }
    }

    updateOption(options: {
        width?: number;
        displayRow?: number;
        fixedColumn?: number;
        columns?: Array<number>;
    }) {
        let self = this,
            updOpt = {
                width: options.width || 0,
                displayRow: options.displayRow || 10,
                fixedColumn: options.fixedColumn || 0,
                columns: options.columns
            };

        extend(self.options, toJS(updOpt));
    }

    initLayout() {
        let self = this,
            ki = '__initialize__',
            options = self.options,
            elements = self.elements,
            container = self.container,
            initialize = domData.get(container, ki);

        if (!initialize) {
            domData.set(container, ki, true);

            self.clearStyle(elements);

            self.roleBackItems(elements.tables);
            self.getAvgRowHeight(elements.tables);
            self.moveFixedItems(elements, options);

            self.setColumnStyles();

            self.headStyle(elements);
            self.footStyle(elements);
            self.fixedStyle(elements);

            self.scrollStyle(elements);
            self.layoutStyles(elements);

            domData.set(container, ki, false);
        }
    }

    private clearStyle(elements: IElements) {
        let self = this,
            head = elements.head,
            body = elements.body,
            foot = elements.foot,
            tables = elements.tables;

        self.roleBackItems(tables);

        elements.styles.clear();

        head.row.removeAttribute('style');
        head.fixed.removeAttribute('style');
        head.scrollable.removeAttribute('style');

        body.row.removeAttribute('style');
        body.fixed.removeAttribute('style');
        body.scrollable.removeAttribute('style');

        foot.row.removeAttribute('style');
        foot.fixed.removeAttribute('style');
        foot.scrollable.removeAttribute('style');

        tables.table.removeAttribute('style');

        if (tables.head) {
            tables.head.removeAttribute('style');

            [].slice.call(tables.head.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
                tr.removeAttribute('style');

                let ths = [].slice.call(tr.querySelectorAll('th'));
                ths.forEach((th: HTMLTableHeaderCellElement, j: number) => {
                    th.removeAttribute('style');
                });
            });
        }

        if (tables.body) {
            tables.body.setAttribute('style', '');
            let trs = [].slice.call(tables.body.querySelectorAll('tr'));

            trs.forEach((tr: HTMLTableRowElement, i: number) => {
                tr.removeAttribute('style');

                let tds = [].slice.call(tr.querySelectorAll('td'));

                tds.forEach((td: HTMLTableDataCellElement, j: number) => {
                    td.removeAttribute('style');
                });
            });
        }

        if (tables.foot) {
            tables.foot.removeAttribute('style');

            [].slice.call(tables.foot.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
                tr.removeAttribute('style');

                let ths = [].slice.call(tr.querySelectorAll('th'));
                ths.forEach((th: HTMLTableHeaderCellElement, j: number) => {
                    th.removeAttribute('style');
                });
            });
        }

        head.fixed.innerHTML = '';
        head.scrollable.innerHTML = '';

        body.fixed.innerHTML = '';

        foot.fixed.innerHTML = '';
        foot.scrollable.innerHTML = '';
    }

    private headStyle(elements: IElements) {
        let self = this,
            ctner = self.container,
            head = elements.head.row,
            hasHead = [].slice.call(head.querySelectorAll('table')).length > 0;

        if (hasHead) {
            ctner.classList.add('has-header');
        } else {
            ctner.classList.remove('has-header');
        }
    }

    private fixedStyle(elements: IElements) {
        let self = this,
            ctner = self.container,
            fixedHead = elements.head.fixed,
            fixedBody = elements.body.fixed,
            fixedFoot = elements.foot.fixed,
            listFixed = [
                [].slice.call(fixedHead.querySelectorAll('table')).length,
                [].slice.call(fixedBody.querySelectorAll('table')).length,
                [].slice.call(fixedFoot.querySelectorAll('table')).length
            ];

        if (!!listFixed[0] || !!listFixed[1] || !!listFixed[2]) {
            ctner.classList.add('has-fixed');
        } else {
            ctner.classList.remove('has-fixed');
        }
    }

    private footStyle(elements: IElements) {
        let self = this,
            ctner = self.container,
            foot = elements.foot.row,
            hasFoot = [].slice.call(foot.querySelectorAll('table')).length > 0;

        if (hasFoot) {
            ctner.classList.add('has-footer');
        } else {
            ctner.classList.remove('has-footer');
        }
    }

    private layoutStyles(elements: IElements) {
        let self = this,
            styles = '',
            sscroll = self.getScroll(elements),
            cborder = self.getBorder(self.container),
            sborder = self.getBorder(elements.body.scrollable),
            hborder = self.getBorder(elements.head.row),
            fborder = self.getBorder(elements.foot.row),
            options = self.options,
            columns = options.columns,
            defaultW = self.container.offsetWidth,
            fixedW = columns
                .filter((v: number, i: number) => i < options.fixedColumn)
                .reduce((a, b) => a + b, 0),
            scrollW = columns
                .filter((v: number, i: number) => i >= options.fixedColumn)
                .reduce((a, b) => a + b, 0),
            totalW = options.width || Math.min(defaultW, (fixedW + scrollW + sborder.x + cborder.x + sscroll.y)),
            viewedW = totalW - (fixedW + cborder.x),
            fixedH = Math.abs(options.displayRow) === options.displayRow,
            maxHeight = options.rowHeight * Math.abs(options.displayRow);

        self.options.columns
            .reduce((p: number, c: number, i: number) => {
                self.options.boundRights[i] = p + c;
                return self.options.boundRights[i];
            }, 0);

        styles += `\n{role}.fx-container { position: relative; width: ${totalW}px; }`;
        styles += `\n{role} .fx-fixed-header, {role} .fx-fixed-body, {role} .fx-fixed-footer { width: ${fixedW}px; }`;

        styles += `\n{role} .fx-scroll-body { width: ${viewedW}px; }`;
        styles += `\n{role} .fx-scroll-header, {role} .fx-scroll-footer { width: ${viewedW - sscroll.y + (sscroll.y ? (sborder.x + 1) : 0)}px; }`;

        if (!fixedH) {
            styles += `\n{role} .fx-fixed-body { min-height: ${options.rowHeight + (sscroll.x ? 1 : 0)}px; max-height: ${maxHeight + (sscroll.x ? 1 : 0)}px; }`;
            styles += `\n{role} .fx-scroll-body { min-height: ${options.rowHeight + sscroll.x}px; max-height: ${maxHeight + sscroll.x}px; }`;
        } else {
            styles += `\n{role} .fx-fixed-body { height: ${maxHeight + (sscroll.x ? 1 : 0)}px; }`;
            styles += `\n{role} .fx-scroll-body { height: ${maxHeight + sscroll.x}px; }`;
        }

        styles += '\n';

        styles += `\n{role} div[class^='fx-row'] { position: relative; }`;
        styles += `\n{role} tbody>tr { height: ${options.rowHeight}px }`;

        styles += `\n{role} .fx-row-header.resize { cursor: col-resize; }`;
        styles += `\n{role} .fx-row-header, {role} .fx-row-footer { z-index: 1 }`;
        styles += `\n{role} .fx-row-body { z-index: 2; background-color: #fff; }`;

        styles += `\n{role}.has-header .fx-row-body { margin-top: -${options.rowHeight + hborder.y}px; }`;
        styles += `\n{role}.has-footer .fx-row-body { margin-bottom: -${options.rowHeight + fborder.y}px; }`;

        styles += '\n';

        styles += `\n{role} tr>th[column='hide'], {role} tr>td[column='hide'] { display: none; }`;

        styles += '\n';

        if (columns.length) {
            columns.forEach((v: number, i: number) => {
                if (!v) {
                    styles += `\n{role} tr>th[column='${i}'], {role} tr>td[column='${i}'] { display: none; } `;
                } else {
                    styles += `\n{role} tr>th[column='${i}'], {role} tr>td[column='${i}'] { width: ${v}px; min-width: ${v}px; max-width: ${v}px; }`;
                }
            });
        }

        styles += '\n';

        for (var i = 2; i <= 15; i++) {
            styles += `\n{role} tbody th[rowspan='${i}'], {role} tbody td[rowspan='${i}'] { height: ${options.rowHeight * i}px; }`;
        }

        elements.styles.apply(styles);
    }

    private setColumnStyles() {
        let self = this,
            options = self.options,
            container = self.container;

        [].slice.call(container.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
            let colSpan = -1;
            [].slice.call(tr.querySelectorAll('th, td')).forEach((t: HTMLTableCellElement, i: number) => {
                colSpan += t.colSpan;

                if (!t.classList.contains('fx-hidden')) {
                    let col = Math.max(i, colSpan);

                    if (col < options.columns.length) {
                        if (t.colSpan <= 1) {
                            t.setAttribute('column', `${col}`);
                        }
                    } else {
                        if (i < options.columns.length - 1) {
                            if (t.colSpan <= 1) {
                                t.setAttribute('column', `${col}`);
                            }
                        } else {
                            t.setAttribute('column', 'hide');
                        }
                    }
                }
            });
        });
    }

    private scrollStyle(elements: IElements) {
        let self = this,
            options = self.options,
            container = self.container,
            body = elements.tables.body,
            columns = options.columns,
            cborder = self.getBorder(self.container),
            sborder = self.getBorder(elements.body.scrollable),
            defaultW = self.container.offsetWidth,
            fixedW = columns
                .filter((v: number, i: number) => i < options.fixedColumn)
                .reduce((a, b) => a + b, 0),
            scrollW = columns
                .filter((v: number, i: number) => i >= options.fixedColumn)
                .reduce((a, b) => a + b, 0);

        if (body) {
            let row = [].slice.call(body.querySelectorAll('tr')).length,
                maxDispRow = Math.abs(options.displayRow),
                displayRow = maxDispRow == options.displayRow ? maxDispRow : Math.min(row, maxDispRow);

            if (row > displayRow) {
                container.classList.add('has-scroll-y');
            } else {
                container.classList.remove('has-scroll-y');
            }
        }

        let cscroll = self.getScroll(elements),
            totalW = options.width || Math.min(defaultW, (fixedW + scrollW + sborder.x + cborder.x + cscroll.y));

        if (totalW - cborder.x < fixedW + scrollW) {
            container.classList.add('has-scroll-x');
        } else {
            container.classList.remove('has-scroll-x');
        }
    }

    private moveFixedItems(elements: IElements, options: IOptions) {
        let self = this,
            tables = elements.tables,
            tbName = tables.table.className,
            fixedColumn = options.fixedColumn,
            initTableContent = (contents: HTMLElement[], type: CONTENT_TYPE) => {
                let heads = [
                    CONTENT_TYPE.FIXED_HEAD,
                    CONTENT_TYPE.SCROLL_HEAD
                ], foots = [
                    CONTENT_TYPE.FIXED_FOOT,
                    CONTENT_TYPE.SCROLL_FOOT
                ],
                    isHeader = heads.indexOf(type) > -1,
                    isFooter = foots.indexOf(type) > -1,
                    table = document.createElement('table'),
                    body = document.createElement(isHeader ? 'thead' : (isFooter ? 'tfoot' : 'tbody'));

                table.className = tbName;

                table.appendChild(body);

                contents.forEach((row: HTMLElement, i: number) => body.appendChild(row));

                switch (type) {
                    case CONTENT_TYPE.FIXED_HEAD:
                        table.appendChild(self.getTemplate(options.fixedColumn));
                        elements.head.fixed.appendChild(table);
                        break;
                    case CONTENT_TYPE.SCROLL_HEAD:
                        table.appendChild(self.getTemplate(-options.fixedColumn));
                        elements.head.scrollable.appendChild(table);
                        break;
                    case CONTENT_TYPE.FIXED_BODY:
                        elements.body.fixed.appendChild(table);
                        break;
                    case CONTENT_TYPE.FIXED_FOOT:
                        elements.foot.fixed.appendChild(table);
                        table.appendChild(self.getTemplate(options.fixedColumn));
                        break;
                    case CONTENT_TYPE.SCROLL_FOOT:
                        elements.foot.scrollable.appendChild(table);
                        table.appendChild(self.getTemplate(-options.fixedColumn));
                        break;
                }
            };

        // copy and restyle all element
        if (tables.head) {
            let ftrs: HTMLTableRowElement[] = [],
                strs: HTMLTableRowElement[] = [],
                trs: HTMLTableRowElement[] = [].slice.call(tables.head.querySelectorAll('tr'));

            trs.forEach((tr: HTMLTableRowElement) => {
                let fc: number = domData.get(tr, 'fixed_counts') || 0,
                    frow = document.createElement('tr'),
                    srow = document.createElement('tr');

                [].slice.call(tr.querySelectorAll('th')).forEach((oth: HTMLTableHeaderCellElement, i: number) => {
                    let cth = document.createElement('th'),
                        colSpan = oth.colSpan || 1,
                        rowSpan = oth.rowSpan || 1;

                    fc += colSpan;

                    if (rowSpan > 1) {
                        for (let k = i + 1; k <= i + rowSpan - 1; k++) {
                            let nextRow = trs[k];

                            if (nextRow) {
                                let cs: number = domData.get(trs[k], 'fixed_counts') || 0;

                                domData.set(nextRow, 'fixed_counts', cs + colSpan);
                            }
                        }
                    }

                    cth.className = oth.className;
                    oth.parentElement!.replaceChild(cth, oth);

                    if (fc <= fixedColumn) {
                        frow.appendChild(oth);
                    } else {
                        srow.appendChild(oth);
                    }

                    domData.set(tr, 'delete_cell' + i, cth);
                    domData.set(tr, 'restore_cell' + i, oth);
                });

                ftrs.push(frow);
                strs.push(srow);
            });

            if (fixedColumn) {
                initTableContent(ftrs, CONTENT_TYPE.FIXED_HEAD);
            }

            initTableContent(strs, CONTENT_TYPE.SCROLL_HEAD);
        }

        if (tables.body) {
            let trs: HTMLTableRowElement[] = [].slice.call(tables.body.querySelectorAll('tr')),
                ftds: HTMLTableRowElement[] = [];

            trs.forEach((tr: HTMLTableRowElement, r: number) => {
                let fc: number = domData.get(tr, 'fixed_counts') || 0,
                    row: HTMLTableRowElement = document.createElement('tr');

                [].slice.call(tr.querySelectorAll('th, td')).forEach((td: HTMLTableDataCellElement, i: number) => {
                    let ctd = document.createElement('td'),
                        colSpan = td.colSpan || 1,
                        rowSpan = td.rowSpan || 1;

                    fc += colSpan;

                    if (rowSpan > 1) {
                        for (let k = i + 1; k <= i + rowSpan - 1; k++) {
                            let nextRow = trs[k];

                            if (nextRow) {
                                let cs: number = domData.get(trs[k], 'fixed_counts') || 0;

                                domData.set(nextRow, 'fixed_counts', cs + colSpan);
                            }
                        }
                    }

                    ctd.className = td.className;
                    if (td && fc <= fixedColumn) {
                        ctd.classList.add('fx-hidden');
                        td.parentElement!.replaceChild(ctd, td);

                        row.appendChild(td);

                        domData.set(tr, 'delete_cell' + i, ctd);
                        domData.set(tr, 'restore_cell' + i, td);
                    }
                });

                ftds.push(row);
            });

            if (fixedColumn) {
                initTableContent(ftds, CONTENT_TYPE.FIXED_BODY);
            }
        }

        if (tables.foot) {
            let ftrs: HTMLTableRowElement[] = [],
                strs: HTMLTableRowElement[] = [],
                trs: HTMLTableRowElement[] = [].slice.call(tables.foot.querySelectorAll('tr'));

            trs.forEach((tr: HTMLTableRowElement) => {
                let fc: number = domData.get(tr, 'fixed_counts') || 0,
                    frow = document.createElement('tr'),
                    srow = document.createElement('tr');

                [].slice.call(tr.querySelectorAll('th')).forEach((oth: HTMLTableHeaderCellElement, i: number) => {
                    let cth = document.createElement('th'),
                        colSpan = oth.colSpan || 1,
                        rowSpan = oth.rowSpan || 1;

                    fc += colSpan;

                    if (rowSpan > 1) {
                        for (let k = i + 1; k <= i + rowSpan - 1; k++) {
                            let nextRow = trs[k];

                            if (nextRow) {
                                let cs: number = domData.get(trs[k], 'fixed_counts') || 0;

                                domData.set(nextRow, 'fixed_counts', cs + colSpan);
                            }
                        }
                    }

                    cth.className = oth.className;
                    oth.parentElement!.replaceChild(cth, oth);

                    if (fc <= fixedColumn) {
                        frow.appendChild(oth);
                    } else {
                        srow.appendChild(oth);
                    }

                    domData.set(tr, 'delete_cell' + i, cth);
                    domData.set(tr, 'restore_cell' + i, oth);
                });

                ftrs.push(frow);
                strs.push(srow);
            });

            if (fixedColumn) {
                initTableContent(ftrs, CONTENT_TYPE.FIXED_FOOT);
            }

            initTableContent(strs, CONTENT_TYPE.SCROLL_FOOT);
        }
    }

    /**
     * 
     * @param tables Main elements of table
     */
    private roleBackItems(tables: ITableElement) {
        if (tables.head) {
            [].slice.call(tables.head!.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
                [].slice.call(tr.querySelectorAll('th')).forEach((th: any, i: number) => {
                    let d = domData.get(tr, 'delete_cell' + i),
                        r = domData.get(tr, 'restore_cell' + i);

                    if (d && r && d.parentElement == tr) {
                        tr.replaceChild(r, d);
                    }
                });
                // clear old data
                domData.clear(tr);
            });
        }

        if (tables.body) {
            [].slice.call(tables.body.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
                [].slice.call(tr.querySelectorAll('td')).forEach((td: any, i: number) => {
                    let d = domData.get(tr, 'delete_cell' + i),
                        r = domData.get(tr, 'restore_cell' + i);

                    if (d && r && d.parentElement == tr) {
                        tr.replaceChild(r, d);
                    }
                });
                // clear old data
                domData.clear(tr);
            });
        }

        if (tables.foot) {
            [].slice.call(tables.foot.querySelectorAll('tr')).forEach((tr: HTMLTableRowElement) => {
                [].slice.call(tr.querySelectorAll('th')).forEach((th: any, i: number) => {
                    let d = domData.get(tr, 'delete_cell' + i),
                        r = domData.get(tr, 'restore_cell' + i);

                    if (d && r && d.parentElement == tr) {
                        tr.replaceChild(r, d);
                    }
                });
                // clear old data
                domData.clear(tr);
            });
        }
    }

    private getAvgRowHeight(tables: ITableElement) {
        let self = this,
            virtualB = document.createElement('tbody'),
            row = (tables.body || virtualB).querySelector('tr') || (tables.head || virtualB).querySelector('tr') || (tables.foot || virtualB).querySelector('tr');

        if (!self.options.rowHeight) {
            if (!row) {
                self.options.rowHeight = 30;
            } else {
                self.options.rowHeight = row.offsetHeight;
            }
        } else if (row) {
            self.options.rowHeight = row.offsetHeight || self.options.rowHeight;
        }
    }

    private getBorder(element: HTMLElement): {
        x: number;
        y: number;
    } {
        let borders = {
            x: 0,
            y: 0
        }, width = element.style.width,
            height = element.style.height;

        element.style.overflow = 'hidden';
        element.style.overflowX = 'hidden';
        element.style.overflowY = 'hidden';

        borders.x = element.offsetWidth - element.clientWidth;
        borders.y = element.offsetHeight - element.clientHeight;

        element.removeAttribute('style');

        if (width || height) {
            element.style.width = width;
            element.style.height = height;
        }

        return borders;
    }

    private getScroll(elements: IElements): {
        x: number;
        y: number;
        default: number;
    } {
        let self = this,
            scroll = { x: 0, y: 0, default: 0 },
            container = self.container,
            body = elements.body.scrollable,
            classList = container.classList,
            width = body.style.width,
            height = body.style.height;

        body.style.overflow = 'hidden';
        body.style.overflowY = 'scroll';

        scroll.default = body.offsetWidth - body.clientWidth;

        body.removeAttribute('style');

        if (width || height) {
            body.style.width = width;
            body.style.height = height;
        }

        if (classList.contains('has-scroll-y')) {
            if (classList.contains('has-scroll-x')) {
                scroll.y = body.offsetWidth - body.clientWidth;
                scroll.x = body.offsetHeight - body.clientHeight;
            } else {
                scroll.y = body.offsetWidth - body.clientWidth;
            }
        } else if (classList.contains('has-scroll-x')) {
            if (classList.contains('has-scroll-y')) {
                scroll.y = body.offsetWidth - body.clientWidth;
                scroll.x = body.offsetHeight - body.clientHeight;
            } else {
                scroll.x = body.offsetHeight - body.clientHeight;
            }
        }

        return scroll;
    }

    private getTemplate(fixed: number) {
        let self = this,
            options = self.options,
            row = document.createElement('tr'),
            body = document.createElement('tbody');

        body.appendChild(row);

        options.columns.forEach((v: number, i: number) => {
            let cell = document.createElement('td');

            cell.innerHTML = '&nbsp;';

            if (!fixed) {
                cell.setAttribute('column', `${i}`);
            } else {
                let hr = fixed > 0,
                    fx = Math.abs(fixed);

                if (hr) {
                    if (fx <= i) {
                        cell.className = 'fx-hidden';
                    } else {
                        cell.setAttribute('column', `${i}`);
                    }
                } else {
                    if (fx > i) {
                        cell.className = 'fx-hidden';
                    } else {
                        cell.setAttribute('column', `${i}`);
                    }
                }

            }

            row.appendChild(cell);
        });

        return body;
    }

    private get elements(): IElements {
        let self = this,
            container = self.container,
            id = container.getAttribute('role'),
            styleEl = container.querySelector('style') as HTMLStyleElement,
            // head
            hrow = container.querySelector('.fx-row-header') as HTMLDivElement,
            hfixed = container.querySelector('.fx-fixed-header') as HTMLDivElement,
            hscroll = container.querySelector('.fx-scroll-header') as HTMLDivElement,
            // body
            brow = container.querySelector('.fx-row-body') as HTMLDivElement,
            bfixed = container.querySelector('.fx-fixed-body') as HTMLDivElement,
            bscroll = container.querySelector('.fx-scroll-body') as HTMLDivElement,
            // foot
            frow = container.querySelector('.fx-row-footer') as HTMLDivElement,
            ffixed = container.querySelector('.fx-fixed-footer') as HTMLDivElement,
            fscroll = container.querySelector('.fx-scroll-footer') as HTMLDivElement,
            // table
            ttbl = bscroll.querySelector('table') as HTMLTableElement,
            thead = bscroll.querySelector('thead'),
            tbody = bscroll.querySelector('tbody'),
            tfoot = bscroll.querySelector('tfoot');

        return {
            styles: {
                el: styleEl,
                clear: () => {
                    styleEl.innerHTML = '';
                },
                apply: (data: string) => {
                    data = data || '';
                    data = data.replace(/{role}/g, `[role='${id}']`);

                    styleEl.appendChild(document.createTextNode(data));
                }
            },
            head: {
                row: hrow,
                fixed: hfixed,
                scrollable: hscroll
            },
            body: {
                row: brow,
                fixed: bfixed,
                scrollable: bscroll
            },
            foot: {
                row: frow,
                fixed: ffixed,
                scrollable: fscroll
            },
            tables: {
                table: ttbl,
                head: thead,
                body: tbody,
                foot: tfoot
            }
        };
    }

    /**
     * Init all elements of fixed table layout
     */
    private createElements() {
        let self = this,
            // other elements
            cf = document.createElement('div'),
            table = document.createElement('table'),
            // main container
            container = document.createElement('div'),
            // style
            style = document.createElement('style'),
            // header elements
            rowHeader = document.createElement('div'),
            fixedHeader = document.createElement('div'),
            scrollHeader = document.createElement('div'),
            // body elements
            rowBody = document.createElement('div'),
            fixedBody = document.createElement('div'),
            scrollBody = document.createElement('div'),
            // footer elements
            fixedFooter = document.createElement('div'),
            scrollFooter = document.createElement('div'),
            rowFooter = document.createElement('div');

        // set container to self
        self.container = container;

        cf.className = 'fx-clear';
        container.className = 'fx-container';
        container.setAttribute('role', random.id);

        style.type = 'text/css';
        container.appendChild(style);

        rowHeader.className = 'fx-row-header';
        rowBody.className = 'fx-row-body';
        rowFooter.className = 'fx-row-footer';

        fixedHeader.className = 'fx-fixed-header';
        scrollHeader.className = 'fx-scroll-header';

        fixedBody.className = 'fx-fixed-body';
        scrollBody.className = 'fx-scroll-body';

        fixedFooter.className = 'fx-fixed-footer';
        scrollFooter.className = 'fx-scroll-footer';

        // add row;
        container.appendChild(rowHeader);
        container.appendChild(rowBody);
        container.appendChild(rowFooter);

        rowHeader.appendChild(fixedHeader);
        rowHeader.appendChild(scrollHeader);
        rowHeader.appendChild(cf.cloneNode());

        rowBody.appendChild(fixedBody);
        rowBody.appendChild(scrollBody);
        rowBody.appendChild(cf.cloneNode());

        rowFooter.appendChild(fixedFooter);
        rowFooter.appendChild(scrollFooter);
        rowFooter.appendChild(cf.cloneNode());

        // init default table (prevent exception)
        scrollBody.appendChild(table);

        registerEvent(window, 'mousemove', (evt: MouseEvent) => {
            if (rowHeader) {
                let target: HTMLElement | null = evt.target as HTMLElement,
                    resize: {
                        index: number;
                        width: number;
                    } | null = ko.utils.domData.get(rowHeader, 'resizecolumn');

                if (target && target.tagName === "TH") {
                    let cbound = container.getBoundingClientRect(),
                        bounds = self.options.boundRights,
                        resizeable = bounds.filter(f => f + 2 > evt.pageX - cbound.left && f - 2 < evt.pageX - cbound.left).length;

                    if (resizeable) {
                        ko.utils.dom.addClass(rowHeader, 'resize noselect');
                    } else if (!resize) {
                        ko.utils.dom.removeClass(rowHeader, 'resize noselect');
                    }
                }

                if (resize) {
                    let ow = resize.width,
                        width = ow + evt.pageX;

                    self.options.columns[resize.index] = width;

                    self.initLayout();
                }
            }
        });

        registerEvent(container, 'mouseup', (evt: MouseEvent) => {
            if (rowHeader) {
                ko.utils.domData.set(rowHeader, 'resizecolumn', false);
                ko.utils.dom.removeClass(rowHeader, 'resize noselect');
            }
        });

        registerEvent(container, 'mousedown', (evt: MouseEvent) => {
            if (rowHeader) {
                if (ko.utils.dom.hasClass(rowHeader, 'resize')) {
                    let target = evt.target as HTMLElement,
                        offsetCont = container.getBoundingClientRect(),
                        position = evt.pageX - offsetCont.left,
                        index = ko.utils.arrayFirst(self.options.boundRights
                            .map((v: number, i: number) => {
                                if (v + 2 > position && v - 2 < position) {
                                    return i;
                                }

                                return -1;
                            }), f => f != -1);

                    ko.utils.domData.set(rowHeader, 'resizecolumn', {
                        index: index,
                        width: self.options.columns[index] - evt.pageX - 1
                    });
                }
            }
        });

        registerEvent(scrollBody, 'scroll', (evt: Event) => {
            fixedBody.scrollTop = scrollBody.scrollTop;

            scrollHeader.scrollLeft = scrollBody.scrollLeft;
            scrollFooter.scrollLeft = scrollBody.scrollLeft;

            // cancel all scroll event of parents
            evt.preventDefault();
        });

        registerEvent(fixedBody, 'scroll', (evt: Event) => {
            scrollBody.scrollTop = fixedBody.scrollTop;

            // cancel all scroll event of parents
            evt.preventDefault();
        });

        registerEvent(scrollFooter, 'scroll', (evt: Event) => {
            if (container.classList.contains('has-footer')) {
                scrollBody.scrollLeft = scrollFooter.scrollLeft;
                scrollHeader.scrollLeft = scrollFooter.scrollLeft;
            }
            // cancel all scroll event of parents
            evt.preventDefault();
        });

        registerEvent(container, 'wheel', (evt: WheelEvent) => {
            let cls = container.classList,
                step = evt.deltaY ? 125 : 40,
                wheel = evt.deltaY,
                scrollY = cls.contains('has-scroll-y');

            if (evt.shiftKey || !scrollY) {
                if (cls.contains('has-scroll-x')) {
                    if (wheel > 0) {
                        scrollBody.scrollLeft += step;
                    } else {
                        scrollBody.scrollLeft -= step;
                    }
                }
            } else {
                if (cls.contains('has-scroll-y')) {
                    if (wheel > 0) {
                        scrollBody.scrollTop += step;
                    } else {
                        scrollBody.scrollTop -= step;
                    }
                }
            }

            // cancel all scroll event of parents
            evt.preventDefault();
        });
    }
}

enum CONTENT_TYPE {
    FIXED_HEAD = <any>'FIXED_HEAD',
    SCROLL_HEAD = <any>'SCROLL_HEAD',
    FIXED_BODY = <any>'FIXED_BODY',
    SCROLL_BODY = <any>'SCROLL_BODY',
    FIXED_FOOT = <any>'FIXED_FOOT',
    SCROLL_FOOT = <any>'SCROLL_FOOT'
}

interface IElements {
    styles: IStyle;
    head: IBlockElement;
    body: IBlockElement;
    foot: IBlockElement;
    tables: ITableElement;
}

interface IBlockElement {
    row: HTMLDivElement;
    fixed: HTMLDivElement;
    scrollable: HTMLDivElement;
}

interface ITableElement {
    table: HTMLTableElement;
    head: HTMLTableSectionElement | null;
    body: HTMLTableSectionElement | null;
    foot: HTMLTableSectionElement | null;
}

interface IStyle {
    el: HTMLStyleElement;
    clear: () => void;
    apply: (data: string) => void;
}

interface IOptions {
    width: number;
    displayRow: number;
    fixedColumn: number;
    rowHeight: number;
    columns: Array<number>;
    boundRights: Array<number>;
}