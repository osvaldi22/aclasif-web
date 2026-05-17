import { createClient } from '@supabase/supabase-js';

// Tu URL real de Supabase
const supabaseUrl = 'https://udllcgofuavvpqmmvpfd.supabase.co';

// Tu clave pública real (Publishable Key)
const supabaseAnonKey = 'sb_publishable_BgTCv9VnfCJbhbZUXMuB2A_eCpnUk3O';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);