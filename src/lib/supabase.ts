import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = url && key ? createClient(url, key) : null;

export async function loadNotebooksFromCloud(username: string): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('notebooks')
    .select('data')
    .eq('username', username)
    .single();
  if (error || !data) return null;
  return data.data;
}

export async function saveNotebooksToCloud(username: string, notebooks: any[]): Promise<void> {
  if (!supabase) return;
  await supabase.from('notebooks').upsert({ username, data: notebooks, updated_at: new Date().toISOString() });
}
