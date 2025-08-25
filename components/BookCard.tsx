import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../services/types';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/wishlist';
import StarRating from 'react-native-stars';

interface BookCardProps {
  book: Book;
  onWishlistChange?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onWishlistChange }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const { volumeInfo } = book;
  const title = volumeInfo.title || '';
  const authors = volumeInfo.authors?.join(', ') || '';
  const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
  const rating = volumeInfo.averageRating || 0;

  useEffect(() => {
    checkWishlistStatus();
  }, [book.id]);

  const checkWishlistStatus = async () => {
    const status = await isInWishlist(book.id);
    setInWishlist(status);
  };

  const toggleWishlist = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(book.id);
        setInWishlist(false);
      } else {
        const wishlistBook = {
          id: book.id,
          title,
          authors: volumeInfo.authors || [],
          thumbnail,
          rating,
          addedAt: new Date().toISOString(),
        };
        await addToWishlist(wishlistBook);
        setInWishlist(true);
      }
      onWishlistChange?.();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.authors} numberOfLines={1}>
          {authors}
        </Text>
        
        {rating > 0 && (
          <View style={styles.ratingContainer}>
            <StarRating
              count={5}
              rating={rating}
              editable={false}
            />
            <Text style={styles.ratingText}>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.wishlistButton, inWishlist && styles.wishlistButtonActive]}
          onPress={toggleWishlist}
          disabled={loading}
        >
          <Text style={[styles.wishlistButtonText, inWishlist && styles.wishlistButtonTextActive]}>
            {inWishlist ? 'In Wishlist' : '+ Add to Wishlist'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    marginRight: 16,
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  noImagePlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 8,
    fontWeight: '600',
  },
  wishlistButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  wishlistButtonActive: {
    backgroundColor: 'white',
    borderColor: 'blue',
  },
  wishlistButtonText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '600',
  },
  wishlistButtonTextActive: {
    color: 'blue',
  },
});

export default BookCard;