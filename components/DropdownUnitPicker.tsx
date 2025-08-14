import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

// Unit types
export type Unit = 'g' | 'oz' | 'ml';


interface UnitPickerProps {
  selectedUnit: Unit;
  onUnitChange: (unit: Unit) => void;
  style?: any;
}

export function UnitPicker({ selectedUnit, onUnitChange, style }: UnitPickerProps) {
  const unitLabels = {
    g: 'Grams (g)',
    oz: 'Ounces (oz)', 
    ml: 'Millilitres (ml)'
  };

  const { ui } = useTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Pressable style={[style]}>
          <Text style={{fontSize: 16, fontWeight: '600', color: ui.textMuted}}>
            {unitLabels[selectedUnit]} <Ionicons name="chevron-down" size={16} color={ui.textMuted} />
          </Text>
        </Pressable>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item key='g' onSelect={() => onUnitChange('g')}>
          <DropdownMenu.ItemTitle>Grams (g)</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>

        <DropdownMenu.Item key='oz' onSelect={() => onUnitChange('oz')}>
          <DropdownMenu.ItemTitle>Ounces (oz)</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>

        <DropdownMenu.Item key='ml' onSelect={() => onUnitChange('ml')}>
          <DropdownMenu.ItemTitle>Millilitres (ml)</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const styles = StyleSheet.create({

  selectedText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});