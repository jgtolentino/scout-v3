import { supabase } from './supabase';
import * as mock from '../services/mock-enhanced-analytics';

/**
 * Returns either the real Supabase client or the in-memory mock service
 * depending on VITE_SCOUT_DEMO env flag.
 */
export function getDataProvider() {
  if (import.meta.env.VITE_SCOUT_DEMO === 'on') {
    return mock;                                   // all methods return Promises
  }
  return supabase;                                 // original client
}