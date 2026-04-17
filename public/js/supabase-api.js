import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';

const SUPABASE_URL = 'https://kuggwavwouuxqjqawqoc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8KCgGX0rOhhKxml20udL6A_dNYWP3Zq';

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

function userFromSupabase(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: usernameFromUser(user)
  };
}

function toApiMap(row, userId = null) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    name: row.name,
    cells: row.cells || {},
    isPublic: !!row.is_public,
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
    return 'Trop de mails envoyes par Supabase. Attendez quelques minutes ou desactivez la confirmation e-mail pendant les tests.';
  }
  if (lower.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (lower.includes('email not confirmed')) return 'Votre e-mail doit etre confirme avant la connexion.';
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Un compte existe deja avec cette adresse e-mail.';
  }
  return message;
}

async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return userFromSupabase(data.user);
}

async function register(username, email, password) {
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

async function login(identifier, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim().toLowerCase(),
    password
  });

  if (error) return { ok: false, error: authErrorMessage(error) };
  return { ok: true, username: usernameFromUser(data.user) };
}

async function logout() {
  await supabase.auth.signOut();
}

async function listMaps() {
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

async function listPublicMaps() {
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data.map(mapSummary);
}

async function createMap({ name, isPublic }) {
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
      is_public: !!isPublic,
      created_at: now,
      updated_at: now
    })
    .select('*')
    .single();

  if (error) throw error;
  return toApiMap(data, user.id);
}

async function getMap(id) {
  const user = await currentUser();
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return toApiMap(data, user?.id || null);
}

async function updateMap(id, { name, cells, isPublic }) {
  const patch = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name.trim() || 'Sans titre';
  if (cells !== undefined) patch.cells = cells;
  if (isPublic !== undefined) patch.is_public = !!isPublic;

  const { error } = await supabase
    .from('maps')
    .update(patch)
    .eq('id', id);

  if (error) throw error;
  return { ok: true };
}

async function deleteMap(id) {
  const { error } = await supabase
    .from('maps')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { ok: true };
}

window.DofusApi = {
  supabase,
  currentUser,
  register,
  login,
  logout,
  listMaps,
  listPublicMaps,
  createMap,
  getMap,
  updateMap,
  deleteMap
};

window.dispatchEvent(new Event('dofus-api-ready'));
