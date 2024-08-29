import React from "react";
import Svg, { Line } from "react-native-svg";

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
};

type PathLinesProps = {
  path: Section[];
  scale: number;
};

const PathLines: React.FC<PathLinesProps> = ({ path, scale }) => {
  return (
    <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {path.length > 1 &&
        path.map((section, index) => {
          if (index < path.length - 1) {
            const currentSection = section;
            const nextSection = path[index + 1];
            return (
              <Line
                key={`${currentSection.name}-${nextSection.name}`}
                x1={
                  currentSection.coordinates.x * scale +
                  (currentSection.coordinates.width * scale) / 2
                }
                y1={
                  currentSection.coordinates.y * scale +
                  (currentSection.coordinates.height * scale) / 2
                }
                x2={
                  nextSection.coordinates.x * scale +
                  (nextSection.coordinates.width * scale) / 2
                }
                y2={
                  nextSection.coordinates.y * scale +
                  (nextSection.coordinates.height * scale) / 2
                }
                stroke="black"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}
    </Svg>
  );
};

export default PathLines;
