import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, FileText, Image, Video, FileIcon, Eye, LogOut, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ContentViewer from './ContentViewer'
import LogoutConfirmDialog from './LogoutConfirmDialog'
import LanguageSelector from './LanguageSelector'
import ThemeToggle from './ThemeToggle'
import { useTranslation } from '../hooks/useTranslation'

function UserPanel({ onBack }) {
  const [contents, setContents] = useState([])
  const [selectedContent, setSelectedContent] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [userRole, setUserRole] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  const { t } = useTranslation()

  const loadContents = useCallback(async (userId, currentUserRole, currentUserIsPremium) => {
    try {
      let query = supabase.from('content').select('*').order('created_at', { ascending: false });

      // Filtro para conteúdo premium/não premium
      if (currentUserRole !== 'admin') {
        query = query.or(`is_premium.eq.false,is_premium.eq.${currentUserIsPremium}`);
      }

      // Filtro para conteúdo bloqueado por data
      query = query.lte('release_date', new Date().toISOString());

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar conteúdo com unlock_days
      const filteredByUnlock = data.filter(content => {
        if (content.is_locked && content.unlock_days > 0) {
          const createdAt = new Date(content.created_at);
          const unlockDate = new Date(createdAt.setDate(createdAt.getDate() + content.unlock_days));
          return new Date() >= unlockDate;
        }
        return true;
      });

      setContents(filteredByUnlock || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    }
  }, []); // Dependências vazias para useCallback

  useEffect(() => {
    const fetchUserAndContents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, is_premium')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (profile) {
          setUserRole(profile.role);
          setIsPremium(profile.is_premium);
          loadContents(user.id, profile.role, profile.is_premium); // Chamar loadContents aqui
        }
      } else {
        loadContents(null, null, false); // Carregar conteúdo para usuário não logado
      }
      setLoadingRole(false);
    };

    fetchUserAndContents();
  }, []); // Remover loadContents das dependências para evitar loop infinito

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      onBack(); // Volta para a tela de login/home
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'pdf': return <FileIcon className="w-5 h-5" />
      default: return <FileIcon className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'text': return t('userPanel.text')
      case 'image': return t('userPanel.image')
      case 'video': return t('userPanel.video')
      case 'pdf': return t('userPanel.pdf')
      default: return t('userPanel.file')
    }
  }

  const filteredContents = activeTab === 'all' 
    ? contents 
    : contents.filter(content => content.type === activeTab)

  const groupedContents = filteredContents.reduce((acc, content) => {
    if (!acc[content.type]) {
      acc[content.type] = []
    }
    acc[content.type].push(content)
    return acc
  }, {})

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-green-600 text-lg">Carregando painel do usuário...</p>
      </div>
    );
  }

  if (selectedContent) {
    return (
      <ContentViewer 
        content={selectedContent} 
        onClose={() => setSelectedContent(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <LogoutConfirmDialog onConfirm={onBack}>
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('userPanel.back')}
              </Button>
            </LogoutConfirmDialog>
            <div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">{t('userPanel.title')}</h1>
              <p className="text-green-600 dark:text-green-300">{t('userPanel.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {t('userPanel.all')}
          </Button>
          <Button
            variant={activeTab === 'text' ? 'default' : 'outline'}
            onClick={() => setActiveTab('text')}
            className={activeTab === 'text' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('userPanel.texts')}
          </Button>
          <Button
            variant={activeTab === 'image' ? 'default' : 'outline'}
            onClick={() => setActiveTab('image')}
            className={activeTab === 'image' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Image className="w-4 h-4 mr-2" />
            {t('userPanel.images')}
          </Button>
          <Button
            variant={activeTab === 'video' ? 'default' : 'outline'}
            onClick={() => setActiveTab('video')}
            className={activeTab === 'video' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Video className="w-4 h-4 mr-2" />
            {t('userPanel.videos')}
          </Button>
          <Button
            variant={activeTab === 'pdf' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pdf')}
            className={activeTab === 'pdf' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <FileIcon className="w-4 h-4 mr-2" />
            {t('userPanel.pdfs')}
          </Button>
        </div>

        {/* Conteúdo */}
        {contents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {t('userPanel.noContent')}
              </h3>
              <p className="text-gray-500">
                {t('userPanel.noContentDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedContents).map(([type, typeContents]) => (
              <div key={type}>
                <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center">
                  {getTypeIcon(type)}
                  <span className="ml-2">{getTypeLabel(type)}s {t('userPanel.available')}</span>
                  <span className="ml-2 text-sm text-green-600 dark:text-green-300">({typeContents.length})</span>
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeContents.map((content) => (
                    <Card key={content.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              {getTypeIcon(content.type)}
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">
                                {content.title}
                              </CardTitle>
                              <p className="text-xs text-gray-500">
                                {new Date(content.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        {content.description && (
                          <CardDescription className="text-sm">
                            {content.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => setSelectedContent(content)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('userPanel.view')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPanel

