import type { IssueReportInput, IssueReportResult } from "@/types/issue";

const REPORTS_PATH = "/api/issues/reports";

/**
 * Submit a human problem report. Uses ``fetch`` (not axios) so crash pages can
 * call it without going through the API interceptor.
 */
export async function submitIssueReport(
  input: IssueReportInput,
): Promise<IssueReportResult> {
  const response = await fetch(REPORTS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });
  const body = (await response
    .json()
    .catch(() => ({}))) as IssueReportResult & {
    detail?: string;
  };
  if (!response.ok) {
    const message =
      typeof body.detail === "string"
        ? body.detail
        : "Could not send that just now.";
    throw new Error(message);
  }
  return body;
}

export const issueService = { submit: submitIssueReport };
