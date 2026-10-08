export type ArticleBlockType =
  | 'text'
  | 'image'
  | 'gallery'
  | 'quote'
  | 'divider'
  | 'product'
  | 'product-collection';

export type MoodId =
  | 'stars'
  | 'aurora'
  | 'midnight'
  | 'moonlight'
  | 'eclipse'
  | 'nordic';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  data: Record<string, unknown>;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  author: {
    username: string;
    name: string;
  };
  publishedAt: string;
  readingTimeMinutes: number;
  cover?: string;
  mood: MoodId;
  blocks: ArticleBlock[];
}

export interface Channel {
  username: string;
  name: string;
  bio?: string;
  wallpaper?: string;
  mood: MoodId;
  articles: Article[];
}
