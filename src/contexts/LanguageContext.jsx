import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Tentar recuperar idioma do localStorage
    const savedLanguage = localStorage.getItem('planVitalidad_language')
    if (savedLanguage) {
      return savedLanguage
    }
    
    // Detectar idioma do navegador
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith('es')) return 'es'
    if (browserLanguage.startsWith('en')) return 'en'
    if (browserLanguage.startsWith('pt')) return 'pt'
    
    // Padrão para espanhol (público alvo)
    return 'es'
  })

  useEffect(() => {
    localStorage.setItem('planVitalidad_language', language)
  }, [language])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

