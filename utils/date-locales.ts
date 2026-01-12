import { enUS, es, pt } from 'date-fns/locale'

export const getDateFnsLocale = (lang: string) => {
    switch (lang) {
        case 'es': return es
        case 'pt': return pt
        default: return enUS
    }
}
