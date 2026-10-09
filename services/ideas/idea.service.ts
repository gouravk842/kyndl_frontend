import { apiRequest } from "@/services/api/client";
import type { IdeaInput, IdeaSubmitResult } from "@/types/idea";

export const ideaService = {
  submit(input: IdeaInput) {
    return apiRequest<IdeaSubmitResult>({
      method: "POST",
      url: "/ideas",
      data: input,
    });
  },
};
