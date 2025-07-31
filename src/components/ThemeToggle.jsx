import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../hooks/useTranslation'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="gap-2"
      title={theme === 'light' ? t('userPanel.darkMode') : t('userPanel.lightMode')}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">{t('userPanel.darkMode')}</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">{t('userPanel.lightMode')}</span>
        </>
      )}
    </Button>
  )
}

export default ThemeToggle

