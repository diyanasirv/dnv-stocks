import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vtnykumchgoglnbyewdg.supabase.co'
const supabaseAnonKey = 'sb_publishable_KVuBDukUXq5NmK5cfE_L4Q_yku8AQGW'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)