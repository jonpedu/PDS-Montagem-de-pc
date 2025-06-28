import { createClient } from '@supabase/supabase-js';
import { Build, Componente, PreferenciaUsuarioInput } from '../types';

// Define a type for your database schema.
// This provides type safety and autocompletion for Supabase queries.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
        }
        Update: {
          nome?: string
          email?: string
        }
      }
      components: {
        Row: Componente
        Insert: Omit<Componente, 'id'> & { id?: string }
        Update: Partial<Componente>
      }
      builds: {
        Row: {
          id: string
          created_at: string
          user_id: string
          nome: string
          orcamento: number
          data_criacao: string
          requisitos: Json | null
          avisos_compatibilidade: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          orcamento: number
          data_criacao: string
          requisitos?: Json | null
          avisos_compatibilidade?: string[] | null
        }
        Update: {
          id?: string
          nome?: string
          orcamento?: number
          requisitos?: Json | null
          avisos_compatibilidade?: string[] | null
        }
      }
      build_components: {
        Row: {
          build_id: string
          component_id: string
          created_at: string
        }
        Insert: {
          build_id: string
          component_id: string
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

// Assume that Supabase URL and Anon Key are set in the environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Please set process.env.SUPABASE_URL and process.env.SUPABASE_ANON_KEY.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
