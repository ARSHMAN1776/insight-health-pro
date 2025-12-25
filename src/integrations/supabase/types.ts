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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string | null
          department_id: string | null
          doctor_id: string
          duration: number | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          symptoms: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string | null
          department_id?: string | null
          doctor_id: string
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          symptoms?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string | null
          department_id?: string | null
          doctor_id?: string
          duration?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          symptoms?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          department_head: string | null
          department_id: string
          department_name: string
          description: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_head?: string | null
          department_id?: string
          department_name: string
          description?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_head?: string | null
          department_id?: string
          department_name?: string
          description?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_department_head_fkey"
            columns: ["department_head"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_schedule: Json | null
          consultation_fee: number | null
          created_at: string | null
          department: string | null
          department_id: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          license_number: string
          phone: string | null
          specialization: string
          status: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          license_number: string
          phone?: string | null
          specialization: string
          status?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string
          phone?: string | null
          specialization?: string
          status?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      hospital_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_category?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_number: string | null
          category: string | null
          created_at: string | null
          current_stock: number
          expiry_date: string | null
          id: string
          item_name: string
          last_restocked: string | null
          location: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          status: string | null
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number
          expiry_date?: string | null
          id?: string
          item_name: string
          last_restocked?: string | null
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          status?: string | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number
          expiry_date?: string | null
          id?: string
          item_name?: string
          last_restocked?: string | null
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          status?: string | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          cost: number | null
          created_at: string | null
          doctor_id: string
          id: string
          lab_technician: string | null
          normal_range: string | null
          notes: string | null
          patient_id: string
          priority: string | null
          report_image_url: string | null
          results: string | null
          status: string | null
          test_date: string | null
          test_name: string
          test_type: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          doctor_id: string
          id?: string
          lab_technician?: string | null
          normal_range?: string | null
          notes?: string | null
          patient_id: string
          priority?: string | null
          report_image_url?: string | null
          results?: string | null
          status?: string | null
          test_date?: string | null
          test_name: string
          test_type?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          lab_technician?: string | null
          normal_range?: string | null
          notes?: string | null
          patient_id?: string
          priority?: string | null
          report_image_url?: string | null
          results?: string | null
          status?: string | null
          test_date?: string | null
          test_name?: string
          test_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          medications: string | null
          notes: string | null
          patient_id: string
          symptoms: string | null
          treatment: string | null
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id: string
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string | null
          visit_date: string
        }
        Update: {
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id?: string
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string
          read: boolean
          sent_via_email: boolean | null
          sent_via_push: boolean | null
          sent_via_sms: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string
          read?: boolean
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          sent_via_sms?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          read?: boolean
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          sent_via_sms?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nurses: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          license_number: string
          phone: string | null
          shift_schedule: string | null
          specialization: string | null
          status: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          license_number: string
          phone?: string | null
          shift_schedule?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string
          phone?: string | null
          shift_schedule?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      operation_theatres: {
        Row: {
          created_at: string | null
          equipment: string[] | null
          floor: number | null
          id: string
          notes: string | null
          ot_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment?: string[] | null
          floor?: number | null
          id?: string
          notes?: string | null
          ot_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment?: string[] | null
          floor?: number | null
          id?: string
          notes?: string | null
          ot_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          medical_history: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth: string
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          medical_history?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          medical_history?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          invoice_number: string | null
          patient_id: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          patient_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          patient_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      post_operation: {
        Row: {
          complications: string | null
          created_at: string | null
          discharge_status: string
          follow_up_date: string | null
          id: string
          medication_notes: string | null
          recovery_notes: string | null
          surgery_id: string
          updated_at: string | null
          vital_signs: Json | null
        }
        Insert: {
          complications?: string | null
          created_at?: string | null
          discharge_status?: string
          follow_up_date?: string | null
          id?: string
          medication_notes?: string | null
          recovery_notes?: string | null
          surgery_id: string
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Update: {
          complications?: string | null
          created_at?: string | null
          discharge_status?: string
          follow_up_date?: string | null
          id?: string
          medication_notes?: string | null
          recovery_notes?: string | null
          surgery_id?: string
          updated_at?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_operation_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          date_prescribed: string | null
          doctor_id: string
          dosage: string | null
          drug_interactions: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          quantity: number | null
          side_effects: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_prescribed?: string | null
          doctor_id: string
          dosage?: string | null
          drug_interactions?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          quantity?: number | null
          side_effects?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_prescribed?: string | null
          doctor_id?: string
          dosage?: string | null
          drug_interactions?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          quantity?: number | null
          side_effects?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          phone: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          first_name: string
          id: string
          last_name: string
          license_number?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          recurring: boolean | null
          recurring_pattern: string | null
          related_id: string | null
          related_table: string | null
          reminder_time: string
          reminder_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          recurring?: boolean | null
          recurring_pattern?: string | null
          related_id?: string | null
          related_table?: string | null
          reminder_time: string
          reminder_type: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          recurring?: boolean | null
          recurring_pattern?: string | null
          related_id?: string | null
          related_table?: string | null
          reminder_time?: string
          reminder_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string | null
          current_occupancy: number | null
          daily_rate: number | null
          department: string | null
          floor: number | null
          id: string
          notes: string | null
          room_number: string
          room_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          current_occupancy?: number | null
          daily_rate?: number | null
          department?: string | null
          floor?: number | null
          id?: string
          notes?: string | null
          room_number: string
          room_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          current_occupancy?: number | null
          daily_rate?: number | null
          department?: string | null
          floor?: number | null
          id?: string
          notes?: string | null
          room_number?: string
          room_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      surgeries: {
        Row: {
          created_at: string | null
          doctor_id: string
          end_time: string
          id: string
          notes: string | null
          ot_id: string
          patient_id: string
          priority: string | null
          start_time: string
          status: string
          surgery_date: string
          surgery_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          end_time: string
          id?: string
          notes?: string | null
          ot_id: string
          patient_id: string
          priority?: string | null
          start_time: string
          status?: string
          surgery_date: string
          surgery_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          ot_id?: string
          patient_id?: string
          priority?: string | null
          start_time?: string
          status?: string
          surgery_date?: string
          surgery_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_ot_id_fkey"
            columns: ["ot_id"]
            isOneToOne: false
            referencedRelation: "operation_theatres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_team: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          role: string
          staff_name: string
          surgery_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          role: string
          staff_name: string
          surgery_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          role?: string
          staff_name?: string
          surgery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgery_team_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "patient"
        | "receptionist"
        | "pharmacist"
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
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "patient",
        "receptionist",
        "pharmacist",
      ],
    },
  },
} as const
