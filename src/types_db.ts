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
          generatorId: string
          id: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          generatorId: string
          id: string
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          generatorId?: string
          id?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_generatorId_fkey"
            columns: ["generatorId"]
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
      favoriteSentence: {
        Row: {
          createdAt: string
          id: string
          sentenceNo: number
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          sentenceNo: number
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoriteSentence_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "favoriteSentence_userId_fkey"
            columns: ["userId"]
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
      NativeAudioAttempt: {
        Row: {
          attemptNativeAudio: number | null
          createdAt: string
          id: string
          sentenceNo: number
          userId: string
        }
        Insert: {
          attemptNativeAudio?: number | null
          createdAt?: string
          id: string
          sentenceNo: number
          userId: string
        }
        Update: {
          attemptNativeAudio?: number | null
          createdAt?: string
          id?: string
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "NativeAudioAttempt_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "NativeAudioAttempt_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
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
          attemptQuiz: number | null
          correctCount: number | null
          createdAt: string
          id: string
          kind: string | null
          sentenceNo: number
          userId: string
        }
        Insert: {
          attemptQuiz?: number | null
          correctCount?: number | null
          createdAt?: string
          id: string
          kind?: string | null
          sentenceNo: number
          userId: string
        }
        Update: {
          attemptQuiz?: number | null
          correctCount?: number | null
          createdAt?: string
          id?: string
          kind?: string | null
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuizAttempt_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
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
          attemptCount: number
          createdAt: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Insert: {
          attemptCount: number
          createdAt?: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Update: {
          attemptCount?: number
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
      Teachers: {
        Row: {
          createdAt: string
          email: string
          id: string
          phone: string | null
          realName: string
          status: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          phone?: string | null
          realName: string
          status?: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          phone?: string | null
          realName?: string
          status?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Teachers_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      unitSubject: {
        Row: {
          id: string
          subjectEn: string | null
          subjectKo: string | null
          unitNumber: number | null
          unitUtubeUrl: string | null
        }
        Insert: {
          id: string
          subjectEn?: string | null
          subjectKo?: string | null
          unitNumber?: number | null
          unitUtubeUrl?: string | null
        }
        Update: {
          id?: string
          subjectEn?: string | null
          subjectKo?: string | null
          unitNumber?: number | null
          unitUtubeUrl?: string | null
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
          isApplyForTeacher: boolean
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
          isApplyForTeacher?: boolean
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
          isApplyForTeacher?: boolean
          name?: string | null
          password?: string | null
          phone?: string | null
          realName?: string | null
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
        }
        Relationships: []
      }
      UserNextDay: {
        Row: {
          id: string
          totalCompleted: boolean
          userId: string
          userNextDay: number
        }
        Insert: {
          id: string
          totalCompleted?: boolean
          userId: string
          userNextDay: number
        }
        Update: {
          id?: string
          totalCompleted?: boolean
          userId?: string
          userNextDay?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserNextDay_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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
      YouTubeViewAttempt: {
        Row: {
          duration: number
          id: string
          sentenceNo: number
          userId: string
          viewedAt: string
        }
        Insert: {
          duration?: number
          id: string
          sentenceNo: number
          userId: string
          viewedAt?: string
        }
        Update: {
          duration?: number
          id?: string
          sentenceNo?: number
          userId?: string
          viewedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "YouTubeViewAttempt_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "YouTubeViewAttempt_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      EnrollmentStatus: ["pending", "active", "completed", "dropped"],
      Role: ["admin", "semiAdmin", "teacher", "student"],
    },
  },
} as const
