// Importa a função para criar o cliente Supabase e os tipos locais.
import { createClient } from '@supabase/supabase-js';

// Constantes de conexão com o Supabase.
// A URL foi atualizada com a fornecida pelo usuário.
const SUPABASE_URL = 'https://bddvepakaalgvatoimat.supabase.co';
// Chave anônima (anon key) do projeto Supabase.
// !! IMPORTANTE !! SUBSTITUA O TEXTO ABAIXO PELA SUA CHAVE ANON PÚBLICA REAL.
// Você pode encontrá-la no painel do Supabase em: Project Settings > API > Project API keys > anon / public key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZHZlcGFrYWFsZ3ZhdG9pbWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzk4MDIsImV4cCI6MjA2Nzc1NTgwMn0.GWoHWGK4gUbgb3eHsm5nfhOpbXhjs-mCJwNsIfUCGG8';


// Define o tipo para campos JSON. A definição com 'any' estava causando problemas de inferência de tipo.
// A nova definição é mais específica e resolve os erros de 'Type instantiation is excessively deep'.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[];

// Define a estrutura completa do banco de dados para o Supabase.
// Isso fornece segurança de tipos e autocompletar para as queries,
// ajudando a evitar erros de digitação em nomes de tabelas e colunas.
export interface Database {
  public: {
    Tables: {
      // Tabela de componentes de hardware.
      components: {
        Row: {
          id: string
          Categoria: string
          Produto: string
          Preco: number
          LinkCompra: string | null
        }
        Insert: {
          id: string
          Categoria: string
          Produto: string
          Preco: number
          LinkCompra?: string | null
        }
        Update: {
          id?: string
          Categoria?: string
          Produto?: string
          Preco?: number
          LinkCompra?: string | null
        }
      },
      // Tabela de perfis de usuário.
      profiles: {
        Row: { // Como a linha é lida do banco.
          id: string
          nome: string
          email: string
          updated_at: string
        }
        Insert: { // Como uma nova linha é inserida.
          id: string
          nome: string
          email: string
        }
        Update: { // Quais campos podem ser atualizados.
          nome?: string
        }
      }
      // Tabela de builds salvas.
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
      // Tabela de junção entre builds e componentes.
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
        Update: {} // Esta tabela não deve ser atualizada, apenas inserida/removida.
      }
    }
    Views: { // Se houvesse views no banco de dados.
      [_ in never]: never
    }
    Functions: {
      delete_build: {
        Args: {
          p_build_id: string
        }
        Returns: undefined
      }
      upsert_build_with_components: {
        Args: {
            p_build_id: string
            p_nome: string
            p_orcamento: number
            p_data_criacao: string
            p_requisitos: Json | null
            p_avisos_compatibilidade: string[] | null
            p_component_ids: string[]
        }
        Returns: undefined
      }
    }
  }
}

// Atribui as constantes para variáveis com nomes mais claros.
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Validação para garantir que as chaves de conexão estão presentes e não são o placeholder.
if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.startsWith('COLE_SUA_CHAVE')) {
  console.error("Variáveis Supabase ausentes ou inválidas.", { supabaseUrl, supabaseAnonKey });
  throw new Error("A URL e a Chave Anônima (Anon Key) do Supabase são necessárias. Por favor, verifique e insira os valores corretos no arquivo services/supabaseClient.ts");
}


// Cria e exporta a instância do cliente Supabase, tipada com a estrutura do banco de dados.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);