import { ko } from '@app/providers';
import { Promise } from "es6-promise";

const prefixUrl = '/nippo/api';

interface IFetchOption {
    url: string;
    type?: 'url' | 'form' | 'json';
    method: 'get' | 'post' | 'push' | 'patch' | 'delete';
    data?: any;
    headers?: any;
}

export function fetch(opt: IFetchOption, data?: any) {
    return new Promise(function (resolve, reject) {
        if (!opt || opt + "" !== "[object Object]") {
            reject('No required parameters - "url" and "method".')
            return;
        }

        if (!opt.url) {
            reject('Parameter "url" is required.')
            return;
        } else {
            ko.utils.extend(opt, {
                url: (prefixUrl + opt.url).replace(/([^:]\/)\/+/g, "$1")
            });
        }

        if (!opt.method) {
            reject('Parameter "method" is required.')
            return;
        }

        var xhr = new XMLHttpRequest()
        xhr.open(opt.method, opt.url, true)

        if (opt.data) {
            opt.data = parseData()
        }

        if (opt.headers) {
            setHeaders(opt.headers)
        }

        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    resolve({ response: JSON.parse(xhr.response), headers: parseHeaders(xhr), data: data })
                }
                catch (e) {
                    resolve({ response: xhr.response, headers: parseHeaders(xhr), data: data })
                }

            } else {
                reject(xhr)
            }
        }

        xhr.onerror = function () {
            reject(xhr)
        }
        xhr.send(opt.data)

        function parseData() {

            if (opt.type) {
                switch (opt.type.toLowerCase()) {

                    case 'form':
                        setHeaders({ 'Content-Type': 'multipart/form-data' })
                        return Object.prototype.toString.call(opt.data) === '[object FormData]' ? opt.data : new FormData(opt.data)

                    case 'url':
                        setHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
                        return JSON.stringify(opt.data)

                    case 'json':
                        setHeaders({ 'Content-Type': 'application/json' })
                        return isJSON(opt.data) ? opt.data : JSON.stringify(opt.data)

                    default:
                        return opt.data
                }
            }
        }

        function setHeaders(headers: any) {
            for (var header in headers) {
                xhr.setRequestHeader(header, headers[header])
            }
        }

        function isJSON(json: string) {
            try {
                JSON.parse(json)
                return true
            }
            catch (e) {
                return false
            }
        }

        function parseHeaders(xhr: XMLHttpRequest) {

            return function () {
                var raw = xhr.getAllResponseHeaders()

                return headersParser(raw)
            }
        }

        function headersParser(rawHeaders: string) {
            var headers: any = {};
            if (!rawHeaders) {
                return headers;
            }
            var headerPairs = rawHeaders.split('\u000d\u000a');
            for (var i = 0; i < headerPairs.length; i++) {
                var headerPair = headerPairs[i];
                // Can't use split() here because it does the wrong thing
                // if the header value has the string ": " in it.
                var index = headerPair.indexOf('\u003a\u0020');
                if (index > 0) {
                    var key = headerPair.substring(0, index);
                    var val = headerPair.substring(index + 2);
                    headers[key] = val;
                }
            }
            return headers;
        }
    });
}