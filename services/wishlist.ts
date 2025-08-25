import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistBook } from './types';

const WISHLIST_KEY = 'book_wishlist';

// NOTE: using Asyncstorage for save wishlist
export const getWishlist = async (): Promise<WishlistBook[]> => {
  try {
    const wishlistData = await AsyncStorage.getItem(WISHLIST_KEY);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error('Error get wishlist:', error);
    return [];
  }
};

export const addToWishlist = async (book: WishlistBook): Promise<void> => {
  try {
    const currentWishlist = await getWishlist();
    const bookExists = currentWishlist.find(item => item.id === book.id);
    
    if (!bookExists) {
      const updatedWishlist = [...currentWishlist, book];
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
    }
  } catch (error) {
    console.error('Error adding wishlist:', error);
    throw new Error('Failed to add wishlist');
  }
};

export const removeFromWishlist = async (bookId: string): Promise<void> => {
  try {
    const currentWishlist = await getWishlist();
    const updatedWishlist = currentWishlist.filter(book => book.id !== bookId);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
  } catch (error) {
    console.error('Error removing wishlist:', error);
    throw new Error('Failed to remove wishlist');
  }
};

export const isInWishlist = async (bookId: string): Promise<boolean> => {
  try {
    const wishlist = await getWishlist();
    return wishlist.some(book => book.id === bookId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};