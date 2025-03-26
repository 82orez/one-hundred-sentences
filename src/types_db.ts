export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Account: {
        Row: {
          access_token: string | null
          createdAt: string
          expires_at: number | null
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          refresh_token_expires_in: number | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          updatedAt: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          refresh_token_expires_in?: number | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          updatedAt: string
          userId: string
        }
        Update: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          refresh_token_expires_in?: number | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Assignment: {
        Row: {
          courseId: string
          createdAt: string
          description: string | null
          dueDate: string | null
          id: string
          title: string
          updatedAt: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          description?: string | null
          dueDate?: string | null
          id: string
          title: string
          updatedAt: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          description?: string | null
          dueDate?: string | null
          id?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Assignment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      CompletedSentence: {
        Row: {
          completedAt: string
          id: string
          sentenceNo: number
          userEmail: string | null
          userId: string
        }
        Insert: {
          completedAt?: string
          id: string
          sentenceNo: number
          userEmail?: string | null
          userId: string
        }
        Update: {
          completedAt?: string
          id?: string
          sentenceNo?: number
          userEmail?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CompletedSentence_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "CompletedSentence_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Course: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          teacherId: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          teacherId: string
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          teacherId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_teacherId_fkey"
            columns: ["teacherId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      EmailVerificationToken: {
        Row: {
          createdAt: string
          email: string
          expires: string
          id: string
          token: string
        }
        Insert: {
          createdAt?: string
          email: string
          expires: string
          id: string
          token: string
        }
        Update: {
          createdAt?: string
          email?: string
          expires?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      Enrollment: {
        Row: {
          courseId: string
          createdAt: string
          id: string
          status: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId: string
          updatedAt: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          id: string
          status?: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId: string
          updatedAt: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          id?: string
          status?: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Enrollment_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Lesson: {
        Row: {
          content: string | null
          courseId: string
          createdAt: string
          id: string
          order: number
          title: string
          updatedAt: string
        }
        Insert: {
          content?: string | null
          courseId: string
          createdAt?: string
          id: string
          order: number
          title: string
          updatedAt: string
        }
        Update: {
          content?: string | null
          courseId?: string
          createdAt?: string
          id?: string
          order?: number
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Lesson_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      PasswordResetToken: {
        Row: {
          createdAt: string
          email: string
          expires: string
          id: string
          token: string
        }
        Insert: {
          createdAt?: string
          email: string
          expires: string
          id: string
          token: string
        }
        Update: {
          createdAt?: string
          email?: string
          expires?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      Progress: {
        Row: {
          completed: boolean
          enrollmentId: string
          id: string
          lastAccessed: string | null
          lessonId: string | null
        }
        Insert: {
          completed?: boolean
          enrollmentId: string
          id: string
          lastAccessed?: string | null
          lessonId?: string | null
        }
        Update: {
          completed?: boolean
          enrollmentId?: string
          id?: string
          lastAccessed?: string | null
          lessonId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Progress_enrollmentId_fkey"
            columns: ["enrollmentId"]
            isOneToOne: false
            referencedRelation: "Enrollment"
            referencedColumns: ["id"]
          },
        ]
      }
      Purchase: {
        Row: {
          amount: number
          createdAt: string
          expiresAt: string | null
          id: string
          orderName: string
          paymentId: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          expiresAt?: string | null
          id: string
          orderName: string
          paymentId: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          expiresAt?: string | null
          id?: string
          orderName?: string
          paymentId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Purchase_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      QuizAttempt: {
        Row: {
          attemptedAt: string
          correct: boolean
          id: string
          sentenceId: string
          userId: string
        }
        Insert: {
          attemptedAt?: string
          correct: boolean
          id: string
          sentenceId: string
          userId: string
        }
        Update: {
          attemptedAt?: string
          correct?: boolean
          id?: string
          sentenceId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuizAttempt_sentenceId_fkey"
            columns: ["sentenceId"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "QuizAttempt_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Recordings: {
        Row: {
          atemptCount: number
          createdAt: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Insert: {
          atemptCount?: number
          createdAt?: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Update: {
          atemptCount?: number
          createdAt?: string
          fileUrl?: string
          id?: string
          sentenceNo?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Recordings_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "Recordings_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Sentence: {
        Row: {
          audioUrl: string | null
          en: string
          id: string
          ko: string
          no: number
          utubeUrl: string | null
        }
        Insert: {
          audioUrl?: string | null
          en: string
          id: string
          ko: string
          no: number
          utubeUrl?: string | null
        }
        Update: {
          audioUrl?: string | null
          en?: string
          id?: string
          ko?: string
          no?: number
          utubeUrl?: string | null
        }
        Relationships: []
      }
      Session: {
        Row: {
          createdAt: string
          expires: string
          sessionToken: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expires: string
          sessionToken: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          expires?: string
          sessionToken?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Submission: {
        Row: {
          assignmentId: string
          content: string | null
          feedback: string | null
          fileUrl: string | null
          grade: number | null
          gradedAt: string | null
          id: string
          studentId: string
          submittedAt: string
        }
        Insert: {
          assignmentId: string
          content?: string | null
          feedback?: string | null
          fileUrl?: string | null
          grade?: number | null
          gradedAt?: string | null
          id: string
          studentId: string
          submittedAt?: string
        }
        Update: {
          assignmentId?: string
          content?: string | null
          feedback?: string | null
          fileUrl?: string | null
          grade?: number | null
          gradedAt?: string | null
          id?: string
          studentId?: string
          submittedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Submission_assignmentId_fkey"
            columns: ["assignmentId"]
            isOneToOne: false
            referencedRelation: "Assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submission_studentId_fkey"
            columns: ["studentId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Test: {
        Row: {
          age: number | null
          created_at: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          createdAt: string
          credentials: boolean
          email: string
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          password: string | null
          phone: string | null
          realName: string | null
          role: Database["public"]["Enums"]["Role"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          credentials?: boolean
          email: string
          emailVerified?: string | null
          id: string
          image?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          realName?: string | null
          role?: Database["public"]["Enums"]["Role"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          credentials?: boolean
          email?: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          realName?: string | null
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      EnrollmentStatus: "pending" | "active" | "completed" | "dropped"
      Role: "admin" | "semiAdmin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
