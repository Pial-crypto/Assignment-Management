import { api } from "@/lib/api";

import type {
  TeacherAssignment,
  Assignment,
  Submission,
} from "./types";

export interface CreateAssignmentRequest {
  teacherAssignmentId: number;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
}

export interface UpdateAssignmentRequest {
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
}

export interface ReviewSubmissionRequest {
  marks: number;
  feedback: string | null;
  status: "Pending" | "Reviewed";
}

export async function getMyTeacherAssignments() {
  console.log("Getting teacher assignments...");

  try {
    const response = await api.get<TeacherAssignment[]>(
      "/teacher-assignments/my"
    );

    console.log(
      "Teacher assignments response:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get teacher assignments."
    );

    console.error("Error:", error);

    if (error.response) {
      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Response data:",
        error.response.data
      );

      console.error(
        "Response headers:",
        error.response.headers
      );
    } else if (error.request) {
      console.error(
        "Request was sent but no response was received:",
        error.request
      );
    } else {
      console.error(
        "Request setup error:",
        error.message
      );
    }

    throw error;
  }
}


export async function getMyAssignments() {
  console.log("Getting my assignments...");

  try {
    const response = await api.get<Assignment[]>(
      "/assignments/my"
    );

    console.log(
      "My assignments response:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get my assignments."
    );

    console.error("Error:", error);

    if (error.response) {
      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Response data:",
        error.response.data
      );

      console.error(
        "Response headers:",
        error.response.headers
      );
    } else if (error.request) {
      console.error(
        "Request was sent but no response was received:",
        error.request
      );
    } else {
      console.error(
        "Request setup error:",
        error.message
      );
    }

    throw error;
  }
}

export async function createAssignment(
  data: CreateAssignmentRequest
) {
  console.log("Creating assignment...");
  console.log("Request data:", data);

  try {
    const response = await api.post<Assignment>(
      "/assignments",
      data
    );

    console.log(
      "Assignment created successfully:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to create assignment."
    );

    console.error("Error:", error);

    if (error.response) {
      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Response data:",
        error.response.data
      );

      console.error(
        "Response headers:",
        error.response.headers
      );
    } else if (error.request) {
      console.error(
        "Request was sent but no response was received:",
        error.request
      );
    } else {
      console.error(
        "Request setup error:",
        error.message
      );
    }

    throw error;
  }
}

export async function updateAssignment(
  id: number,
  data: UpdateAssignmentRequest
) {
  await api.put(
    `/assignments/${id}`,
    data
  );
}

export async function deleteAssignment(
  id: number
) {
  await api.delete(
    `/assignments/${id}`
  );
}

export async function publishAssignment(
  id: number
) {
  await api.patch(
    `/assignments/${id}/publish`
  );
}

export async function unpublishAssignment(
  id: number
) {
  await api.patch(
    `/assignments/${id}/unpublish`
  );
}

export async function getAssignmentSubmissions(
  assignmentId: number
) {
  const response =
    await api.get<Submission[]>(
      `/teacher/submissions/assignment/${assignmentId}`
    );

  return response.data;
}

export async function getSubmission(
  id: number
) {
  const response =
    await api.get<Submission>(
      `/teacher/submissions/${id}`
    );

  return response.data;
}

export async function reviewSubmission(
  id: number,
  data: ReviewSubmissionRequest
) {
  await api.patch(
    `/teacher/submissions/${id}/review`,
    data
  );
}