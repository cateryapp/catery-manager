import 'server-only'

// We need to fetch the user's language first.
// Since this is a utility, we might pass the locale.

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
    return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en()
}
