import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 *
 * To enable Supabase caching:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Add your credentials to .env:
 *    VITE_SUPABASE_URL=your-project-url
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 * 3. Create a storage bucket named 'evetrade-resources'
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client instance
 * Only created if credentials are configured
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

/**
 * Storage bucket name for resources
 */
export const STORAGE_BUCKET = 'evetrade-resources';

/**
 * Fetch resource from Supabase storage
 * @param {string} filename - Resource filename (without extension)
 * @returns {Promise<any>} Resource data
 */
export async function fetchFromSupabase(filename) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(`${filename}.json`);

  if (error) {
    throw new Error(`Supabase storage error: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from Supabase');
  }

  const text = await data.text();
  try {
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error(`Failed to parse JSON for ${filename}: ${parseError.message}`);
  }
}

/**
 * Upload resource to Supabase storage (admin only)
 * @param {string} filename - Resource filename
 * @param {any} data - Data to upload
 * @returns {Promise<void>}
 */
export async function uploadToSupabase(filename, data) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${filename}.json`, jsonBlob, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }
}

/**
 * Get public URL for a resource
 * @param {string} filename - Resource filename
 * @returns {string|null} Public URL or null if not configured
 */
export function getPublicUrl(filename) {
  if (!supabase) return null;

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(`${filename}.json`);

  return data?.publicUrl || null;
}

/**
 * Check if resource exists in Supabase storage
 * @param {string} filename - Resource filename
 * @returns {Promise<boolean>}
 */
export async function resourceExists(filename) {
  if (!supabase) return false;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', {
      search: `${filename}.json`,
    });

  if (error) return false;
  return data?.some((file) => file.name === `${filename}.json`) || false;
}
