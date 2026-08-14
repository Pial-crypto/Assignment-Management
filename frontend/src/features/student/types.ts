export type AssignmentStatus =
  | "Draft"
  | "Published";

export type SubmissionStatus =
  | "Pending"
  | "Reviewed"
  | "Late";

export interface StudentAssignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;

  status: AssignmentStatus;

  classId: number;
  className: string;

  subjectId: number;
  subjectName: string;

  teacherId: number;
  teacherName: string;

  submissionId: number | null;
  submissionStatus: SubmissionStatus | null;
  submittedAt: string | null;
  marks: number | null;
  feedback: string | null;
}

export interface StudentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;

  answer: string;

  submittedAt: string;

  marks: number | null;
  feedback: string | null;

  status: SubmissionStatus;

  deadline: string;
  maxMarks: number;
}