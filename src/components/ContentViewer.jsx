import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, ZoomIn, ZoomOut, RotateCw, Maximize, Download } from 'lucide-react'

function ContentViewer({ content, onClose, onBack }) {
  const [imageZoom, setImageZoom] = useState(100)
  const [imageRotation, setImageRotation] = useState(0)

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360)
  }

  const renderContent = () => {
    switch (content.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-green-800 mb-4">{content.title}</h2>
              {content.description && (
                <p className="text-gray-600 mb-4 italic">{content.description}</p>
              )}
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {content.text_content}
              </div>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            {/* Controles da imagem */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4 mr-1" />
                Reduzir
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4 mr-1" />
                Ampliar
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4 mr-1" />
                Girar
              </Button>
              <span className="flex items-center text-sm text-gray-600">
                {imageZoom}%
              </span>
            </div>

            {/* Visualizador da imagem */}
            <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-96">
              <div className="flex justify-center">
                <img
                  src={content.file_url}
                  alt={content.title}
                  style={{
                    transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                  className="max-w-full h-auto"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDMvMjAwMC9zdmciPgoJPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPgoJPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuYW8gZGlzcG9uaXZlbDwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-auto max-h-96"
                preload="metadata"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              >
                <source src={content.file_url} type="video/mp4" />
                <source src={content.file_url} type="video/webm" />
                <source src={content.file_url} type="video/ogg" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
              <div className="hidden items-center justify-center h-48 bg-gray-100 text-gray-600">
                <div className="text-center">
                  <p>Vídeo não disponível</p>
                  <p className="text-sm">Formato não suportado ou arquivo corrompido</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border overflow-hidden">
              <iframe
                src={content.file_url}
                className="w-full h-96"
                title={content.title}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden items-center justify-center h-96 bg-gray-100 text-gray-600">
                <div className="text-center">
                  <p>PDF não pode ser exibido</p>
                  <p className="text-sm">Clique no botão abaixo para baixar o arquivo</p>
                  <Button 
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(content.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Tipo de conteúdo não suportado</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={onClose || onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-green-800">{content.title}</h1>
            {content.description && (
              <p className="text-green-600">{content.description}</p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Visualizador de Conteúdo</span>
              <span className="text-sm font-normal text-gray-500 capitalize">
                {content.type}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {content.file_url && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => window.open(content.file_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Arquivo Original
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentViewer

