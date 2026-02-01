export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string | null
          end_at: string | null
          event_id: string
          hours_worked: number | null
          id: string
          is_available: boolean | null
          net_amount: number | null
          role: string | null
          staff_id: string
          start_at: string | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          end_at?: string | null
          event_id: string
          hours_worked?: number | null
          id?: string
          is_available?: boolean | null
          net_amount?: number | null
          role?: string | null
          staff_id: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          end_at?: string | null
          event_id?: string
          hours_worked?: number | null
          id?: string
          is_available?: boolean | null
          net_amount?: number | null
          role?: string | null
          staff_id?: string
          start_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_groups: {
        Row: {
          created_at: string | null
          id: string
          max_select: number | null
          min_select: number | null
          name: string
          parent_product_id: string
          pricing_behavior:
            | Database["public"]["Enums"]["pricing_behavior"]
            | null
          sort_order: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_select?: number | null
          min_select?: number | null
          name: string
          parent_product_id: string
          pricing_behavior?:
            | Database["public"]["Enums"]["pricing_behavior"]
            | null
          sort_order?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_select?: number | null
          min_select?: number | null
          name?: string
          parent_product_id?: string
          pricing_behavior?:
            | Database["public"]["Enums"]["pricing_behavior"]
            | null
          sort_order?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_groups_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_groups_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_costs: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          event_id: string
          id: string
          provider_id: string | null
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          event_id: string
          id?: string
          provider_id?: string | null
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          event_id?: string
          id?: string
          provider_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_costs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_costs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_costs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_moments: {
        Row: {
          created_at: string | null
          end_at: string | null
          event_id: string
          guest_count_mode: string | null
          guest_count_override: number | null
          id: string
          location_mode: string | null
          location_override: string | null
          name: string
          notes: string | null
          rank: number | null
          requirements: Json | null
          start_at: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          end_at?: string | null
          event_id: string
          guest_count_mode?: string | null
          guest_count_override?: number | null
          id?: string
          location_mode?: string | null
          location_override?: string | null
          name: string
          notes?: string | null
          rank?: number | null
          requirements?: Json | null
          start_at?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          end_at?: string | null
          event_id?: string
          guest_count_mode?: string | null
          guest_count_override?: number | null
          id?: string
          location_mode?: string | null
          location_override?: string | null
          name?: string
          notes?: string | null
          rank?: number | null
          requirements?: Json | null
          start_at?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_moments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_moments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_phase_item_components: {
        Row: {
          component_product_id: string
          created_at: string | null
          event_phase_item_id: string
          group_id: string | null
          id: string
          quantity: number | null
          selected: boolean | null
          workspace_id: string
        }
        Insert: {
          component_product_id: string
          created_at?: string | null
          event_phase_item_id: string
          group_id?: string | null
          id?: string
          quantity?: number | null
          selected?: boolean | null
          workspace_id: string
        }
        Update: {
          component_product_id?: string
          created_at?: string | null
          event_phase_item_id?: string
          group_id?: string | null
          id?: string
          quantity?: number | null
          selected?: boolean | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_phase_item_components_component_product_id_fkey"
            columns: ["component_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phase_item_components_event_phase_item_id_fkey"
            columns: ["event_phase_item_id"]
            isOneToOne: false
            referencedRelation: "event_phase_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phase_item_components_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "bundle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phase_item_components_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_phase_items: {
        Row: {
          configuration_json: Json | null
          created_at: string | null
          event_phase_id: string
          id: string
          notes: string | null
          pricing_mode_override:
            | Database["public"]["Enums"]["pricing_mode"]
            | null
          product_id: string
          quantity: number | null
          quantity_source: Database["public"]["Enums"]["quantity_source"] | null
          unit_price_override: number | null
          workspace_id: string
        }
        Insert: {
          configuration_json?: Json | null
          created_at?: string | null
          event_phase_id: string
          id?: string
          notes?: string | null
          pricing_mode_override?:
            | Database["public"]["Enums"]["pricing_mode"]
            | null
          product_id: string
          quantity?: number | null
          quantity_source?:
            | Database["public"]["Enums"]["quantity_source"]
            | null
          unit_price_override?: number | null
          workspace_id: string
        }
        Update: {
          configuration_json?: Json | null
          created_at?: string | null
          event_phase_id?: string
          id?: string
          notes?: string | null
          pricing_mode_override?:
            | Database["public"]["Enums"]["pricing_mode"]
            | null
          product_id?: string
          quantity?: number | null
          quantity_source?:
            | Database["public"]["Enums"]["quantity_source"]
            | null
          unit_price_override?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_phase_items_event_phase_id_fkey"
            columns: ["event_phase_id"]
            isOneToOne: false
            referencedRelation: "event_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phase_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_phases: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          name_override: string | null
          phase_type_id: string
          sort_order: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          name_override?: string | null
          phase_type_id: string
          sort_order?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          name_override?: string | null
          phase_type_id?: string
          sort_order?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_phases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phases_phase_type_id_fkey"
            columns: ["phase_type_id"]
            isOneToOne: false
            referencedRelation: "phase_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_phases_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          default_guest_count: number | null
          doc_content: Json | null
          end_at: string | null
          estimated_guests: number | null
          id: string
          location: string | null
          name: string
          staffing_requirements: Json | null
          start_at: string
          status: Database["public"]["Enums"]["event_status"] | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          default_guest_count?: number | null
          doc_content?: Json | null
          end_at?: string | null
          estimated_guests?: number | null
          id?: string
          location?: string | null
          name: string
          staffing_requirements?: Json | null
          start_at: string
          status?: Database["public"]["Enums"]["event_status"] | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          default_guest_count?: number | null
          doc_content?: Json | null
          end_at?: string | null
          estimated_guests?: number | null
          id?: string
          location?: string | null
          name?: string
          staffing_requirements?: Json | null
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_type_products: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          phase_type_id: string
          product_id: string
          sort_order: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          phase_type_id: string
          product_id: string
          sort_order?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          phase_type_id?: string
          product_id?: string
          sort_order?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_type_products_phase_type_id_fkey"
            columns: ["phase_type_id"]
            isOneToOne: false
            referencedRelation: "phase_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_type_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_type_products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_types_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      product_components: {
        Row: {
          child_product_id: string
          created_at: string | null
          default_selected: boolean | null
          group_id: string | null
          id: string
          is_optional: boolean | null
          notes: string | null
          parent_product_id: string
          quantity: number | null
          visibility_mode:
            | Database["public"]["Enums"]["component_visibility_mode"]
            | null
          workspace_id: string
        }
        Insert: {
          child_product_id: string
          created_at?: string | null
          default_selected?: boolean | null
          group_id?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          parent_product_id: string
          quantity?: number | null
          visibility_mode?:
            | Database["public"]["Enums"]["component_visibility_mode"]
            | null
          workspace_id: string
        }
        Update: {
          child_product_id?: string
          created_at?: string | null
          default_selected?: boolean | null
          group_id?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          parent_product_id?: string
          quantity?: number | null
          visibility_mode?:
            | Database["public"]["Enums"]["component_visibility_mode"]
            | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_components_child_product_id_fkey"
            columns: ["child_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "bundle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      product_resources: {
        Row: {
          applies_to:
            | Database["public"]["Enums"]["resource_application_scope"]
            | null
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number | null
          ratio_base: number | null
          resource_id: string
          rounding_mode: Database["public"]["Enums"]["rounding_mode"] | null
          rule_type: Database["public"]["Enums"]["resource_rule_type"] | null
          workspace_id: string
        }
        Insert: {
          applies_to?:
            | Database["public"]["Enums"]["resource_application_scope"]
            | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number | null
          ratio_base?: number | null
          resource_id: string
          rounding_mode?: Database["public"]["Enums"]["rounding_mode"] | null
          rule_type?: Database["public"]["Enums"]["resource_rule_type"] | null
          workspace_id: string
        }
        Update: {
          applies_to?:
            | Database["public"]["Enums"]["resource_application_scope"]
            | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number | null
          ratio_base?: number | null
          resource_id?: string
          rounding_mode?: Database["public"]["Enums"]["rounding_mode"] | null
          rule_type?: Database["public"]["Enums"]["resource_rule_type"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_resources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_resources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          base_unit: Database["public"]["Enums"]["base_unit"] | null
          category_id: string | null
          created_at: string | null
          default_quantity_source:
            | Database["public"]["Enums"]["quantity_source"]
            | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
          product_role: Database["public"]["Enums"]["product_role"] | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          sku: string | null
          tax_rate: number | null
          visibility: Database["public"]["Enums"]["product_visibility"] | null
          workspace_id: string
        }
        Insert: {
          base_price?: number | null
          base_unit?: Database["public"]["Enums"]["base_unit"] | null
          category_id?: string | null
          created_at?: string | null
          default_quantity_source?:
            | Database["public"]["Enums"]["quantity_source"]
            | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"] | null
          product_role?: Database["public"]["Enums"]["product_role"] | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          sku?: string | null
          tax_rate?: number | null
          visibility?: Database["public"]["Enums"]["product_visibility"] | null
          workspace_id: string
        }
        Update: {
          base_price?: number | null
          base_unit?: Database["public"]["Enums"]["base_unit"] | null
          category_id?: string | null
          created_at?: string | null
          default_quantity_source?:
            | Database["public"]["Enums"]["quantity_source"]
            | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"] | null
          product_role?: Database["public"]["Enums"]["product_role"] | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          sku?: string | null
          tax_rate?: number | null
          visibility?: Database["public"]["Enums"]["product_visibility"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          category: string | null
          contact_info: string | null
          created_at: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_reusable: boolean | null
          name: string
          resource_type: Database["public"]["Enums"]["resource_type"] | null
          unit: Database["public"]["Enums"]["resource_unit"] | null
          workspace_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_reusable?: boolean | null
          name: string
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          unit?: Database["public"]["Enums"]["resource_unit"] | null
          workspace_id: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_reusable?: boolean | null
          name?: string
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          unit?: Database["public"]["Enums"]["resource_unit"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          assiduity_score: number | null
          attributes: Json | null
          created_at: string | null
          email: string | null
          first_name: string
          full_name_search: string | null
          id: string
          last_name: string | null
          phone: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          assiduity_score?: number | null
          attributes?: Json | null
          created_at?: string | null
          email?: string | null
          first_name: string
          full_name_search?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          assiduity_score?: number | null
          attributes?: Json | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          full_name_search?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          staff_id: string
          status: string | null
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          staff_id: string
          status?: string | null
          token: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          staff_id?: string
          status?: string | null
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invitations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
        }
        Relationships: []
      }
      workspace_configs: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: Json
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: Json
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["workspace_role"] | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"] | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"] | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          join_code: string | null
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          join_code?: string | null
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          join_code?: string | null
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_staff_assiduity: { Args: never; Returns: undefined }
      get_user_workspace_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      assignment_status: "pending" | "confirmed" | "completed" | "disputed"
      base_unit: "guest" | "unit" | "hour" | "service"
      component_visibility_mode: "internal" | "client" | "both"
      event_status: "draft" | "confirmed" | "done" | "cancelled"
      pricing_behavior: "included" | "surcharge"
      pricing_mode: "fixed" | "per_unit"
      product_role: "sellable" | "component" | "both"
      product_type: "single" | "bundle" | "service"
      product_visibility: "internal" | "client" | "both"
      quantity_source: "guests" | "manual" | "hours"
      resource_application_scope:
        | "all"
        | "selected_components_only"
        | "bundle_parent_only"
      resource_rule_type: "per_product_unit" | "per_ratio" | "fixed_per_parent"
      resource_type: "ingredient" | "tableware" | "equipment"
      resource_unit: "unit" | "kg" | "g" | "l" | "ml" | "pack" | "hour"
      rounding_mode: "ceil" | "floor" | "round" | "none"
      workspace_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assignment_status: ["pending", "confirmed", "completed", "disputed"],
      base_unit: ["guest", "unit", "hour", "service"],
      component_visibility_mode: ["internal", "client", "both"],
      event_status: ["draft", "confirmed", "done", "cancelled"],
      pricing_behavior: ["included", "surcharge"],
      pricing_mode: ["fixed", "per_unit"],
      product_role: ["sellable", "component", "both"],
      product_type: ["single", "bundle", "service"],
      product_visibility: ["internal", "client", "both"],
      quantity_source: ["guests", "manual", "hours"],
      resource_application_scope: [
        "all",
        "selected_components_only",
        "bundle_parent_only",
      ],
      resource_rule_type: ["per_product_unit", "per_ratio", "fixed_per_parent"],
      resource_type: ["ingredient", "tableware", "equipment"],
      resource_unit: ["unit", "kg", "g", "l", "ml", "pack", "hour"],
      rounding_mode: ["ceil", "floor", "round", "none"],
      workspace_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const

