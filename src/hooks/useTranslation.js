import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../translations'

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Fallback para espanhol se a tradução não existir
        value = translations.es
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey]
          } else {
            return key // Retorna a chave se não encontrar tradução
          }
        }
        break
      }
    }
    
    return value || key
  }
  
  return { t }
}

