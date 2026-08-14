import { api } from "@/lib/api";
import axios from "axios";
import type {
  DashboardStats,
  User,
  SchoolClass,
  Subject,
  TeacherAssignment,
} from "./types";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Teacher" | "Student";
  classId?: number | null;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: "Admin" | "Teacher" | "Student";
  classId?: number | null;
}

export interface CreateClassRequest {
  name: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface CreateTeacherAssignmentRequest {
  teacherId: number;
  classId: number;
  subjectId: number;
}

export async function getDashboardStats() {
  const response =
    await api.get<DashboardStats>(
      "/admin/dashboard"
    );

  return response.data;
}

export async function getUsers() {
  // console.log("Getting users ")
  const response =
    await api.get<User[]>("/users");
    // console.log("The response",response)

  return response.data;
}

export async function createUser(
  data: CreateUserRequest
) {
  console.log("Creating user", data);

  try {
    const response = await api.post<User>(
      "/users",
      data
    );

    console.log("Create user response:", response);

    return response.data;
  } catch (error: any) {
    console.error(
      "CREATE USER ERROR:",
      error.response?.status,
      error.response?.data,
      error.message
    );

    throw error;
  }
}
export async function updateUser(
  id: number,
  data: UpdateUserRequest
) {
  await api.put(`/users/${id}`, data);
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}

export async function getClasses() {
  console.log("Getting all classes")

  const response =
    await api.get<SchoolClass[]>("/classes");
    console.log("Here is all the class",response)

  return response.data;
}

export async function createClass(
  data: CreateClassRequest
) {
  const response =
    await api.post<SchoolClass>(
      "/classes",
      data
    );

  return response.data;
}



export async function deleteClass(id: number) {
  try {
    await api.delete(`/classes/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to delete class.");

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      console.error(
        "Backend message:",
        error.response?.data?.message
      );
    } else {
      console.error(
        "Unexpected error:",
        error
      );
    }

    throw error;
  }
}

export async function getSubjects() {
  const response =
    await api.get<Subject[]>("/subjects");

  return response.data;
}

export async function createSubject(
  data: CreateSubjectRequest
) {
  const response =
    await api.post<Subject>(
      "/subjects",
      data
    );

  return response.data;
}



export async function deleteSubject(id: number) {
  try {
    await api.delete(`/subjects/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Delete subject failed."
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      console.error(
        "Backend message:",
        error.response?.data?.message
      );
    } else {
      console.error(
        "Unexpected error:",
        error
      );
    }

    throw error;
  }
}

export async function getTeacherAssignments() {
  const response =
    await api.get<TeacherAssignment[]>(
      "/teacher-assignments"
    );

  return response.data;
}

export async function createTeacherAssignment(
  data: CreateTeacherAssignmentRequest
) {
  const response =
    await api.post<TeacherAssignment>(
      "/teacher-assignments",
      data
    );

  return response.data;
}

export async function deleteTeacherAssignment(
  id: number
) {
  await api.delete(
    `/teacher-assignments/${id}`
  );
}