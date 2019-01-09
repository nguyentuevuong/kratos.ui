export class UUID {
    public static random(): string {
        let self = this;

        // tslint:disable-next-line:max-line-length
        if (typeof (window) !== 'undefined' && typeof (window.crypto) !== 'undefined' && typeof (window.crypto.getRandomValues) !== 'undefined') {
            // If we have a cryptographically secure PRNG, use that
            // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
            const buf: Uint16Array = new Uint16Array(8);
            window.crypto.getRandomValues(buf);
            // tslint:disable-next-line:max-line-length
            return (`${self.pad4(buf[0])}${self.pad4(buf[1])}-${self.pad4(buf[2])}-${self.pad4(buf[3])}-${self.pad4(buf[4])}-${self.pad4(buf[5])}${self.pad4(buf[6])}${self.pad4(buf[7])}`);
        } else {
            // Otherwise, just use Math.random
            // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
            // https://stackoverflow.com/questions/11605068/why-does-jshint-argue-against-bitwise-operators-how-should-i-express-this-code
            return `${self.random4()}${self.random4()}-${self.random4()}-${self.random4()}-${self.random4()}-${self.random4()}${self.random4()}${self.random4()}`;
        }
    }

    private static pad4 = (num: number): string => {
        let strn = num.toString(16);
        return (new Array(4 + 1 - strn.length)).join('0') + strn;
    };
    private static random4 = (): string => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}