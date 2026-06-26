// Domain types — expand as the domain model is defined
export type Role = "teacher" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}
