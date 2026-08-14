export type AssignmentStatus =
  | "Draft"
  | "Published";

export type SubmissionStatus =
  | "Pending"
  | "Reviewed"
  | "Late";

export interface TeacherAssignment {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  status: AssignmentStatus;
  teacherAssignmentId: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  answer: string;
  submittedAt: string;
  marks: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  deadline: string;
}