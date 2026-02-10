export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          area_id: number | null
          calificacion: number | null
          creador_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_actividad"] | null
          evaluado_por_id: string | null
          fecha_completada: string | null
          fecha_creacion: string | null
          fecha_evaluada: string | null
          fecha_limite: string | null
          id: number
          observaciones_evaluacion: string | null
          prioridad: Database["public"]["Enums"]["prioridad_actividad"] | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area_id?: number | null
          calificacion?: number | null
          creador_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_actividad"] | null
          evaluado_por_id?: string | null
          fecha_completada?: string | null
          fecha_creacion?: string | null
          fecha_evaluada?: string | null
          fecha_limite?: string | null
          id?: never
          observaciones_evaluacion?: string | null
          prioridad?: Database["public"]["Enums"]["prioridad_actividad"] | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area_id?: number | null
          calificacion?: number | null
          creador_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_actividad"] | null
          evaluado_por_id?: string | null
          fecha_completada?: string | null
          fecha_creacion?: string | null
          fecha_evaluada?: string | null
          fecha_limite?: string | null
          id?: never
          observaciones_evaluacion?: string | null
          prioridad?: Database["public"]["Enums"]["prioridad_actividad"] | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          descripcion: string | null
          encargado_id: number | null
          id: number
          nombre: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          encargado_id?: number | null
          id?: number
          nombre?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          encargado_id?: number | null
          id?: number
          nombre?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_encargado_id_fkey"
            columns: ["encargado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      asignacion_actividades: {
        Row: {
          actividad_id: number
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          empleado_id: number
          estado_individual:
            | Database["public"]["Enums"]["estado_individual_actividad"]
            | null
          fecha_asignacion: string | null
          fecha_completada: string | null
          fecha_inicio: string | null
          id: number
          notas_empleado: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actividad_id: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          empleado_id: number
          estado_individual?:
            | Database["public"]["Enums"]["estado_individual_actividad"]
            | null
          fecha_asignacion?: string | null
          fecha_completada?: string | null
          fecha_inicio?: string | null
          id?: never
          notas_empleado?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actividad_id?: number
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          empleado_id?: number
          estado_individual?:
            | Database["public"]["Enums"]["estado_individual_actividad"]
            | null
          fecha_asignacion?: string | null
          fecha_completada?: string | null
          fecha_inicio?: string | null
          id?: never
          notas_empleado?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignacion_actividades_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignacion_actividades_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_rendimiento: {
        Row: {
          autor_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          descripcion: string
          empleado_id: number
          fecha: string | null
          id: number
          tipo: Database["public"]["Enums"]["tipo_comentario"] | null
          titulo: string | null
        }
        Insert: {
          autor_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion: string
          empleado_id: number
          fecha?: string | null
          id?: never
          tipo?: Database["public"]["Enums"]["tipo_comentario"] | null
          titulo?: string | null
        }
        Update: {
          autor_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string
          empleado_id?: number
          fecha?: string | null
          id?: never
          tipo?: Database["public"]["Enums"]["tipo_comentario"] | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_rendimiento_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      empleados: {
        Row: {
          acta_url: string | null
          apellidos: string
          area_id: number | null
          contrato_url: string | null
          created_at: string
          created_by: string | null
          curp: string | null
          deleted_at: string | null
          deleted_by: string | null
          dia_pago: string | null
          estado: string | null
          fecha_baja: string | null
          fecha_ingreso: string | null
          foto_perfil_url: string | null
          id: number
          motivo_baja: string | null
          nombre: string
          rfc: string | null
          rol_id: number
          sueldo_base: number | null
          updated_at: string
          updated_by: string | null
          usuario_id: string | null
        }
        Insert: {
          acta_url?: string | null
          apellidos?: string
          area_id?: number | null
          contrato_url?: string | null
          created_at?: string
          created_by?: string | null
          curp?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dia_pago?: string | null
          estado?: string | null
          fecha_baja?: string | null
          fecha_ingreso?: string | null
          foto_perfil_url?: string | null
          id?: number
          motivo_baja?: string | null
          nombre?: string
          rfc?: string | null
          rol_id: number
          sueldo_base?: number | null
          updated_at?: string
          updated_by?: string | null
          usuario_id?: string | null
        }
        Update: {
          acta_url?: string | null
          apellidos?: string
          area_id?: number | null
          contrato_url?: string | null
          created_at?: string
          created_by?: string | null
          curp?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dia_pago?: string | null
          estado?: string | null
          fecha_baja?: string | null
          fecha_ingreso?: string | null
          foto_perfil_url?: string | null
          id?: number
          motivo_baja?: string | null
          nombre?: string
          rfc?: string | null
          rol_id?: number
          sueldo_base?: number | null
          updated_at?: string
          updated_by?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      permisos: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          modulo: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          modulo?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          modulo?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rol_permisos: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          permiso_id: number
          rol_id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          permiso_id: number
          rol_id: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          permiso_id?: number
          rol_id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rol_permisos_permiso_id_fkey"
            columns: ["permiso_id"]
            isOneToOne: false
            referencedRelation: "permisos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rol_permisos_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          descripcion: string | null
          es_sistema: boolean
          id: number
          nombre: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          es_sistema?: boolean
          id?: number
          nombre: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          descripcion?: string | null
          es_sistema?: boolean
          id?: number
          nombre?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_permission: { Args: { slug_permiso: string }; Returns: boolean }
      check_user_permission: { Args: { target_slug: string }; Returns: boolean }
      get_my_empleado_id: { Args: never; Returns: number }
      get_my_permissions_slugs: { Args: never; Returns: string[] }
      get_user_role_id: { Args: never; Returns: number }
      has_perm: { Args: { p_slug: string }; Returns: boolean }
      has_permission: { Args: { permission_slug: string }; Returns: boolean }
      tieme_permiso: { Args: { slug_requerido: string }; Returns: boolean }
      tiene_permiso: { Args: { permiso_requerido: string }; Returns: boolean }
    }
    Enums: {
      estado_actividad:
        | "pendiente"
        | "en_progreso"
        | "revision"
        | "completada"
        | "explicacion_requerida"
      estado_individual_actividad:
        | "asignada"
        | "en_progreso"
        | "completada"
        | "explicacion_requerida"
        | "revision"
      prioridad_actividad: "alta" | "media" | "baja"
      tipo_comentario: "positivo" | "mejora" | "negativo"
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
  public: {
    Enums: {
      estado_actividad: [
        "pendiente",
        "en_progreso",
        "revision",
        "completada",
        "explicacion_requerida",
      ],
      estado_individual_actividad: [
        "asignada",
        "en_progreso",
        "completada",
        "explicacion_requerida",
        "revision",
      ],
      prioridad_actividad: ["alta", "media", "baja"],
      tipo_comentario: ["positivo", "mejora", "negativo"],
    },
  },
} as const
