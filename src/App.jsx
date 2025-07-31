import React, { useState } from 'react'
import './App.css'
import AdminPanel from './components/AdminPanel'
import UserPanel from './components/UserPanel'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Settings, Users } from 'lucide-react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [currentView, setCurrentView] = useState("home")
  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleBackToHome = () => {
    setCurrentView("home")
  }

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminPanel onBack={handleBackToHome} />
      case 'user':
        return <UserPanel onBack={handleBackToHome} />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-green-800 mb-2">
                  PLAN DE VITALIDAD
                </h1>
                <p className="text-green-600 text-lg">
                  Sistema de Gestão de Conteúdo para Saúde e Bem-estar
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewChange('admin')}>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">Painel Administrativo</CardTitle>
                    <CardDescription>
                      Gerencie e publique conteúdos de saúde, vídeos educativos e documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Acessar Painel Admin
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewChange('user')}>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">Painel do Usuário</CardTitle>
                    <CardDescription>
                      Acesse conteúdos, vídeos e documentos sobre saúde e bem-estar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Acessar Painel Usuário
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <p className="text-green-600 text-sm">
                  Versão de teste - Focada em upload e visualização de arquivos
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        {renderView()}
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

