export type IssueReportSource = "crash" | "help";

export type IssueReportInput = {
  message: string;
  email?: string;
  page_path?: string;
  request_id?: string;
  digest?: string;
  source: IssueReportSource;
  /** Honeypot. Always empty for real people. */
  company_website?: string;
};

export type IssueReportResult = {
  id?: string;
  detail: string;
};
