export interface Profile {
  id: string;
  display_name: string | null;
  studio_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  display_name: string;
  studio_name: string;
}
