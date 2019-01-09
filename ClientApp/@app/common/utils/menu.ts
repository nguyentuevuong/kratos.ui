import { _, ko } from '@app/providers';
import { random } from '@app/common/utils';
import { Components } from '@app/common/ko';

export class Menu {
    public static get all(): Array<IMenu> {
        let menus: Array<IMenu> = _(Components).filter(f => !_.isUndefined(f.url)).map((m: IComponent, i: number) => ({
            id: i + 1,
            name: (m.url || '').split('/').filter(r => !!r && !r.match(/:\w+\??/)).join('|'),
            parent: undefined,
            childs: [],
            component: m
        })).value(),
            names: { [key: string]: Array<Array<string>> } = _(menus).map(m => m.name.split('|')).groupBy(m => m[0]).value();

        _(names).keys().each((k: string, i: number) => {
            if (_.size(names[k]) > 1) {
                let root = {
                    id: (i + 1),
                    name: k,
                    childs: _.filter(menus, m => m.name == random.id)
                }, groups = _(names[k]).map(m => m).groupBy(m => m[1]).value();

                menus.push(root);

                _(groups).keys().each((m: string, j: number) => {
                    if (_.size(groups[m]) > 1) {
                        let name = [k, m].join('|'),
                            leaps = _.filter(menus, (u: IMenu) => u.name.indexOf(name) == 0),
                            child = {
                                id: (i + 1) * 10 + j,
                                name: name,
                                parent: root,
                                childs: leaps
                            };

                        menus.push(child);

                        _.each(leaps, l => l.parent = child);
                    }
                });

                _(menus).filter((u: IMenu) => (u.parent == root) || (!u.parent && u.name != k && u.name.indexOf(k) == 0)).each((c: IMenu) => {
                    c.parent = root;
                    root.childs.push(c);
                });
            }
        });

        _.each(menus, (m: IMenu) => {
            if (!m.parent) {
                delete m.parent;
            }

            if (!_.size(m.childs)) {
                delete m.childs;
            }
        });

        return menus.filter(m => !m.parent);
    }

    public static get top(): Array<IMenu> {
        return Menu.all.filter(m => m.name != 'sample');
    }

    public static get sample(): Array<IMenu> {
        return (ko.utils.arrayFirst(Menu.all, m => m.name === 'sample') || {}).childs || [];
    }
}

export { Menu as menu }