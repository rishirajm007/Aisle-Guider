import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search... Your Store Here"
        value={searchQuery}
        onChangeText={handleSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});

export default SearchBar;
