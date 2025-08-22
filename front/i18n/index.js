// import { flags } from '~/constants/SvgConstants.js'

export const languageCode = {
  english: 'en',
  polish: 'pl',
  romanian: 'ro',
  chinese: 'zh-CN',
  italian: 'it',
  brazilian_portuguese: 'pt-BR',
}

export const supportedLanguages = [
  {
    code: languageCode.english,
    file: 'en.json',
    displayName: 'English',
    icon: 'svgo-flags-en',
  },
  {
    code: languageCode.polish,
    file: 'pl.json',
    displayName: 'Polski',
    icon: 'svgo-flags-pl',
  },
  {
    code: languageCode.romanian,
    file: 'ro.json',
    displayName: 'Română',
    icon: 'svgo-flags-ro',
  },
  {
    code: languageCode.chinese,
    file: 'zh-CN.json',
    displayName: '简体中文',
    icon: 'svgo-flags-cn',
  },
  {
    code: languageCode.italian,
    file: 'it.json',
    displayName: 'Italiano',
    icon: 'svgo-flags-it',
  },
  {
    code: languageCode.brazilian_portuguese,
    file: 'pt-BR.json',
    displayName: 'Português (Brasil)',
    icon: 'svgo-flags-br',
  },
]
