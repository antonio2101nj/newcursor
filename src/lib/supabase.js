import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sdkiyihwzvjgoytzuase.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2l5aWh3enZqZ295dHp1YXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTYzNzcsImV4cCI6MjA2OTM5MjM3N30.cD32Eyj7WG8pfUhjfOG9tN_426LmatSJtgRdey9uV-s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

