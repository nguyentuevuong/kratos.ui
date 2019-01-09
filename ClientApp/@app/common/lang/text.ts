import { ko } from '@app/providers';
import { i18n, lang } from '@app/common/lang';

// sua ham nay de get resource nhung va dung cho ham computed o bind i18n
export const getText: any = (resource: string, params?: { [key: string]: string }) => {
    let lng = ko.toJS(lang),
        i18lang = i18n[lng],
        groups: { [key: string]: string } = params || {};

    [].slice.call(resource.match(/#{.+}/g) || [])
        .map((match: string) => match.replace(/[\#\{\}]/g, ''))
        .forEach((key: string) => groups[key] = key);

    return ((i18lang[resource.replace(/(^#|#{.+})/, '').trim()] || resource)
        .replace(/#{.+}/g, (match: string) => {
            let key = match.replace(/[\#\{\}]/g, '');

            return getText((groups[key] || key || '').replace(/^#/, ''), groups);
        }) || resource).toString();
}

export { getText as i18text }