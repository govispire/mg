import { useLocalStorage } from './useLocalStorage';

export interface BookmarkedTest {
  testId: string;
  testName: string;
  examId: string;
  examName: string;
  testType: string;
  category: string;
  addedAt: number;
}

export interface TestPlaylist {
  id: string;
  name: string;
  description?: string;
  tests: BookmarkedTest[];
  createdAt: number;
}

export const useBookmarkedTests = () => {
  const [bookmarkedTests, setBookmarkedTests] = useLocalStorage<BookmarkedTest[]>('bookmarkedTests', []);
  const [playlists, setPlaylists] = useLocalStorage<TestPlaylist[]>('testPlaylists', []);

  const isTestBookmarked = (testId: string) => {
    return bookmarkedTests.some(test => test.testId === testId);
  };

  const toggleBookmark = (test: BookmarkedTest) => {
    if (isTestBookmarked(test.testId)) {
      setBookmarkedTests(bookmarkedTests.filter(t => t.testId !== test.testId));
      return false;
    } else {
      setBookmarkedTests([...bookmarkedTests, { ...test, addedAt: Date.now() }]);
      return true;
    }
  };

  const removeBookmark = (testId: string) => {
    setBookmarkedTests(bookmarkedTests.filter(t => t.testId !== testId));
  };

  const clearAllBookmarks = () => {
    setBookmarkedTests([]);
  };

  // Playlist management
  const createPlaylist = (name: string, description?: string) => {
    const newPlaylist: TestPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      tests: [],
      createdAt: Date.now()
    };
    setPlaylists([...playlists, newPlaylist]);
    return newPlaylist;
  };

  const addTestToPlaylist = (playlistId: string, test: BookmarkedTest) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const testExists = playlist.tests.some(t => t.testId === test.testId);
        if (!testExists) {
          return { ...playlist, tests: [...playlist.tests, test] };
        }
      }
      return playlist;
    }));
  };

  const removeTestFromPlaylist = (playlistId: string, testId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, tests: playlist.tests.filter(t => t.testId !== testId) };
      }
      return playlist;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const getPlaylistsByCategory = (category: string) => {
    return playlists.filter(playlist => 
      playlist.tests.some(test => test.category === category)
    );
  };

  return {
    bookmarkedTests,
    playlists,
    isTestBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    createPlaylist,
    addTestToPlaylist,
    removeTestFromPlaylist,
    deletePlaylist,
    getPlaylistsByCategory
  };
};
