import type { UserRole } from "@/types/auth";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  classId: number | null;
  className: string | null;
}

export interface SchoolClass {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface TeacherAssignment {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
}

export interface DashboardStats {
  users: {
    total: number;
    teachers: number;
    students: number;
  };
  classes: number;
  subjects: number;
  assignments: {
    total: number;
    published: number;
    draft: number;
  };
  submissions: {
    total: number;
    pending: number;
    reviewed: number;
  };
}