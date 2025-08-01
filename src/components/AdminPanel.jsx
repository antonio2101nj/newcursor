import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ArrowLeft, Upload, FileText, Image, Video, FileIcon, Trash2, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import LogoutConfirmDialog from './LogoutConfirmDialog'

function AdminPanel({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    textContent: '',
    file: null,
    isPremiumContent: false, // Novo campo
    isLocked: false, // Novo campo
    unlockDays: 0, // Novo campo
    releaseDate: new Date().toISOString().split('T')[0] // Novo campo, data atual
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [contents, setContents] = useState([])
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
        } else if (profile) {
          setUserRole(profile.role);
        }
      }
      setLoadingRole(false);
    };

    fetchUserRole();
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContents(data || [])
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      file
    }))
  }

  const uploadFile = async (file) => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadMessage('')

    try {
      let fileUrl = null

      // Upload do arquivo se existir
      if (formData.file) {
        fileUrl = await uploadFile(formData.file)
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('content')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            file_url: fileUrl,
            text_content: formData.textContent || null,
            created_by: user ? user.id : null, // Adiciona o ID do usuário logado
            is_premium: formData.isPremiumContent, // Novo campo
            is_locked: formData.isLocked, // Novo campo
            unlock_days: formData.isLocked ? parseInt(formData.unlockDays) : 0, // Novo campo
            release_date: formData.releaseDate // Novo campo
          }
        ])

      if (error) throw error

      setUploadMessage('Conteúdo enviado com sucesso!')
      setFormData({
        title: '',
        description: '',
        type: '',
        textContent: '',
        file: null,
        isPremiumContent: false,
        isLocked: false,
        unlockDays: 0,
        releaseDate: new Date().toISOString().split('T')[0]
      })
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''

      // Recarregar lista
      loadContents()

    } catch (error) {
      console.error('Erro ao enviar conteúdo:', error)
      setUploadMessage(`Erro: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteContent = async (id) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setUploadMessage('Conteúdo excluído com sucesso!')
      loadContents()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      setUploadMessage(`Erro ao excluir: ${error.message}`)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'pdf': return <FileIcon className="w-4 h-4" />
      default: return <FileIcon className="w-4 h-4" />
    }
  }

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-green-600 text-lg">Carregando painel administrativo...</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-800 p-4">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="text-lg text-center">Você não tem permissão para acessar o painel administrativo.</p>
        <Button variant="outline" onClick={onBack} className="mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a tela inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-green-800">Painel Administrativo</h1>
          </div>
          <LogoutConfirmDialog onConfirm={onBack}>
            <Button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </LogoutConfirmDialog>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulário de Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Upload className="w-5 h-5 mr-2" />
                Enviar Novo Conteúdo
              </CardTitle>
              <CardDescription>
                Adicione textos, vídeos, PDFs ou imagens que aparecerão no painel do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo de Conteúdo</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conteúdo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Digite o título do conteúdo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Digite uma breve descrição do conteúdo"
                    rows={3}
                  />
                </div>

                {formData.type === 'text' && (
                  <div>
                    <Label htmlFor="textContent">Conteúdo do Texto</Label>
                    <Textarea
                      id="textContent"
                      value={formData.textContent}
                      onChange={(e) => handleInputChange('textContent', e.target.value)}
                      placeholder="Digite o conteúdo do texto"
                      rows={6}
                      required
                    />
                  </div>
                )}

                {formData.type && formData.type !== 'text' && (
                  <div>
                    <Label htmlFor="file-upload">Arquivo</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept={
                        formData.type === 'image' ? 'image/*' :
                        formData.type === 'video' ? 'video/*' :
                        formData.type === 'pdf' ? '.pdf' : '*'
                      }
                      required
                    />
                  </div>
                )}

                {/* Novos campos para controle de acesso e liberação */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPremiumContent"
                    checked={formData.isPremiumContent}
                    onChange={(e) => handleInputChange('isPremiumContent', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                  <Label htmlFor="isPremiumContent">Conteúdo Premium</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isLocked"
                    checked={formData.isLocked}
                    onChange={(e) => handleInputChange('isLocked', e.target.checked)}
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                  <Label htmlFor="isLocked">Conteúdo Bloqueado por Tempo</Label>
                </div>

                {formData.isLocked && (
                  <div>
                    <Label htmlFor="unlockDays">Dias para Desbloquear (a partir da criação)</Label>
                    <Input
                      id="unlockDays"
                      type="number"
                      value={formData.unlockDays}
                      onChange={(e) => handleInputChange('unlockDays', e.target.value)}
                      placeholder="Ex: 7 (dias)"
                      min="0"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="releaseDate">Data de Lançamento</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isUploading || !formData.title || !formData.type}
                >
                  {isUploading ? 'Enviando...' : 'Enviar Conteúdo'}
                </Button>

                {uploadMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    uploadMessage.includes('sucesso') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {uploadMessage}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Lista de Conteúdos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Conteúdo Publicado</CardTitle>
              <CardDescription>
                Gerencie todo o conteúdo que aparece no painel do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum conteúdo publicado ainda
                  </p>
                ) : (
                  contents.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded">
                          {getTypeIcon(content.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-gray-500">
                            {content.type} • {new Date(content.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContent(content.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel

