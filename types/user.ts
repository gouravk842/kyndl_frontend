export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_email_verified: boolean;
  linked_providers: string[];
  /** True when the user owns an active vendor shop (gifts marketplace). */
  is_vendor: boolean;
  date_joined: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
}
