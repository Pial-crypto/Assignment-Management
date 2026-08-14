import { api } from "@/lib/api";

import type {
  StudentAssignment,
  StudentSubmission,
} from "./types";

export interface CreateSubmissionRequest {
  assignmentId: number;
  answer: string;
}

export interface UpdateSubmissionRequest {
  answer: string;
}


// =========================================================
// GET MY ASSIGNMENTS
// =========================================================

export async function getMyAssignments() {
  console.log("Getting my student assignments...");

  try {
    const response =
      await api.get<StudentAssignment[]>(
        "/student/assignments"
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


// =========================================================
// GET ASSIGNMENT BY ID
// =========================================================

export async function getAssignment(
  id: number
) {
  console.log(
    "Getting student assignment:",
    id
  );

  try {
    const response =
      await api.get<StudentAssignment>(
        `/student/assignments/${id}`
      );

    console.log(
      "Assignment response:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get assignment:",
      id
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


// =========================================================
// GET MY SUBMISSION
// =========================================================

export async function getMySubmission(
  assignmentId: number
) {
  console.log(
    "Getting my submission for assignment:",
    assignmentId
  );

  try {
    const response =
      await api.get<StudentSubmission>(
        `/submissions/assignment/${assignmentId}`
      );

    console.log(
      "My submission response:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get submission for assignment:",
      assignmentId
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


// =========================================================
// CREATE SUBMISSION
// =========================================================

export async function createSubmission(
  data: CreateSubmissionRequest
) {
  console.log("Creating submission...");
  console.log("Request data:", data);

  try {
    const response =
      await api.post<StudentSubmission>(
        "/submissions",
        data
      );

    console.log(
      "Submission created successfully:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to create submission."
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


// =========================================================
// UPDATE SUBMISSION
// =========================================================

export async function updateSubmission(
  id: number,
  data: UpdateSubmissionRequest
) {
  console.log(
    "Updating submission:",
    id
  );

  console.log(
    "Request data:",
    data
  );

  try {
    await api.put(
      `/submissions/${id}`,
      data
    );

    console.log(
      "Submission updated successfully:",
      id
    );
  } catch (error: any) {
    console.error(
      "Failed to update submission:",
      id
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