# Configuração do Supabase para PLAN DE VITALIDAD

## 1. Criar Tabela `content`

Execute este SQL no **SQL Editor** do seu projeto Supabase:

```sql
-- Criar tabela content
CREATE TABLE public.content (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'pdf')),
    file_url TEXT,
    text_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON public.content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para todos os usuários (temporário para teste)
CREATE POLICY "Allow all operations on content" ON public.content
FOR ALL USING (true) WITH CHECK (true);
```

## 2. Criar Bucket de Storage

Execute este SQL no **SQL Editor**:

```sql
-- Criar bucket para arquivos de mídia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-media', 'content-media', true);
```

## 3. Configurar Políticas do Storage

Execute este SQL:

```sql
-- Política para upload (INSERT)
CREATE POLICY "Allow uploads to content-media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'content-media');

-- Política para download (SELECT)
CREATE POLICY "Allow downloads from content-media" ON storage.objects
FOR SELECT USING (bucket_id = 'content-media');

-- Política para atualização (UPDATE)
CREATE POLICY "Allow updates to content-media" ON storage.objects
FOR UPDATE USING (bucket_id = 'content-media');

-- Política para exclusão (DELETE)
CREATE POLICY "Allow deletes from content-media" ON storage.objects
FOR DELETE USING (bucket_id = 'content-media');
```

## 4. Verificar Configuração

Execute estes comandos para verificar se tudo foi criado corretamente:

```sql
-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se o bucket foi criado
SELECT name, public FROM storage.buckets WHERE name = 'content-media';

-- Verificar políticas da tabela
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'content';
```

## 5. Teste de Inserção

Teste se a inserção funciona:

```sql
-- Teste de inserção de texto
INSERT INTO public.content (title, description, type, text_content) 
VALUES ('Teste de Configuração', 'Verificando se o banco está funcionando', 'text', 'Este é um teste de configuração do banco de dados.');

-- Verificar se foi inserido
SELECT * FROM public.content ORDER BY created_at DESC LIMIT 1;
```

## Credenciais Configuradas

- **URL:** https://sdkiyihwzvjgoytzuase.supabase.co
- **ANON KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2l5aWh3enZqZ295dHp1YXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTYzNzcsImV4cCI6MjA2OTM5MjM3N30.cD32Eyj7WG8pfUhjfOG9tN_426LmatSJtgRdey9uV-s

## Próximos Passos

1. Execute todos os comandos SQL acima no seu projeto Supabase
2. Verifique se não há erros
3. Teste o aplicativo localmente
4. Se tudo funcionar, faremos o deploy no Vercel

