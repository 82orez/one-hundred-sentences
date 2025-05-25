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
      Attendance: {
        Row: {
          classDateId: string
          courseId: string
          createdAt: string
          id: string
          isAttended: boolean
          userId: string
        }
        Insert: {
          classDateId: string
          courseId: string
          createdAt?: string
          id: string
          isAttended?: boolean
          userId: string
        }
        Update: {
          classDateId?: string
          courseId?: string
          createdAt?: string
          id?: string
          isAttended?: boolean
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Attendance_classDateId_fkey"
            columns: ["classDateId"]
            isOneToOne: false
            referencedRelation: "ClassDate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Attendance_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Attendance_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ClassDate: {
        Row: {
          courseId: string
          createdAt: string
          date: string
          dayOfWeek: string
          endTime: string | null
          id: string
          startTime: string | null
          updatedAt: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          date: string
          dayOfWeek: string
          endTime?: string | null
          id: string
          startTime?: string | null
          updatedAt: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          date?: string
          dayOfWeek?: string
          endTime?: string | null
          id?: string
          startTime?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ClassDate_courseId_fkey"
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
          courseId: string
          id: string
          sentenceNo: number
          userEmail: string | null
          userId: string
        }
        Insert: {
          completedAt?: string
          courseId: string
          id: string
          sentenceNo: number
          userEmail?: string | null
          userId: string
        }
        Update: {
          completedAt?: string
          courseId?: string
          id?: string
          sentenceNo?: number
          userEmail?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CompletedSentence_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
          classCount: number | null
          contents: Database["public"]["Enums"]["Contents"]
          createdAt: string
          description: string | null
          duration: string | null
          endDate: string | null
          endTime: string | null
          generatorId: string
          id: string
          location: Database["public"]["Enums"]["Location"]
          scheduleFriday: boolean
          scheduleMonday: boolean
          scheduleSaturday: boolean
          scheduleSunday: boolean
          scheduleThursday: boolean
          scheduleTuesday: boolean
          scheduleWednesday: boolean
          startDate: string | null
          startTime: string | null
          teacherId: string
          title: string
          updatedAt: string
        }
        Insert: {
          classCount?: number | null
          contents: Database["public"]["Enums"]["Contents"]
          createdAt?: string
          description?: string | null
          duration?: string | null
          endDate?: string | null
          endTime?: string | null
          generatorId: string
          id: string
          location: Database["public"]["Enums"]["Location"]
          scheduleFriday?: boolean
          scheduleMonday?: boolean
          scheduleSaturday?: boolean
          scheduleSunday?: boolean
          scheduleThursday?: boolean
          scheduleTuesday?: boolean
          scheduleWednesday?: boolean
          startDate?: string | null
          startTime?: string | null
          teacherId: string
          title: string
          updatedAt: string
        }
        Update: {
          classCount?: number | null
          contents?: Database["public"]["Enums"]["Contents"]
          createdAt?: string
          description?: string | null
          duration?: string | null
          endDate?: string | null
          endTime?: string | null
          generatorId?: string
          id?: string
          location?: Database["public"]["Enums"]["Location"]
          scheduleFriday?: boolean
          scheduleMonday?: boolean
          scheduleSaturday?: boolean
          scheduleSunday?: boolean
          scheduleThursday?: boolean
          scheduleTuesday?: boolean
          scheduleWednesday?: boolean
          startDate?: string | null
          startTime?: string | null
          teacherId?: string
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
          {
            foreignKeyName: "Course_teacherId_fkey"
            columns: ["teacherId"]
            isOneToOne: false
            referencedRelation: "Teachers"
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
          centerName: string | null
          courseId: string
          courseTitle: string
          createdAt: string
          description: string | null
          id: string
          localName: string | null
          status: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId: string | null
          studentName: string
          studentPhone: string
          updatedAt: string
        }
        Insert: {
          centerName?: string | null
          courseId: string
          courseTitle: string
          createdAt?: string
          description?: string | null
          id: string
          localName?: string | null
          status?: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId?: string | null
          studentName: string
          studentPhone: string
          updatedAt: string
        }
        Update: {
          centerName?: string | null
          courseId?: string
          courseTitle?: string
          createdAt?: string
          description?: string | null
          id?: string
          localName?: string | null
          status?: Database["public"]["Enums"]["EnrollmentStatus"]
          studentId?: string | null
          studentName?: string
          studentPhone?: string
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
      FavoriteSentence: {
        Row: {
          courseId: string
          createdAt: string
          id: string
          sentenceNo: number
          userId: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          id: string
          sentenceNo: number
          userId: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          id?: string
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FavoriteSentence_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FavoriteSentence_sentenceNo_fkey"
            columns: ["sentenceNo"]
            isOneToOne: false
            referencedRelation: "Sentence"
            referencedColumns: ["no"]
          },
          {
            foreignKeyName: "FavoriteSentence_userId_fkey"
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
          courseId: string
          createdAt: string
          id: string
          sentenceNo: number
          userId: string
        }
        Insert: {
          attemptNativeAudio?: number | null
          courseId: string
          createdAt?: string
          id: string
          sentenceNo: number
          userId: string
        }
        Update: {
          attemptNativeAudio?: number | null
          courseId?: string
          createdAt?: string
          id?: string
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "NativeAudioAttempt_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
          courseId: string
          createdAt: string
          id: string
          kind: string | null
          sentenceNo: number
          userId: string
        }
        Insert: {
          attemptQuiz?: number | null
          correctCount?: number | null
          courseId: string
          createdAt?: string
          id: string
          kind?: string | null
          sentenceNo: number
          userId: string
        }
        Update: {
          attemptQuiz?: number | null
          correctCount?: number | null
          courseId?: string
          createdAt?: string
          id?: string
          kind?: string | null
          sentenceNo?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuizAttempt_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
          courseId: string
          createdAt: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Insert: {
          attemptCount: number
          courseId: string
          createdAt?: string
          fileUrl: string
          id: string
          sentenceNo: number
          updatedAt: string
          userId: string
        }
        Update: {
          attemptCount?: number
          courseId?: string
          createdAt?: string
          fileUrl?: string
          id?: string
          sentenceNo?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Recordings_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
      Selected: {
        Row: {
          id: string
          selectedCourseContents: string | null
          selectedCourseId: string | null
          selectedCourseTitle: string | null
          userId: string
        }
        Insert: {
          id: string
          selectedCourseContents?: string | null
          selectedCourseId?: string | null
          selectedCourseTitle?: string | null
          userId: string
        }
        Update: {
          id?: string
          selectedCourseContents?: string | null
          selectedCourseId?: string | null
          selectedCourseTitle?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Selected_userId_fkey"
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
          contents: Database["public"]["Enums"]["Contents"]
          en: string
          id: string
          ko: string
          no: number
          utubeUrl: string | null
        }
        Insert: {
          audioUrl?: string | null
          contents: Database["public"]["Enums"]["Contents"]
          en: string
          id: string
          ko: string
          no: number
          utubeUrl?: string | null
        }
        Update: {
          audioUrl?: string | null
          contents?: Database["public"]["Enums"]["Contents"]
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
          id: string
          isActive: boolean
          nation: Database["public"]["Enums"]["Nation"]
          nickName: string | null
          subject: Database["public"]["Enums"]["Subject"]
          teacherImgUrl: string | null
          updatedAt: string
          userId: string
          zoomInviteLinkUrl: string | null
        }
        Insert: {
          createdAt?: string
          id: string
          isActive?: boolean
          nation?: Database["public"]["Enums"]["Nation"]
          nickName?: string | null
          subject?: Database["public"]["Enums"]["Subject"]
          teacherImgUrl?: string | null
          updatedAt: string
          userId: string
          zoomInviteLinkUrl?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          isActive?: boolean
          nation?: Database["public"]["Enums"]["Nation"]
          nickName?: string | null
          subject?: Database["public"]["Enums"]["Subject"]
          teacherImgUrl?: string | null
          updatedAt?: string
          userId?: string
          zoomInviteLinkUrl?: string | null
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
      UnitSubject: {
        Row: {
          contents: Database["public"]["Enums"]["Contents"]
          id: string
          subjectEn: string | null
          subjectKo: string
          unitNumber: number
          unitUtubeUrl: string | null
        }
        Insert: {
          contents: Database["public"]["Enums"]["Contents"]
          id: string
          subjectEn?: string | null
          subjectKo: string
          unitNumber: number
          unitUtubeUrl?: string | null
        }
        Update: {
          contents?: Database["public"]["Enums"]["Contents"]
          id?: string
          subjectEn?: string | null
          subjectKo?: string
          unitNumber?: number
          unitUtubeUrl?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          classNickName: string | null
          createdAt: string
          credentials: boolean
          customImageUrl: string | null
          email: string
          emailVerified: string | null
          id: string
          image: string | null
          isApplyForTeacher: boolean
          message: string | null
          name: string | null
          password: string | null
          phone: string | null
          realName: string | null
          role: Database["public"]["Enums"]["Role"]
          updatedAt: string
          zoomInviteUrl: string | null
        }
        Insert: {
          classNickName?: string | null
          createdAt?: string
          credentials?: boolean
          customImageUrl?: string | null
          email: string
          emailVerified?: string | null
          id: string
          image?: string | null
          isApplyForTeacher?: boolean
          message?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          realName?: string | null
          role?: Database["public"]["Enums"]["Role"]
          updatedAt: string
          zoomInviteUrl?: string | null
        }
        Update: {
          classNickName?: string | null
          createdAt?: string
          credentials?: boolean
          customImageUrl?: string | null
          email?: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          isApplyForTeacher?: boolean
          message?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          realName?: string | null
          role?: Database["public"]["Enums"]["Role"]
          updatedAt?: string
          zoomInviteUrl?: string | null
        }
        Relationships: []
      }
      UserCoursePoints: {
        Row: {
          courseId: string
          createdAt: string
          id: string
          points: number
          updatedAt: string
          userId: string
        }
        Insert: {
          courseId: string
          createdAt?: string
          id: string
          points?: number
          updatedAt: string
          userId: string
        }
        Update: {
          courseId?: string
          createdAt?: string
          id?: string
          points?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserCoursePoints_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserCoursePoints_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserNextDay: {
        Row: {
          courseId: string
          id: string
          totalCompleted: boolean
          userId: string
          userNextDay: number
        }
        Insert: {
          courseId: string
          id: string
          totalCompleted?: boolean
          userId: string
          userNextDay: number
        }
        Update: {
          courseId?: string
          id?: string
          totalCompleted?: boolean
          userId?: string
          userNextDay?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserNextDay_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
          courseId: string
          duration: number
          id: string
          sentenceNo: number
          userId: string
          viewedAt: string
        }
        Insert: {
          courseId: string
          duration?: number
          id: string
          sentenceNo: number
          userId: string
          viewedAt?: string
        }
        Update: {
          courseId?: string
          duration?: number
          id?: string
          sentenceNo?: number
          userId?: string
          viewedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "YouTubeViewAttempt_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
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
      Contents: "tour100" | "basic100" | "wh100"
      EnrollmentStatus: "pending" | "active" | "completed" | "dropped"
      Location: "online" | "offline" | "hybrid"
      Nation: "KR" | "PH"
      Role: "admin" | "semiAdmin" | "teacher" | "student"
      Subject: "en" | "ja" | "ko" | "zh"
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
      Contents: ["tour100", "basic100", "wh100"],
      EnrollmentStatus: ["pending", "active", "completed", "dropped"],
      Location: ["online", "offline", "hybrid"],
      Nation: ["KR", "PH"],
      Role: ["admin", "semiAdmin", "teacher", "student"],
      Subject: ["en", "ja", "ko", "zh"],
    },
  },
} as const
