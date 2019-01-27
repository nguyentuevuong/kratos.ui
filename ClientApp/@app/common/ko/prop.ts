export function prop(): any {
    return function (comp: any, prop: any) {
        comp[prop] = '';
        console.log({ comp, prop });
    }
}