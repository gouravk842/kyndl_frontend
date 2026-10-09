export type IdeaSource =
  | "homepage"
  | "experiences"
  | "gifts"
  | "games"
  | "recommend"
  | "feedback";

export type IdeaInput = {
  display_name: string;
  email: string;
  idea: string;
  source: IdeaSource;
  /** Honeypot. Always empty for real people. */
  company_website: string;
};

export type IdeaSubmitResult = {
  id?: string;
  detail: string;
};
