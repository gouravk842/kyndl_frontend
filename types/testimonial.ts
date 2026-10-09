export type Testimonial = {
  id: string;
  display_name: string;
  rating: number;
  comment: string;
  experience_slug: string;
  experience_name: string;
  created_at: string;
};

export type TestimonialInput = {
  display_name: string;
  rating: number;
  comment: string;
  experience_slug: string;
  experience_name: string;
};

export type TestimonialSubmitResult = {
  id: string;
  detail: string;
  status: string;
};
