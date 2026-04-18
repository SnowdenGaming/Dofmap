import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kuggwavwouuxqjqawqoc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8KCgGX0rOhhKxml20udL6A_dNYWP3Zq';
export const USER_KEY = 'dofus-current-user';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

function usernameFromUser(user) {
  return user?.user_metadata?.username || user?.email?.split('@')[0] || 'Aventurier';
}

function setCachedUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {}
}

function userFromSupabase(user) {
  if (!user) return null;
  const apiUser = {
    id: user.id,
    email: user.email,
    username: usernameFromUser(user)
  };
  setCachedUser(apiUser);
  return apiUser;
}

function toApiMap(row, userId = null) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    name: row.name,
    cells: row.cells || {},
    isPublic: Boolean(row.is_public),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    readonly: userId ? row.user_id !== userId : true
  };
}

function mapSummary(row) {
  const map = toApiMap(row);
  const { cells, readonly, ...meta } = map;
  return { ...meta, annotationCount: Object.keys(cells || {}).length };
}

function authErrorMessage(error) {
  const message = error?.message || 'Erreur Supabase Auth.';
  const lower = message.toLowerCase();

  if (lower.includes('email rate limit')) {
    return "Trop de mails envoyes par Supabase. Attendez quelques minutes ou desactivez la confirmation e-mail pendant les tests.";
  }
  if (lower.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (lower.includes('email not confirmed')) return 'Votre e-mail doit etre confirme avant la connexion.';
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Un compte existe deja avec cette adresse e-mail.';
  }
  return message;
}

export function getCachedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) setCachedUser(null);
  if (error) return null;
  return userFromSupabase(data.user);
}

export async function register(username, email, password) {
  username = username.trim();
  email = email.trim().toLowerCase();

  if (!username || username.length < 3) {
    return { ok: false, error: 'Le pseudo doit faire au moins 3 caracteres.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Adresse e-mail invalide.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Le mot de passe doit faire au moins 6 caracteres.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) return { ok: false, error: authErrorMessage(error) };
  if (!data.session) {
    return {
      ok: true,
      needsEmailConfirmation: true,
      message: 'Compte cree. Verifiez votre e-mail avant de vous connecter.'
    };
  }
  return { ok: true, username: usernameFromUser(data.user) };
}

export async function login(identifier, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim().toLowerCase(),
    password
  });

  if (error) return { ok: false, error: authErrorMessage(error) };
  return { ok: true, username: usernameFromUser(data.user) };
}

export async function logout() {
  await supabase.auth.signOut();
  setCachedUser(null);
}

export async function listMaps() {
  const user = await currentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapSummary);
}

export async function listPublicMaps() {
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapSummary);
}

export async function createMap({ name, isPublic }) {
  const user = await currentUser();
  if (!user) throw new Error('Non connecte.');

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('maps')
    .insert({
      user_id: user.id,
      username: user.username,
      name: name.trim(),
      cells: {},
      is_public: Boolean(isPublic),
      created_at: now,
      updated_at: now
    })
    .select('*')
    .single();

  if (error) throw error;
  return toApiMap(data, user.id);
}

export async function updateMap(id, { name, cells, isPublic }) {
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name.trim() || 'Sans titre';
  if (cells !== undefined) patch.cells = cells;
  if (isPublic !== undefined) patch.is_public = Boolean(isPublic);

  const { error } = await supabase.from('maps').update(patch).eq('id', id);

  if (error) throw error;
  return { ok: true };
}

export async function deleteMap(id) {
  const { error } = await supabase.from('maps').delete().eq('id', id);

  if (error) throw error;
  return { ok: true };
}

export { supabase };
