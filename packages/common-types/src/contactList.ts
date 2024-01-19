export type Contact = {
  address: string;
  label?: { label: string; lastModified?: number };
};

export type ContactList = Contact[];

export type PostContacts = {
  contact: string;
  label?: string;
}[];
