
import { createClient } from '@supabase/supabase-js';
import { Build, Componente, PreferenciaUsuarioInput } from '../types';

const SUPABASE_URL = 'https://ryqsocrgtwkmvfbqsrph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cXNvY3JndHdrbXZmYnFzcnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjA3ODMsImV4cCI6MjA2Njc5Njc4M30.H-0GEt-VgUKkLW2ARn3LYgM6XAMKS0H0k7Leg6kiADM';


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

// Use the variables defined above instead of process.env
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);