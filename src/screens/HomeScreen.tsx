import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import SearchBar from '../components/SearchBar';
import storesData from '../data/stores.json';
import storeLayoutData from '../data/storeLayout.json';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [filteredData, setFilteredData] = useState<typeof storesData>(storesData);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleSearch = (query: string) => {
    const filtered = storesData.filter((store) =>
      store.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleQRCodeButtonPress = () => {
    navigation.navigate('QR Scan');
  };

  const handleItemPress = (storeId: string) => {
    console.log(`Clicked store ID: ${storeId}`);
    navigation.navigate('StoreMap', { storeId, mapLayout: storeLayoutData });
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.store_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleItemPress(item.store_id)}
            style={styles.itemContainer}
          >
            <Text style={styles.item}>Store ID: {item.store_id}</Text>
            <Text style={styles.item}>Address: {item.address}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={renderSeparator}
      />
      <Button title="Scan QR Code" onPress={handleQRCodeButtonPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    padding: 10,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default HomeScreen;
