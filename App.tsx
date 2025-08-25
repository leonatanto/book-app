import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Book } from './services/types';
import { searchBooks } from './services/api';
import { getWishlist } from './services/wishlist';
import BookCard from './components/BookCard';

export default function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [wishlistRefresh, setWishlistRefresh] = useState(0);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistBooks, setWishlistBooks] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await getWishlist();
      loadBestsellers();
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const loadBestsellers = async () => {
    setLoading(true);
    try {
      const response = await searchBooks('bestseller');
      setBooks(response.items || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error: ', error);
    }
    setLoading(false);
  };

  const loadWishlistData = async () => {
    try {
      const wishlist = await getWishlist();
      setWishlistBooks(wishlist);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await searchBooks(query.trim());
      setBooks(response.items || []);
    } catch (error) {
      Alert.alert('Error', 'Please try again.');
      console.error('Error:', error);
    }
    
    setLoading(false);
  };

  const handleWishlistChange = useCallback(() => {
    setWishlistRefresh(prev => prev + 1);
    if (showWishlist) {
      loadWishlistData();
    }
  }, [showWishlist]);

  const toggleWishlistView = async () => {
    if (!showWishlist) {
      await loadWishlistData();
    }
    setShowWishlist(!showWishlist);
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <BookCard book={item} onWishlistChange={handleWishlistChange} />
  );

  const renderWishlistItem = ({ item }) => (
    <View style={styles.wishlistItem}>
      <View style={styles.imageContainer}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.wishlistInfo}>
        <Text style={styles.wishlistTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.wishlistAuthors} numberOfLines={1}>
          {item.authors.join(', ')}
        </Text>
        {item.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (showWishlist && wishlistBooks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Empty wishlist</Text>
          <Text style={styles.emptySubText}>Add some books to your wishlist</Text>
        </View>
      );
    }
    
    if (!showWishlist && books.length === 0 && hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found for "{query}"</Text>
          <Text style={styles.emptySubText}>Try with different keywords</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar/>
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {showWishlist ? 'Wishlist' : 'Book Search'}
          </Text>
          <TouchableOpacity 
            style={styles.wishlistButton} 
            onPress={toggleWishlistView}
          >
            <Text style={styles.wishlistButtonText}>
              {showWishlist ? '← Back' : 'Wishlist'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {!showWishlist && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for books"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={styles.loadingText}>Searching</Text>
          </View>
        )}

        <FlatList
          data={showWishlist ? wishlistBooks : books}
          keyExtractor={(item) => showWishlist ? item.id : item.id}
          renderItem={showWishlist ? renderWishlistItem : renderBookItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7ff',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  wishlistButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  wishlistButtonText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'white',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'black',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
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
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  wishlistInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  wishlistAuthors: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: 'orange',
    fontWeight: '600',
  },
});
