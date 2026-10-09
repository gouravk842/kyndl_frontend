import { apiRequest } from "@/services/api/client";
import type {
  Testimonial,
  TestimonialInput,
  TestimonialSubmitResult,
} from "@/types/testimonial";

const BASE = "/testimonials";

export const testimonialService = {
  list(limit = 24) {
    return apiRequest<Testimonial[]>({
      method: "GET",
      url: BASE,
      params: { limit },
    });
  },
  submit(input: TestimonialInput) {
    return apiRequest<TestimonialSubmitResult>({
      method: "POST",
      url: BASE,
      data: input,
    });
  },
};
