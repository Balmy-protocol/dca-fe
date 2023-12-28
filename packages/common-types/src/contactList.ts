export type Contact = {
  address: string;
  label?: string;
};

export type ContactList = Contact[];

export type PostContacts = {
  contacts: {
    contact: string;
    label?: string;
  }[];
};
