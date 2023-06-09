export type User = {
  id: number
  createdAt: Date
  updatedAt: Date
  username: string
  password: string
  name: string
  bio: string | null
  profilePicture: string | null
}