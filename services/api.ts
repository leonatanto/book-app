import axios from 'axios';
import { GoogleBooksResponse } from './types';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchBooks = async (query: string): Promise<GoogleBooksResponse> => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=20`);
    return response.data;
  } catch (error) {
    console.error('Error: ', error);
    throw new Error('Failed');
  }
};