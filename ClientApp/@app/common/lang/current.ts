import { ko } from '@app/providers';

export const lang: KnockoutObservable<string> = ko.observableOrig(localStorage.getItem('lang') || 'en');

lang.subscribe(l => localStorage.setItem('lang', l));