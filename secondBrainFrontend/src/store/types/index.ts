export interface User {
  id: string;
  username: string;
}

export interface Tag {
  _id: string;
  tag: string;
}

export interface Content {
  _id: string;
  type: "twitter" | "youtube" | "article" | "note";
  link?: string;
  description: string;
  title: string;
  tags: Tag[];
  userId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ContentState {
  contents: Content[];
  selectedContent: Content | null;
  loading: boolean;
  error: string | null;
  filter: "all" | "twitter" | "youtube" | "article" | "note";
}

export interface UIState {
  modals: {
    createContent: boolean;
    share: boolean;
  };
  shareLink: string | null;
  selectedNote: {
    _id: string;
    title: string;
    description: string;
    tags: string[];
  } | null;
}
