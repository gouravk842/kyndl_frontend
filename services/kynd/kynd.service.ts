import { apiRequest } from "@/services/api/client";
import type {
  KyndChatHistory,
  KyndChatTurn,
  KyndItem,
  KyndItemInput,
  KyndItemPage,
  KyndPerson,
  KyndPersonInput,
} from "@/types/kynd";

const people = "/kynd/people";

export const kyndService = {
  listPeople() {
    return apiRequest<KyndPerson[]>({ method: "GET", url: people });
  },

  createPerson(input: {
    name: string;
    relationship_type: KyndPerson["relationship_type"];
  }) {
    return apiRequest<KyndPerson>({ method: "POST", url: people, data: input });
  },

  getPerson(id: string) {
    return apiRequest<KyndPerson>({ method: "GET", url: `${people}/${id}` });
  },

  updatePerson(id: string, input: KyndPersonInput) {
    return apiRequest<KyndPerson>({
      method: "PATCH",
      url: `${people}/${id}`,
      data: input,
    });
  },

  deletePerson(id: string) {
    return apiRequest<void>({ method: "DELETE", url: `${people}/${id}` });
  },

  listItems(
    personId: string,
    query: {
      q?: string;
      category?: string;
      cursor?: string;
      limit?: number;
    } = {},
  ) {
    const params: Record<string, string | number> = {};
    if (query.q) params.q = query.q;
    if (query.category) params.category = query.category;
    if (query.cursor) params.cursor = query.cursor;
    if (query.limit) params.limit = query.limit;
    return apiRequest<KyndItemPage>({
      method: "GET",
      url: `${people}/${personId}/items`,
      params,
    });
  },

  createItem(personId: string, input: KyndItemInput) {
    return apiRequest<KyndItem>({
      method: "POST",
      url: `${people}/${personId}/items`,
      data: input,
    });
  },

  updateItem(personId: string, itemId: string, input: KyndItemInput) {
    return apiRequest<KyndItem>({
      method: "PATCH",
      url: `${people}/${personId}/items/${itemId}`,
      data: input,
    });
  },

  deleteItem(personId: string, itemId: string) {
    return apiRequest<void>({
      method: "DELETE",
      url: `${people}/${personId}/items/${itemId}`,
    });
  },

  chat() {
    return apiRequest<KyndChatHistory>({ method: "GET", url: "/kynd/chat" });
  },

  ask(message: string) {
    return apiRequest<KyndChatTurn>({
      method: "POST",
      url: "/kynd/chat",
      data: { message },
    });
  },

  chatPerson(personId: string) {
    return apiRequest<KyndChatHistory>({
      method: "GET",
      url: `${people}/${personId}/chat`,
    });
  },

  askPerson(personId: string, message: string) {
    return apiRequest<KyndChatTurn>({
      method: "POST",
      url: `${people}/${personId}/chat`,
      data: { message },
    });
  },
};
