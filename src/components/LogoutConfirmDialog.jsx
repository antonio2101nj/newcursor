import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

function LogoutConfirmDialog({ onConfirm, children }) {
  const { t } = useTranslation()
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('userPanel.logoutConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('userPanel.logoutDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('userPanel.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            {t('userPanel.confirmLogout')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LogoutConfirmDialog

