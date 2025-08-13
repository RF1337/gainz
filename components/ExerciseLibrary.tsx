// components/ExerciseLibrary.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category_name: string;
  primary_muscle_name: string;
  primary_muscle_group: string;
  equipment_name: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  rest_time_seconds: number;
  recommended_sets: number;
  recommended_reps_min: number;
  recommended_reps_max: number;
  image_url?: string;
  gif_url?: string;
  video_url?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface EquipmentType {
  id: string;
  name: string;
  description: string;
}

interface MuscleGroup {
  muscle_group: string;
}

export default function ExerciseLibrary() {
  const { ui } = useTheme();
  const { t } = useTranslation();
  
  // State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Filter exercises when filters change
  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, selectedEquipment, selectedMuscleGroup, selectedDifficulty]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories, equipment types, muscle groups, and exercises
      const [categoriesResult, equipmentResult, muscleGroupsResult, exercisesResult] = await Promise.all([
        supabase.from('exercise_categories').select('*').order('name'),
        supabase.from('equipment_types').select('*').order('name'),
        supabase.from('exercises_full').select('primary_muscle_group').order('primary_muscle_group'),
        supabase.from('exercises_full').select('*').order('name')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (equipmentResult.error) throw equipmentResult.error;
      if (muscleGroupsResult.error) throw muscleGroupsResult.error;
      if (exercisesResult.error) throw exercisesResult.error;

      // Get unique muscle groups
      const uniqueMuscleGroups = [...new Set(
        muscleGroupsResult.data
          ?.map(item => item.primary_muscle_group)
          .filter(Boolean) || []
      )].map(group => ({ muscle_group: group }));

      setCategories(categoriesResult.data || []);
      setEquipmentTypes(equipmentResult.data || []);
      setMuscleGroups(uniqueMuscleGroups);
      setExercises(exercisesResult.data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = async () => {
    try {
      let query = supabase.from('exercises_full').select('*');

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category_name', selectedCategory);
      }
      
      if (selectedEquipment !== 'all') {
        query = query.eq('equipment_name', selectedEquipment);
      }
      
      if (selectedMuscleGroup !== 'all') {
        query = query.eq('primary_muscle_group', selectedMuscleGroup);
      }
      
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply search
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error filtering exercises:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#27AE60';
      case 'intermediate': return '#F39C12';
      case 'advanced': return '#E74C3C';
      default: return ui.textMuted;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'star-outline';
      case 'intermediate': return 'star-half-outline';
      case 'advanced': return 'star';
      default: return 'help-outline';
    }
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: ui.bg, borderColor: ui.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseContent}>
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.exerciseImage}
              defaultSource={require('../assets/icons/crown.png')}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: ui.bgLight }]}>
              <Ionicons name="fitness-outline" size={32} color={ui.textMuted} />
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: ui.text }]}>
            {item.name}
          </Text>
          
          <Text style={[styles.exerciseDescription, { color: ui.textMuted }]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Tags Row */}
          <View style={styles.tagsRow}>
            {/* Category */}
            <View style={[styles.tag, { backgroundColor: ui.primary + '15' }]}>
              <Text style={[styles.tagText, { color: ui.primary }]}>
                {item.category_name}
              </Text>
            </View>

            {/* Muscle Group */}
            <View style={[styles.tag, { backgroundColor: ui.bgDark }]}>
              <Text style={[styles.tagText, { color: ui.textMuted }]}>
                {item.primary_muscle_group}
              </Text>
            </View>

            {/* Difficulty */}
            <View style={[styles.tag, { backgroundColor: getDifficultyColor(item.difficulty_level) + '15' }]}>
              <Ionicons 
                name={getDifficultyIcon(item.difficulty_level)} 
                size={12} 
                color={getDifficultyColor(item.difficulty_level)} 
              />
              <Text style={[styles.tagText, { color: getDifficultyColor(item.difficulty_level), marginLeft: 4 }]}>
                {item.difficulty_level}
              </Text>
            </View>
          </View>

          {/* Exercise Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="repeat-outline" size={14} color={ui.textMuted} />
              <Text style={[styles.statText, { color: ui.textMuted }]}>
                {item.recommended_sets} sets
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={14} color={ui.textMuted} />
              <Text style={[styles.statText, { color: ui.textMuted }]}>
                {item.recommended_reps_min}-{item.recommended_reps_max} reps
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="hardware-chip-outline" size={14} color={ui.textMuted} />
              <Text style={[styles.statText, { color: ui.textMuted }]}>
                {item.equipment_name}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: ui.primary }]}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChip = (
    title: string, 
    value: string, 
    selectedValue: string, 
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: selectedValue === value ? ui.primary : ui.bgLight,
          borderColor: selectedValue === value ? ui.primary : ui.border,
        }
      ]}
      onPress={() => onSelect(value)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: selectedValue === value ? '#ffffff' : ui.text }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: ui.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ui.primary} />
          <Text style={[styles.loadingText, { color: ui.text }]}>
            Loading exercises...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ui.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: ui.border }]}>
        <Text style={[styles.headerTitle, { color: ui.text }]}>
          Exercise Library
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: ui.bgLight }]}>
        <Ionicons name="search" size={20} color={ui.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: ui.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={ui.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={ui.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {/* Category Filter */}
        {renderFilterChip('All Categories', 'all', selectedCategory, setSelectedCategory)}
        {categories.map(category => 
          renderFilterChip(
            category.name.charAt(0).toUpperCase() + category.name.slice(1), 
            category.name, 
            selectedCategory, 
            setSelectedCategory
          )
        )}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {/* Muscle Group Filter */}
        {renderFilterChip('All Muscles', 'all', selectedMuscleGroup, setSelectedMuscleGroup)}
        {muscleGroups.map(muscleGroup => 
          renderFilterChip(
            muscleGroup.muscle_group.charAt(0).toUpperCase() + muscleGroup.muscle_group.slice(1), 
            muscleGroup.muscle_group, 
            selectedMuscleGroup, 
            setSelectedMuscleGroup
          )
        )}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {/* Equipment Filter */}
        {renderFilterChip('All Equipment', 'all', selectedEquipment, setSelectedEquipment)}
        {equipmentTypes.map(equipment => 
          renderFilterChip(
            equipment.name.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '), 
            equipment.name, 
            selectedEquipment, 
            setSelectedEquipment
          )
        )}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {/* Difficulty Filter */}
        {renderFilterChip('All Levels', 'all', selectedDifficulty, setSelectedDifficulty)}
        {['beginner', 'intermediate', 'advanced'].map(difficulty => 
          renderFilterChip(
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1), 
            difficulty, 
            selectedDifficulty, 
            setSelectedDifficulty
          )
        )}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: ui.textMuted }]}>
          {exercises.length} exercises found
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exercisesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={ui.textMuted} />
            <Text style={[styles.emptyText, { color: ui.text }]}>
              No exercises found
            </Text>
            <Text style={[styles.emptySubtext, { color: ui.textMuted }]}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  exercisesList: {
    padding: 20,
  },
  exerciseCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  exerciseContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    marginRight: 16,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});