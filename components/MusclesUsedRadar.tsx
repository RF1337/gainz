import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const size = width - 40;
const center = size / 2;
const levels = 5; // how many rings

const dataPoints = [4, 2, 6, 7, 3]; // e.g. for 5 muscle groups
const labels = ['Chest', 'Back', 'Arms', 'Shoulders', 'Legs'];
const maxValue = 10;

const angleStep = (2 * Math.PI) / labels.length;

const polarToCartesian = (angle: number, radius: number) => ({
  x: center + radius * Math.cos(angle),
  y: center + radius * Math.sin(angle),
});

export default function MuscleRadarChart() {
  // Generate polygon points
  const dataPolygon = dataPoints
    .map((val, i) => {
      const radius = (val / maxValue) * (center - 20);
      const angle = angleStep * i - Math.PI / 2;
      const { x, y } = polarToCartesian(angle, radius);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View>
      <Svg height={size} width={size}>
        {/* Radar Rings */}
        {[...Array(levels)].map((_, levelIndex) => {
          const radius = ((levelIndex + 1) / levels) * (center - 20);
          const points = labels
            .map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const { x, y } = polarToCartesian(angle, radius);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <Polygon
              key={levelIndex}
              points={points}
              stroke="#555"
              strokeWidth={1}
              fill="none"
            />
          );
        })}

        {/* Axes */}
        {labels.map((label, i) => {
          const { x, y } = polarToCartesian(angleStep * i - Math.PI / 2, center - 20);
          return (
            <Line
              key={label}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#999"
              strokeWidth={1}
            />
          );
        })}

        {/* Data Polygon */}
        <Polygon
          points={dataPolygon}
          fill="rgba(0, 128, 255, 0.5)"
          stroke="#007bff"
          strokeWidth={2}
        />

        {/* Labels */}
        {labels.map((label, i) => {
          const { x, y } = polarToCartesian(angleStep * i - Math.PI / 2, center);
          return (
            <SvgText
              key={label}
              x={x}
              y={y}
              fontSize="12"
              fill="white"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}