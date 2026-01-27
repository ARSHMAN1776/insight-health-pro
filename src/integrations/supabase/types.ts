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
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit_per_hour: number | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist: {
        Row: {
          created_at: string
          department_id: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          notified_at: string | null
          patient_id: string
          preferred_date_end: string | null
          preferred_date_start: string
          preferred_time_slots: Json | null
          priority: string
          reason: string | null
          responded_at: string | null
          response_deadline: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          patient_id: string
          preferred_date_end?: string | null
          preferred_date_start: string
          preferred_time_slots?: Json | null
          priority?: string
          reason?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          patient_id?: string
          preferred_date_end?: string | null
          preferred_date_start?: string
          preferred_time_slots?: Json | null
          priority?: string
          reason?: string | null
          responded_at?: string | null
          response_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_waitlist_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "appointment_waitlist_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
      blood_groups: {
        Row: {
          created_at: string | null
          group_id: string
          group_name: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string
          group_name: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          group_name?: string
        }
        Relationships: []
      }
      blood_issues: {
        Row: {
          blood_group_id: string
          created_at: string | null
          issue_date: string
          issue_id: string
          issued_by: string | null
          notes: string | null
          patient_id: string
          units_given: number
        }
        Insert: {
          blood_group_id: string
          created_at?: string | null
          issue_date?: string
          issue_id?: string
          issued_by?: string | null
          notes?: string | null
          patient_id: string
          units_given: number
        }
        Update: {
          blood_group_id?: string
          created_at?: string | null
          issue_date?: string
          issue_id?: string
          issued_by?: string | null
          notes?: string | null
          patient_id?: string
          units_given?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_issues_blood_group_id_fkey"
            columns: ["blood_group_id"]
            isOneToOne: false
            referencedRelation: "blood_groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "blood_issues_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_stock: {
        Row: {
          blood_group_id: string
          created_at: string | null
          stock_id: string
          total_units: number
          updated_at: string | null
        }
        Insert: {
          blood_group_id: string
          created_at?: string | null
          stock_id?: string
          total_units?: number
          updated_at?: string | null
        }
        Update: {
          blood_group_id?: string
          created_at?: string | null
          stock_id?: string
          total_units?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_stock_blood_group_id_fkey"
            columns: ["blood_group_id"]
            isOneToOne: false
            referencedRelation: "blood_groups"
            referencedColumns: ["group_id"]
          },
        ]
      }
      blood_stock_transactions: {
        Row: {
          blood_group_id: string
          created_at: string | null
          new_balance: number
          notes: string | null
          performed_by: string | null
          previous_balance: number
          reference_id: string | null
          source: string | null
          transaction_id: string
          transaction_type: string
          units: number
        }
        Insert: {
          blood_group_id: string
          created_at?: string | null
          new_balance: number
          notes?: string | null
          performed_by?: string | null
          previous_balance: number
          reference_id?: string | null
          source?: string | null
          transaction_id?: string
          transaction_type: string
          units: number
        }
        Update: {
          blood_group_id?: string
          created_at?: string | null
          new_balance?: number
          notes?: string | null
          performed_by?: string | null
          previous_balance?: number
          reference_id?: string | null
          source?: string | null
          transaction_id?: string
          transaction_type?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_stock_transactions_blood_group_id_fkey"
            columns: ["blood_group_id"]
            isOneToOne: false
            referencedRelation: "blood_groups"
            referencedColumns: ["group_id"]
          },
        ]
      }
      daily_queues: {
        Row: {
          avg_consultation_mins: number | null
          created_at: string | null
          current_token_number: number | null
          department_id: string | null
          doctor_id: string | null
          id: string
          is_active: boolean | null
          queue_date: string
          token_prefix: string | null
          updated_at: string | null
        }
        Insert: {
          avg_consultation_mins?: number | null
          created_at?: string | null
          current_token_number?: number | null
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          queue_date: string
          token_prefix?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_consultation_mins?: number | null
          created_at?: string | null
          current_token_number?: number | null
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          queue_date?: string
          token_prefix?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_queues_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "daily_queues_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_queues_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      department_doctors: {
        Row: {
          assigned_at: string | null
          department_id: string
          doctor_id: string
          id: string
          notes: string | null
          role: string | null
        }
        Insert: {
          assigned_at?: string | null
          department_id: string
          doctor_id: string
          id?: string
          notes?: string | null
          role?: string | null
        }
        Update: {
          assigned_at?: string | null
          department_id?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "department_doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
          {
            foreignKeyName: "departments_department_head_fkey"
            columns: ["department_head"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosis_codes: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string
          id: string
          is_billable: boolean | null
          subcategory: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description: string
          id?: string
          is_billable?: boolean | null
          subcategory?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string
          id?: string
          is_billable?: boolean | null
          subcategory?: string | null
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      donors: {
        Row: {
          blood_group_id: string
          contact: string | null
          created_at: string | null
          donor_id: string
          last_donation_date: string | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          blood_group_id: string
          contact?: string | null
          created_at?: string | null
          donor_id?: string
          last_donation_date?: string | null
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          blood_group_id?: string
          contact?: string | null
          created_at?: string | null
          donor_id?: string
          last_donation_date?: string | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_blood_group_id_fkey"
            columns: ["blood_group_id"]
            isOneToOne: false
            referencedRelation: "blood_groups"
            referencedColumns: ["group_id"]
          },
        ]
      }
      drug_interactions: {
        Row: {
          created_at: string | null
          description: string
          drug_a: string
          drug_b: string
          id: string
          management: string | null
          mechanism: string | null
          severity: string
        }
        Insert: {
          created_at?: string | null
          description: string
          drug_a: string
          drug_b: string
          id?: string
          management?: string | null
          mechanism?: string | null
          severity: string
        }
        Update: {
          created_at?: string | null
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          management?: string | null
          mechanism?: string | null
          severity?: string
        }
        Relationships: []
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
      insurance_claim_items: {
        Row: {
          claim_id: string
          created_at: string | null
          denial_reason: string | null
          diagnosis_code: string | null
          id: string
          procedure_code: string
          procedure_description: string | null
          quantity: number | null
          service_date: string
          status: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          claim_id: string
          created_at?: string | null
          denial_reason?: string | null
          diagnosis_code?: string | null
          id?: string
          procedure_code: string
          procedure_description?: string | null
          quantity?: number | null
          service_date: string
          status?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          claim_id?: string
          created_at?: string | null
          denial_reason?: string | null
          diagnosis_code?: string | null
          id?: string
          procedure_code?: string
          procedure_description?: string | null
          quantity?: number | null
          service_date?: string
          status?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claim_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          appeal_deadline: string | null
          appeal_notes: string | null
          appeal_submitted: boolean | null
          appointment_id: string | null
          approved_amount: number | null
          claim_number: string | null
          created_at: string | null
          denial_code: string | null
          denial_reason: string | null
          diagnosis_codes: string[] | null
          id: string
          insurance_provider: string
          notes: string | null
          patient_id: string
          patient_responsibility: number | null
          policy_number: string
          procedure_codes: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_date: string
          status: string | null
          submission_date: string | null
          submitted_by: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appeal_deadline?: string | null
          appeal_notes?: string | null
          appeal_submitted?: boolean | null
          appointment_id?: string | null
          approved_amount?: number | null
          claim_number?: string | null
          created_at?: string | null
          denial_code?: string | null
          denial_reason?: string | null
          diagnosis_codes?: string[] | null
          id?: string
          insurance_provider: string
          notes?: string | null
          patient_id: string
          patient_responsibility?: number | null
          policy_number: string
          procedure_codes?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_date: string
          status?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          appeal_deadline?: string | null
          appeal_notes?: string | null
          appeal_submitted?: boolean | null
          appointment_id?: string | null
          approved_amount?: number | null
          claim_number?: string | null
          created_at?: string | null
          denial_code?: string | null
          denial_reason?: string | null
          diagnosis_codes?: string[] | null
          id?: string
          insurance_provider?: string
          notes?: string | null
          patient_id?: string
          patient_responsibility?: number | null
          policy_number?: string
          procedure_codes?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_date?: string
          status?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
          reorder_point: number | null
          status: string | null
          supplier: string | null
          supplier_id: string | null
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
          reorder_point?: number | null
          status?: string | null
          supplier?: string | null
          supplier_id?: string | null
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
          reorder_point?: number | null
          status?: string | null
          supplier?: string | null
          supplier_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          comments: string | null
          cost: number | null
          created_at: string | null
          deleted_at: string | null
          doctor_id: string
          id: string
          is_report_finalized: boolean | null
          lab_technician: string | null
          method_used: string | null
          normal_range: string | null
          notes: string | null
          pathologist_signature: string | null
          patient_id: string
          priority: string | null
          report_image_url: string | null
          report_number: string | null
          reporting_time: string | null
          results: string | null
          specimen_collection_time: string | null
          specimen_type: string | null
          status: string | null
          technician_signature: string | null
          test_date: string | null
          test_name: string
          test_parameters: Json | null
          test_type: string | null
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          comments?: string | null
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id: string
          id?: string
          is_report_finalized?: boolean | null
          lab_technician?: string | null
          method_used?: string | null
          normal_range?: string | null
          notes?: string | null
          pathologist_signature?: string | null
          patient_id: string
          priority?: string | null
          report_image_url?: string | null
          report_number?: string | null
          reporting_time?: string | null
          results?: string | null
          specimen_collection_time?: string | null
          specimen_type?: string | null
          status?: string | null
          technician_signature?: string | null
          test_date?: string | null
          test_name: string
          test_parameters?: Json | null
          test_type?: string | null
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          comments?: string | null
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          doctor_id?: string
          id?: string
          is_report_finalized?: boolean | null
          lab_technician?: string | null
          method_used?: string | null
          normal_range?: string | null
          notes?: string | null
          pathologist_signature?: string | null
          patient_id?: string
          priority?: string | null
          report_image_url?: string | null
          report_number?: string | null
          reporting_time?: string | null
          results?: string | null
          specimen_collection_time?: string | null
          specimen_type?: string | null
          status?: string | null
          technician_signature?: string | null
          test_date?: string | null
          test_name?: string
          test_parameters?: Json | null
          test_type?: string | null
          updated_at?: string | null
          verified_by?: string | null
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
            foreignKeyName: "lab_tests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
          deleted_at: string | null
          diagnosis: string | null
          diagnosis_code: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          medications: string | null
          notes: string | null
          patient_id: string
          procedure_codes: string[] | null
          symptoms: string | null
          treatment: string | null
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id: string
          procedure_codes?: string[] | null
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string | null
          visit_date: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          diagnosis?: string | null
          diagnosis_code?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id?: string
          procedure_codes?: string[] | null
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
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
      module_pricing: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enterprise_only: boolean | null
          min_plan_tier: number | null
          module_key: string
          name: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enterprise_only?: boolean | null
          min_plan_tier?: number | null
          module_key: string
          name: string
          price_monthly?: number
          price_yearly?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enterprise_only?: boolean | null
          min_plan_tier?: number | null
          module_key?: string
          name?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
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
      onboarding_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          organization_id: string
          started_at: string | null
          step: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id: string
          started_at?: string | null
          step: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id?: string
          started_at?: string | null
          step?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      organization_members: {
        Row: {
          can_export_data: boolean | null
          can_invite_members: boolean | null
          can_manage_billing: boolean | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_export_data?: boolean | null
          can_invite_members?: boolean | null
          can_manage_billing?: boolean | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id: string
          permissions?: Json | null
          role: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_export_data?: boolean | null
          can_invite_members?: boolean | null
          can_manage_billing?: boolean | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_modules: {
        Row: {
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          module_key: string
          organization_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_key: string
          organization_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_key?: string
          organization_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_api_calls: number | null
          current_patient_count: number | null
          current_period_end: string | null
          current_period_start: string | null
          current_staff_count: number | null
          current_storage_gb: number | null
          discount_code: string | null
          discount_ends_at: string | null
          discount_percentage: number | null
          id: string
          last_invoice_amount: number | null
          last_invoice_date: string | null
          next_invoice_amount: number | null
          next_invoice_date: string | null
          organization_id: string
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_api_calls?: number | null
          current_patient_count?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          current_staff_count?: number | null
          current_storage_gb?: number | null
          discount_code?: string | null
          discount_ends_at?: string | null
          discount_percentage?: number | null
          id?: string
          last_invoice_amount?: number | null
          last_invoice_date?: string | null
          next_invoice_amount?: number | null
          next_invoice_date?: string | null
          organization_id: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_api_calls?: number | null
          current_patient_count?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          current_staff_count?: number | null
          current_storage_gb?: number | null
          discount_code?: string | null
          discount_ends_at?: string | null
          discount_percentage?: number | null
          id?: string
          last_invoice_amount?: number | null
          last_invoice_date?: string | null
          next_invoice_amount?: number | null
          next_invoice_date?: string | null
          organization_id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accreditation_body: string | null
          accreditation_number: string | null
          activated_at: string | null
          address_line1: string | null
          address_line2: string | null
          allowed_ip_ranges: string[] | null
          cancelled_at: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          date_format: string | null
          email: string
          id: string
          legal_name: string | null
          license_number: string | null
          locale: string | null
          logo_url: string | null
          max_patients: number | null
          max_staff: number | null
          max_storage_gb: number | null
          metadata: Json | null
          name: string
          npi_number: string | null
          password_policy: Json | null
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          require_2fa: boolean | null
          secondary_color: string | null
          session_timeout_minutes: number | null
          settings: Json | null
          slug: string
          state_province: string | null
          status: string | null
          suspended_at: string | null
          tax_id: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditation_body?: string | null
          accreditation_number?: string | null
          activated_at?: string | null
          address_line1?: string | null
          address_line2?: string | null
          allowed_ip_ranges?: string[] | null
          cancelled_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          email: string
          id?: string
          legal_name?: string | null
          license_number?: string | null
          locale?: string | null
          logo_url?: string | null
          max_patients?: number | null
          max_staff?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          name: string
          npi_number?: string | null
          password_policy?: Json | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          require_2fa?: boolean | null
          secondary_color?: string | null
          session_timeout_minutes?: number | null
          settings?: Json | null
          slug: string
          state_province?: string | null
          status?: string | null
          suspended_at?: string | null
          tax_id?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditation_body?: string | null
          accreditation_number?: string | null
          activated_at?: string | null
          address_line1?: string | null
          address_line2?: string | null
          allowed_ip_ranges?: string[] | null
          cancelled_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          email?: string
          id?: string
          legal_name?: string | null
          license_number?: string | null
          locale?: string | null
          logo_url?: string | null
          max_patients?: number | null
          max_staff?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          name?: string
          npi_number?: string | null
          password_policy?: Json | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          require_2fa?: boolean | null
          secondary_color?: string | null
          session_timeout_minutes?: number | null
          settings?: Json | null
          slug?: string
          state_province?: string | null
          status?: string | null
          suspended_at?: string | null
          tax_id?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      patient_messages: {
        Row: {
          created_at: string | null
          doctor_id: string
          id: string
          message: string
          patient_id: string
          read: boolean | null
          sender_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          id?: string
          message: string
          patient_id: string
          read?: boolean | null
          sender_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          id?: string
          message?: string
          patient_id?: string
          read?: boolean | null
          sender_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_messages_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_registration_queue: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_registration_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vitals: {
        Row: {
          abnormal_flags: string[] | null
          blood_glucose: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          bmi: number | null
          created_at: string | null
          heart_rate: number | null
          height: number | null
          id: string
          is_abnormal: boolean | null
          notes: string | null
          pain_level: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          respiratory_rate: number | null
          spo2: number | null
          temperature: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          abnormal_flags?: string[] | null
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          created_at?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          is_abnormal?: boolean | null
          notes?: string | null
          pain_level?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          respiratory_rate?: number | null
          spo2?: number | null
          temperature?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          abnormal_flags?: string[] | null
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          created_at?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          is_abnormal?: boolean | null
          notes?: string | null
          pain_level?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          respiratory_rate?: number | null
          spo2?: number | null
          temperature?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string
          deleted_at: string | null
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
          user_id: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth: string
          deleted_at?: string | null
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
          user_id?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string
          deleted_at?: string | null
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
          user_id?: string | null
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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      pharmacy_bill_items: {
        Row: {
          batch_number: string | null
          bill_id: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          inventory_id: string | null
          item_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          bill_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_id?: string | null
          item_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          bill_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_id?: string | null
          item_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_bill_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_bills: {
        Row: {
          bill_number: string
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string | null
          payment_method: string | null
          payment_status: string | null
          prescription_id: string | null
          subtotal: number
          tax_amount: number | null
          tax_percent: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          bill_number: string
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          prescription_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          bill_number?: string
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string | null
          payment_method?: string | null
          payment_status?: string | null
          prescription_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_bills_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      phi_audit_log: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          patient_id: string | null
          performed_by: string
          performer_name: string | null
          performer_role: string | null
          reason: string | null
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          patient_id?: string | null
          performed_by: string
          performer_name?: string | null
          performer_role?: string | null
          reason?: string | null
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          patient_id?: string | null
          performed_by?: string
          performer_name?: string | null
          performer_role?: string | null
          reason?: string | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
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
      prescription_items: {
        Row: {
          created_at: string | null
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medication_name: string
          prescription_id: string
          quantity: number | null
          route: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name: string
          prescription_id: string
          quantity?: number | null
          route?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medication_name?: string
          prescription_id?: string
          quantity?: number | null
          route?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_refill_requests: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          prescription_id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription_id: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_refill_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_refill_requests_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_templates: {
        Row: {
          created_at: string | null
          description: string | null
          diagnosis_category: string | null
          doctor_id: string | null
          id: string
          is_global: boolean | null
          medications: Json
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          diagnosis_category?: string | null
          doctor_id?: string | null
          id?: string
          is_global?: boolean | null
          medications?: Json
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          diagnosis_category?: string | null
          doctor_id?: string | null
          id?: string
          is_global?: boolean | null
          medications?: Json
          template_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          date_prescribed: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
      procedure_codes: {
        Row: {
          base_price: number | null
          category: string | null
          code: string
          created_at: string | null
          description: string
          id: string
          modifier_allowed: boolean | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          code: string
          created_at?: string | null
          description: string
          id?: string
          modifier_allowed?: boolean | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string
          id?: string
          modifier_allowed?: boolean | null
        }
        Relationships: []
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
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          item_name: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          status: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          status?: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          status?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          appointment_id: string | null
          called_at: string | null
          checked_in_at: string | null
          completed_at: string | null
          consultation_started_at: string | null
          created_at: string | null
          created_by: string | null
          entry_type: string | null
          estimated_wait_mins: number | null
          id: string
          notes: string | null
          patient_id: string
          position_in_queue: number | null
          priority: string | null
          queue_id: string
          status: string | null
          symptoms: string | null
          token_number: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          called_at?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          consultation_started_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_type?: string | null
          estimated_wait_mins?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          position_in_queue?: number | null
          priority?: string | null
          queue_id: string
          status?: string | null
          symptoms?: string | null
          token_number: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          called_at?: string | null
          checked_in_at?: string | null
          completed_at?: string | null
          consultation_started_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_type?: string | null
          estimated_wait_mins?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          position_in_queue?: number | null
          priority?: string | null
          queue_id?: string
          status?: string | null
          symptoms?: string | null
          token_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "daily_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          appointment_id: string | null
          clinical_notes: string | null
          completed_at: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          patient_id: string
          reason: string
          receiving_department_id: string | null
          receiving_doctor_id: string | null
          referring_doctor_id: string
          responded_at: string | null
          response_notes: string | null
          status: string
          updated_at: string | null
          urgency: string
        }
        Insert: {
          appointment_id?: string | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          patient_id: string
          reason: string
          receiving_department_id?: string | null
          receiving_doctor_id?: string | null
          referring_doctor_id: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string
        }
        Update: {
          appointment_id?: string | null
          clinical_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          patient_id?: string
          reason?: string
          receiving_department_id?: string | null
          receiving_doctor_id?: string | null
          referring_doctor_id?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string | null
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_receiving_department_id_fkey"
            columns: ["receiving_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "referrals_receiving_doctor_id_fkey"
            columns: ["receiving_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_receiving_doctor_id_fkey"
            columns: ["receiving_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_doctor_id_fkey"
            columns: ["referring_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_doctor_id_fkey"
            columns: ["referring_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
            referencedColumns: ["id"]
          },
        ]
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
      room_assignments: {
        Row: {
          admission_date: string
          admission_reason: string | null
          assigned_by: string | null
          bed_number: number
          created_at: string | null
          discharge_date: string | null
          id: string
          notes: string | null
          patient_id: string
          room_id: string
          status: string
          surgery_id: string | null
          updated_at: string | null
        }
        Insert: {
          admission_date?: string
          admission_reason?: string | null
          assigned_by?: string | null
          bed_number: number
          created_at?: string | null
          discharge_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          room_id: string
          status?: string
          surgery_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_date?: string
          admission_reason?: string | null
          assigned_by?: string | null
          bed_number?: number
          created_at?: string | null
          discharge_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          room_id?: string
          status?: string
          surgery_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_assignments_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
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
      saas_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_handover_patients: {
        Row: {
          bed_number: number | null
          condition_summary: string | null
          created_at: string | null
          handover_id: string
          id: string
          patient_id: string
          pending_medications: string | null
          pending_tests: string | null
          priority: string | null
          room_number: string | null
          special_instructions: string | null
        }
        Insert: {
          bed_number?: number | null
          condition_summary?: string | null
          created_at?: string | null
          handover_id: string
          id?: string
          patient_id: string
          pending_medications?: string | null
          pending_tests?: string | null
          priority?: string | null
          room_number?: string | null
          special_instructions?: string | null
        }
        Update: {
          bed_number?: number | null
          condition_summary?: string | null
          created_at?: string | null
          handover_id?: string
          id?: string
          patient_id?: string
          pending_medications?: string | null
          pending_tests?: string | null
          priority?: string | null
          room_number?: string | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_handover_patients_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "shift_handovers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handover_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_handovers: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          critical_patients: string | null
          equipment_issues: string | null
          general_notes: string | null
          handover_time: string
          id: string
          incoming_nurse_id: string | null
          medication_notes: string | null
          outgoing_nurse_id: string
          pending_tasks: Json | null
          shift_date: string
          shift_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          critical_patients?: string | null
          equipment_issues?: string | null
          general_notes?: string | null
          handover_time?: string
          id?: string
          incoming_nurse_id?: string | null
          medication_notes?: string | null
          outgoing_nurse_id: string
          pending_tasks?: Json | null
          shift_date?: string
          shift_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          critical_patients?: string | null
          equipment_issues?: string | null
          general_notes?: string | null
          handover_time?: string
          id?: string
          incoming_nurse_id?: string | null
          medication_notes?: string | null
          outgoing_nurse_id?: string
          pending_tasks?: Json | null
          shift_date?: string
          shift_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_schedules: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          slot_duration: number | null
          staff_id: string
          staff_type: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          slot_duration?: number | null
          staff_id: string
          staff_type: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          slot_duration?: number | null
          staff_id?: string
          staff_type?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          backup_frequency_hours: number | null
          created_at: string | null
          data_retention_days: number | null
          description: string | null
          display_order: number | null
          features: Json
          hipaa_compliant: boolean | null
          id: string
          integrations: Json | null
          is_active: boolean | null
          is_custom: boolean | null
          is_public: boolean | null
          max_api_calls_per_month: number | null
          max_departments: number | null
          max_patients: number | null
          max_staff: number | null
          max_storage_gb: number | null
          metadata: Json | null
          modules: Json
          name: string
          price_monthly: number | null
          price_yearly: number | null
          setup_fee: number | null
          slug: string
          soc2_compliant: boolean | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          support_level: string | null
          support_response_sla_hours: number | null
          tier: number
          updated_at: string | null
        }
        Insert: {
          backup_frequency_hours?: number | null
          created_at?: string | null
          data_retention_days?: number | null
          description?: string | null
          display_order?: number | null
          features?: Json
          hipaa_compliant?: boolean | null
          id?: string
          integrations?: Json | null
          is_active?: boolean | null
          is_custom?: boolean | null
          is_public?: boolean | null
          max_api_calls_per_month?: number | null
          max_departments?: number | null
          max_patients?: number | null
          max_staff?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          modules?: Json
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          setup_fee?: number | null
          slug: string
          soc2_compliant?: boolean | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          support_level?: string | null
          support_response_sla_hours?: number | null
          tier: number
          updated_at?: string | null
        }
        Update: {
          backup_frequency_hours?: number | null
          created_at?: string | null
          data_retention_days?: number | null
          description?: string | null
          display_order?: number | null
          features?: Json
          hipaa_compliant?: boolean | null
          id?: string
          integrations?: Json | null
          is_active?: boolean | null
          is_custom?: boolean | null
          is_public?: boolean | null
          max_api_calls_per_month?: number | null
          max_departments?: number | null
          max_patients?: number | null
          max_staff?: number | null
          max_storage_gb?: number | null
          metadata?: Json | null
          modules?: Json
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          setup_fee?: number | null
          slug?: string
          soc2_compliant?: boolean | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          support_level?: string | null
          support_response_sla_hours?: number | null
          tier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
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
            foreignKeyName: "surgeries_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors_directory"
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
      usage_metrics: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          organization_id: string
          recorded_at: string | null
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          organization_id: string
          recorded_at?: string | null
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          organization_id?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          organization_id: string
          retry_count: number | null
          secret: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          organization_id: string
          retry_count?: number | null
          secret: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          organization_id?: string
          retry_count?: number | null
          secret?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      doctors_directory: {
        Row: {
          availability_schedule: Json | null
          consultation_fee: number | null
          department: string | null
          department_id: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          specialization: string | null
          status: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          department?: string | null
          department_id?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          specialization?: string | null
          status?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          department?: string | null
          department_id?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          specialization?: string | null
          status?: string | null
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
    }
    Functions: {
      calculate_queue_position:
        | { Args: { _queue_id: string }; Returns: number }
        | { Args: { _priority?: string; _queue_id: string }; Returns: number }
      can_access_organization: {
        Args: { resource_org_id: string }
        Returns: boolean
      }
      doctor_has_patient_relationship: {
        Args: { _doctor_id: string; _patient_id: string }
        Returns: boolean
      }
      estimate_wait_time: {
        Args: { _position: number; _queue_id: string }
        Returns: number
      }
      generate_next_token: { Args: { _queue_id: string }; Returns: string }
      get_doctor_departments: {
        Args: { _doctor_id: string }
        Returns: string[]
      }
      get_doctor_id_for_user: { Args: { _user_id: string }; Returns: string }
      get_or_create_daily_queue: {
        Args: { _department_id?: string; _doctor_id: string }
        Returns: string
      }
      get_patient_id_for_user: { Args: { _user_id: string }; Returns: string }
      get_user_org_role: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_patient_care_relationship: {
        Args: { p_patient_id: string; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_module_enabled: { Args: { module_key: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "patient"
        | "receptionist"
        | "pharmacist"
        | "lab_technician"
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
        "lab_technician",
      ],
    },
  },
} as const
