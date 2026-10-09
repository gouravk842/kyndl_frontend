export type BankKind = "truth" | "dare";

export type BankType = {
  slug: string;
  label: string;
  isAdult: boolean;
};

export type BankTag = {
  slug: string;
  label: string;
};

export type BankItem = {
  id: number;
  kind: BankKind;
  text: string;
  detail: string;
  type: BankType;
  tags: BankTag[];
  imageFileId: string | null;
  imageUrl: string | null;
  choices: string[];
};

export type ActivityBankCatalog = {
  types: BankType[];
  tags: BankTag[];
  items: BankItem[];
};
