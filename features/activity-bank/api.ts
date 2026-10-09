import { apiRequest } from "@/services/api/client";

import type { ActivityBankCatalog, BankKind } from "./types";

type ApiType = { slug: string; label: string; is_adult: boolean };
type ApiTag = { slug: string; label: string };
type ApiItem = {
  id: number;
  kind: BankKind;
  text: string;
  detail: string;
  type: ApiType;
  tags: ApiTag[];
  image_file_id: string | null;
  image_url: string | null;
  choices: string[];
};
type ApiCatalog = { types: ApiType[]; tags: ApiTag[]; items: ApiItem[] };

export type BankQuery = {
  includeAdult?: boolean;
  kind?: BankKind | "";
  type?: string;
  tags?: string[];
};

export function fetchActivityBank(query: BankQuery) {
  const params = new URLSearchParams();
  if (query.includeAdult) params.set("include_adult", "1");
  if (query.kind) params.set("kind", query.kind);
  if (query.type) params.set("type", query.type);
  for (const tag of query.tags ?? []) params.append("tag", tag);
  const qs = params.toString();
  return apiRequest<ApiCatalog>({
    method: "GET",
    url: qs ? `/activity-bank?${qs}` : "/activity-bank",
  }).then(mapCatalog);
}

function mapCatalog(data: ApiCatalog): ActivityBankCatalog {
  return {
    types: data.types.map((type) => ({
      slug: type.slug,
      label: type.label,
      isAdult: type.is_adult,
    })),
    tags: data.tags.map((tag) => ({ slug: tag.slug, label: tag.label })),
    items: data.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      text: item.text,
      detail: item.detail,
      type: {
        slug: item.type.slug,
        label: item.type.label,
        isAdult: item.type.is_adult,
      },
      tags: item.tags.map((tag) => ({ slug: tag.slug, label: tag.label })),
      imageFileId: item.image_file_id,
      imageUrl: item.image_url,
      choices: item.choices,
    })),
  };
}
