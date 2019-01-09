/**
 * Default configs.
 */
const DEFAULT_DELIMITER = '/',
    DEFAULT_DELIMITERS = './',
    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    PATH_REGEXP = new RegExp([
        // Match escaped characters that would otherwise appear in future matches.
        // This allows the user to escape special characters that won't transform.
        '(\\\\.)',
        // Match Express-style parameters and un-named parameters with a prefix
        // and optional suffixes. Matches appear as:
        //
        // ":test(\\d+)?" => ["test", "\d+", undefined, "?"]
        // "(\\d+)"  => [undefined, undefined, "\d+", undefined]
        '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'].join('|'), 'g'),

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {string}  str
     * @param  {Object=} options
     * @return {!Array}
     */
    parse = (str: string, options: any) => {
        let tokens = [],
            key = 0,
            index = 0,
            path = '',
            defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER,
            delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS,
            pathEscaped = false,
            res;

        while ((res = PATH_REGEXP.exec(str)) !== null) {
            let m = res[0],
                escaped = res[1],
                offset = res.index;

            path += str.slice(index, offset);
            index = offset + m.length;

            // Ignore already escaped sequences.
            if (escaped) {
                path += escaped[1];
                pathEscaped = true;
                continue;
            }

            let prev = '',
                next = str[index],
                name = res[2],
                capture = res[3],
                group = res[4],
                modifier = res[5];

            if (!pathEscaped && path.length) {
                let k = path.length - 1;

                if (delimiters.indexOf(path[k]) > -1) {
                    prev = path[k];
                    path = path.slice(0, k);
                }
            }

            // Push the current path onto the tokens.
            if (path) {
                tokens.push(path);
                path = '';
                pathEscaped = false;
            }

            let partial = prev !== '' && next !== undefined && next !== prev,
                repeat = modifier === '+' || modifier === '*',
                optional = modifier === '?' || modifier === '*',
                delimiter = prev || defaultDelimiter,
                pattern = capture || group;

            tokens.push({
                name: name || key++,
                prefix: prev,
                delimiter: delimiter,
                optional: optional,
                repeat: repeat,
                partial: partial,
                pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
            });
        }

        // Push any remaining characters.
        if (path || index < str.length) {
            tokens.push(path + str.substr(index));
        }

        return tokens;
    },

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {string}             str
     * @param  {Object=}            options
     * @return {!function(Object=, Object=)}
     */
    compile = (str: string, options: any) => tokensToFunction(parse(str, options)),
    /**
     * Expose a method for transforming tokens into the path function.
     */
    tokensToFunction = (tokens: Array<any>) => {
        // Compile all the tokens into regexps.
        var matches = new Array(tokens.length)

        // Compile all the patterns before compilation.
        for (var i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] === 'object') {
                matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
            }
        }

        return function (data: any, options: any) {
            var path = ''
            var encode = (options && options.encode) || encodeURIComponent

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i]

                if (typeof token === 'string') {
                    path += token
                    continue
                }

                var value = data ? data[token.name] : undefined
                var segment

                if (Array.isArray(value)) {
                    if (!token.repeat) {
                        throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
                    }

                    if (value.length === 0) {
                        if (token.optional) continue

                        throw new TypeError('Expected "' + token.name + '" to not be empty')
                    }

                    for (var j = 0; j < value.length; j++) {
                        segment = encode(value[j], token)

                        if (!matches[i].test(segment)) {
                            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
                        }

                        path += (j === 0 ? token.prefix : token.delimiter) + segment
                    }

                    continue
                }

                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    segment = encode(String(value), token)

                    if (!matches[i].test(segment)) {
                        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
                    }

                    path += token.prefix + segment
                    continue
                }

                if (token.optional) {
                    // Prepend partial segment prefixes.
                    if (token.partial) path += token.prefix

                    continue
                }

                throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
            }

            return path
        }
    },
    /**
     * Escape a regular expression string.
     *
     * @param  {string} str
     * @return {string}
     */
    escapeString = (str: string) => str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1'),
    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {string} group
     * @return {string}
     */
    escapeGroup = (group: string) => group.replace(/([=!:$/()])/g, '\\$1'),
    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {string}
     */
    flags = (options: any) => options && options.sensitive ? '' : 'i',

    /**
     * Pull out keys from a regexp.
     *
     * @param  {!RegExp} path
     * @param  {Array=}  keys
     * @return {!RegExp}
     */
    regexpToRegexp = (path: RegExp, keys?: Array<any>): RegExp => {
        if (!keys) return path

        // Use a negative lookahead to match only capturing groups.
        var groups = path.source.match(/\((?!\?)/g)

        if (groups) {
            for (var i = 0; i < groups.length; i++) {
                keys.push({
                    name: i,
                    prefix: null,
                    delimiter: null,
                    optional: false,
                    repeat: false,
                    partial: false,
                    pattern: null
                })
            }
        }

        return path;
    },

    /**
     * Transform an array into a regexp.
     *
     * @param  {!Array}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    arrayToRegexp = (path: Array<any>, keys?: Array<any>, options?: any): RegExp => {
        let parts = [];

        for (var i = 0; i < path.length; i++) {
            parts.push(pathToRegexp(path[i], keys, options).source);
        }

        return new RegExp('(?:' + parts.join('|') + ')', flags(options));
    },

    /**
     * Create a path regexp from string input.
     *
     * @param  {string}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    stringToRegexp = (path: string, keys?: Array<any>, options?: any): RegExp => {
        return tokensToRegExp(parse(path, options), keys, options)
    },

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {!Array}  tokens
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    tokensToRegExp = (tokens: Array<any>, keys?: Array<any>, options?: any): RegExp => {
        options = options || {}

        let strict = options.strict,
            start = options.start !== false,
            end = options.end !== false,
            delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER),
            delimiters = options.delimiters || DEFAULT_DELIMITERS,
            endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|'),
            route = start ? '^' : '',
            isEndDelimited = tokens.length === 0;

        // Iterate over the tokens and create our regexp string.
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];

            if (typeof token === 'string') {
                route += escapeString(token);
                isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
            } else {
                let capture = token.repeat ? '(?:' + token.pattern + ')(?:' + escapeString(token.delimiter) + '(?:' + token.pattern + '))*' : token.pattern

                if (keys) {
                    keys.push(token);
                }

                if (token.optional) {
                    if (token.partial) {
                        route += escapeString(token.prefix) + '(' + capture + ')?';
                    } else {
                        route += '(?:' + escapeString(token.prefix) + '(' + capture + '))?';
                    }
                } else {
                    route += escapeString(token.prefix) + '(' + capture + ')';
                }
            }
        }

        if (end) {
            if (!strict) {
                route += '(?:' + delimiter + ')?';
            }

            route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
        } else {
            if (!strict) {
                route += '(?:' + delimiter + '(?=' + endsWith + '))?';
            }

            if (!isEndDelimited) {
                route += '(?=' + delimiter + '|' + endsWith + ')';
            }
        }

        return new RegExp(route, flags(options));
    },

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(string|RegExp|Array)} path
     * @param  {Array=}                keys
     * @param  {Object=}               options
     * @return {!RegExp}
     */
    pathToRegexp = (path: string | RegExp, keys?: any, options?: any): RegExp => {
        if (path instanceof RegExp) {
            return regexpToRegexp(path, keys);
        }

        if (Array.isArray(path)) {
            return arrayToRegexp( /** @type {!Array} */(path), keys, options);
        }

        return stringToRegexp( /** @type {string} */(path), keys, options);
    };

export class URL {
    static pathToRegexp = pathToRegexp;
    static arrayToRegexp = arrayToRegexp;
    static tokensToRegExp = tokensToRegExp;
    static stringToRegexp = stringToRegexp;
    static regexpToRegexp = regexpToRegexp;
}