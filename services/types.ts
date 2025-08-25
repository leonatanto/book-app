export interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    categories?: string[];
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items: Book[];
}

export interface WishlistBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  rating?: number;
  addedAt: string;
}