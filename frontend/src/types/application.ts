export type ApplicationStatus = 
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export type Application = {
    id: string, 
    companyName: string
    roleTitle: string
    location: string | null
    status: ApplicationStatus 
    appliedDate: string | null 
    notes: string | null
    createdAt: string
    updatedAt: string
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
    "APPLIED",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "GHOSTED"
]

