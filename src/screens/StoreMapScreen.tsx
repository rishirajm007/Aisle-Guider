import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Animated,
  PanResponder,
} from "react-native";
import Svg, { Line, Defs, Marker, Path } from "react-native-svg";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import List from "../components/List"; // Import the new List component

// Define types for the store map data
type Coordinates = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Section = {
  name: string;
  color: string;
  coordinates: Coordinates;
  count?: number;
};

type PathType = {
  from: string;
  to: string;
  weight: number;
};

type Graph = { [key: string]: { [key: string]: number } };

// Define the route parameters type for this screen
type StoreMapScreenRouteProp = RouteProp<RootStackParamList, "StoreMap">;

type Props = {
  route: StoreMapScreenRouteProp;
};

const StoreMapScreen = ({ route }: Props) => {
  const { mapLayout } = route.params;
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [path, setPath] = useState<Section[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // PanResponder for dragging
  const pan = new Animated.ValueXY();
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, gestureState) => {
      setTranslateX(translateX + gestureState.dx);
      setTranslateY(translateY + gestureState.dy);
      pan.setValue({ x: 0, y: 0 });
    },
  });

  // Helper function to find a section by its name
  const findSectionByName = (name: string): Section | undefined => {
    return mapLayout.sections.find(
      (section: { name: string; }) =>
        section.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Dijkstra's algorithm to find the shortest path
  const findShortestPath = () => {
    const startSection = findSectionByName(startLocation);
    const endSection = findSectionByName(endLocation);

    if (!startSection || !endSection) {
      Alert.alert("Invalid locations", "Please enter valid start and end locations.");
      return;
    }

    // Initialize graph
    const graph: Graph = {};
    mapLayout.sections.forEach((section: Section) => {
      graph[section.name] = {};
    });

    // Validate and build the graph from paths
    if (Array.isArray(mapLayout.paths)) {
      mapLayout.paths.forEach((path: PathType) => {
        if (graph[path.from] && graph[path.to]) {
          graph[path.from][path.to] = path.weight;
          graph[path.to][path.from] = path.weight;
        }
      });
    } else {
      console.error("mapLayout.paths is not defined or is not an array. Value:", mapLayout.paths);
      return;
    }

    // Dijkstra's algorithm implementation
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited: string[] = mapLayout.sections.map((section: { name: any; }) => section.name);

    mapLayout.sections.forEach((section: { name: string | number; }) => {
      distances[section.name] = Infinity;
      previous[section.name] = null;
    });
    distances[startSection.name] = 0;

    while (unvisited.length > 0) {
      const currentSectionName = unvisited.reduce((minName, name) =>
        distances[name] < distances[minName] ? name : minName
      );

      if (distances[currentSectionName] === Infinity) break;

      const currentSectionIndex = unvisited.indexOf(currentSectionName);
      unvisited.splice(currentSectionIndex, 1);

      if (currentSectionName === endSection.name) break;

      Object.keys(graph[currentSectionName]).forEach((neighborName) => {
        const alt = distances[currentSectionName] + graph[currentSectionName][neighborName];
        if (alt < distances[neighborName]) {
          distances[neighborName] = alt;
          previous[neighborName] = currentSectionName;
        }
      });
    }

    // Reconstruct the shortest path
    const shortestPath: Section[] = [];
    let currentSectionName: string | null = endSection.name;

    while (currentSectionName) {
      const section = mapLayout.sections.find(
        (section: { name: string | null; }) => section.name === currentSectionName
      );
      if (section) {
        shortestPath.unshift(section);
      }
      currentSectionName = previous[currentSectionName];
    }

    setPath(shortestPath);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale * 1.2, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale / 1.2, 0.5));
  };

  // Open the modal
  const openModal = () => {
    setModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Update path based on the item list from the modal
  const updatePath = (newPath: Section[]) => {
    setPath(newPath);
  };

  const renderPathSegment = (currentSection: Section, nextSection: Section) => {
    const x1 = (currentSection.coordinates.x + currentSection.coordinates.width / 2) * scale;
    const y1 = (currentSection.coordinates.y + currentSection.coordinates.height / 2) * scale;
    const x2 = (nextSection.coordinates.x + nextSection.coordinates.width / 2) * scale;
    const y2 = (nextSection.coordinates.y + nextSection.coordinates.height / 2) * scale;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const pathSegmentWidth = Math.hypot(x2 - x1, y2 - y1);
    const pathSegmentAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    return (
      <View
        key={`${currentSection.name}-${nextSection.name}`}
        style={{
          position: "absolute",
          width: pathSegmentWidth,
          height: 10 * scale,
          backgroundColor: "#Ff3126",
          top: midY - 5 * scale,
          left: midX - pathSegmentWidth / 2,
          transform: [{ rotate: `${pathSegmentAngle}deg` }],
          zIndex: 1,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Start Location"
          value={startLocation}
          onChangeText={setStartLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="End Location"
          value={endLocation}
          onChangeText={setEndLocation}
        />
        <Button title="Find Path" onPress={findShortestPath} />
        <Button title="Add Other Items" onPress={openModal} />
      </View>

      <List
        visible={modalVisible}
        onClose={closeModal}
        sections={mapLayout.sections}
        onPathGenerated={updatePath}
      />

      <View style={styles.mapContainer}>
        <Animated.View
          style={[
            styles.mapContent,
            {
              transform: [
                { scale },
                { scale: scale },
                { translateX: translateX },
                { translateY: translateY },
              ]
            },
          ]}
          {...panResponder.panHandlers}
        >
          {mapLayout.sections.map((section: { name: any; coordinates: any; color: any; count: any; }) => (
            <View
              key={section.name}
              style={[
                styles.section,
                {
                  position: "absolute",
                  top: section.coordinates.y * scale,
                  left: section.coordinates.x * scale,
                  width: section.coordinates.width * scale,
                  height: section.coordinates.height * scale,
                  backgroundColor: path.includes(section)
                    ? "white"
                    : section.name.toLowerCase() === startLocation.toLowerCase()
                    ? "#B399DD"
                    : section.name.toLowerCase() === endLocation.toLowerCase()
                    ? "#B399DD"
                    : section.color,
                },
              ]}
            >
              <Text style={styles.sectionText}>{section.name}</Text>
              {section.count && (
                <Text style={styles.countText}>Count: {section.count}</Text>
              )}
            </View>
          ))}

          <Svg style={styles.svg}>
            <Defs>
              <Marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto"
              >
                <Path d="M0,0 L0,10 L10,5 z" fill="black" />
              </Marker>
            </Defs>
            </Svg>

            {path.length > 1 &&
            path.map((section, index) => {
              if (index < path.length - 1) {
                return renderPathSegment(section, path[index + 1]);
              }
              return null;
            })}
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[styles.zoomButton, { bottom: 70 }]}
        onPress={handleZoomIn}
      >
        <Text style={styles.zoomButtonText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.zoomButton, { bottom: 20 }]}
        onPress={handleZoomOut}
      >
        <Text style={styles.zoomButtonText}>-</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    elevation: 2, // For Android shadow
  },
  input: {
    height: 40,
    borderColor: "#CFCFC4",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 100, // Add margin to avoid overlapping with the input container
  },
  mapContent: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  section: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 4,
  },
  sectionText: {
    color: "Black",
    fontSize: 20,
    textAlign: "center",
  },
  countText: {
    color: "black",
    fontSize: 10,
    textAlign: "center",
  },
  zoomContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    height: 100,
  },
  zoomButton: {
    position: "absolute",
    right: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 2,
  },
  zoomButtonText: {
    color: "#000",
    fontSize: 24,
  },
  svg: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default StoreMapScreen;
