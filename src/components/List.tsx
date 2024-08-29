import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  FlatList,
  Alert,
} from "react-native";

type Section = {
  name: string;
  color: string;
  coordinates: Coordinates;
};

type Coordinates = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  sections: Section[];
  onPathGenerated: (path: Section[]) => void;
};

const List = ({ visible, onClose, sections, onPathGenerated }: Props) => {
  const [itemList, setItemList] = useState<string[]>([]);
  const [itemInput, setItemInput] = useState<string>("");

  const findSectionByName = (name: string): Section | undefined => {
    return sections.find(
      (section) =>
        section.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const generateMultiStopPath = () => {
    const selectedSections = itemList.map((item) => findSectionByName(item));
    const validSections = selectedSections.filter(
      (section) => section !== undefined
    ) as Section[];

    if (validSections.length !== itemList.length) {
      Alert.alert(
        "Invalid Items",
        "Some items do not correspond to any section. Please check the list."
      );
      return;
    }

    onPathGenerated(validSections);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Items to Buy</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            value={itemInput}
            onChangeText={setItemInput}
          />
          <Button
            title="Add Item"
            onPress={() => {
              if (itemInput.trim()) {
                setItemList([...itemList, itemInput.trim()]);
                setItemInput("");
              }
            }}
          />
          <FlatList
            data={itemList}
            renderItem={({ item }) => (
              <Text style={styles.listItem}>{item}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Button
            title="Generate Multi-Stop Path"
            onPress={generateMultiStopPath}
          />
          <Button
            title="Close"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  listItem: {
    padding: 5,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default List;
