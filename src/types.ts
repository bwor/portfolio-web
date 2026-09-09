export interface Profile {
  name: string
  title: string
  summary: string
  skills: string[]
}

export type ProjectStatus = 'published' | 'unpublished'

export interface Project {
  id: string
  title: string
  imageUrl: string
  thumbnailUrl: string
  sortOrder: number
  status: ProjectStatus
  en: string
}
