export const postTypes = ['paper-notes', 'engineering', 'learning'] as const;

export type PostType = (typeof postTypes)[number];

export type PaperMeta = {
  title?: string;
  authors?: string[];
  venue?: string;
  year?: number;
  url?: string;
};

export type PostLinks = {
  paper?: string;
  repo?: string;
  demo?: string;
};

export type PostData = {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  type: PostType;
  tags: string[];
  draft: boolean;
  cover?: string;
  paper?: PaperMeta;
  links?: PostLinks;
};

export type BlogPost = {
  id: string;
  data: PostData;
};
