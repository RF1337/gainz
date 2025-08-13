// app/(tabs)/workouts/[programId]/[workoutId]/new-exercise.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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

export default function NewExerciseScreen() {
  const { ui } = useTheme();
  const { programId, workoutId } = useLocalSearchParams<{
    programId?: string;
    workoutId?: string;
  }>();
  const router = useRouter();

  // State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingExercise, setAddingExercise] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const workoutNum = workoutId ?? null;
  if (workoutNum === null) return null;

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

  const addExerciseToWorkout = async (exercise: Exercise) => {
    setAddingExercise(true);
    
    try {
      const { error } = await supabase
        .from("workout_exercises")
        .insert([{
          default_sets: exercise.recommended_sets || 3,
          default_reps: exercise.recommended_reps_max || 10,
          workout_id: workoutNum,
          order_index: 1, // Calculate next index later
          exercise_id: exercise.id, // Link to the exercise from library
        }]);

      if (error) {
        console.error("Error adding exercise:", error);
        alert(`Could not add exercise: ${error.message}`);
        return;
      }

      // Success - go back to workout
      router.replace(`/workouts/${programId}/${workoutId}`);
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert("Could not add exercise. Please try again.");
    } finally {
      setAddingExercise(false);
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

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: ui.bg, borderColor: ui.border }]}
      onPress={() => addExerciseToWorkout(item)}
      disabled={addingExercise}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseContent}>
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.exerciseImage}
              defaultSource={require('../../../../assets/icons/crown.png')}
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: ui.bgLight }]}>
              <Ionicons name="fitness-outline" size={24} color={ui.textMuted} />
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
            {/* Muscle Group */}
            <View style={[styles.tag, { backgroundColor: ui.primary + '15' }]}>
              <Text style={[styles.tagText, { color: ui.primary }]}>
                {item.primary_muscle_group}
              </Text>
            </View>

            {/* Difficulty */}
            <View style={[styles.tag, { backgroundColor: getDifficultyColor(item.difficulty_level) + '15' }]}>
              <Ionicons 
                name={getDifficultyIcon(item.difficulty_level)} 
                size={10} 
                color={getDifficultyColor(item.difficulty_level)} 
              />
              <Text style={[styles.tagText, { color: getDifficultyColor(item.difficulty_level), marginLeft: 4 }]}>
                {item.difficulty_level}
              </Text>
            </View>
          </View>

          {/* Exercise Stats */}
          <Text style={[styles.statsText, { color: ui.textMuted }]}>
            {item.recommended_sets} sets × {item.recommended_reps_min}-{item.recommended_reps_max} reps
          </Text>
        </View>

        {/* Add Button */}
        <View style={[styles.addButton, { backgroundColor: ui.primary }]}>
          <Ionicons name="add" size={16} color="#ffffff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ui.primary} />
          <Text style={[styles.loadingText, { color: ui.text }]}>
            Loading exercises...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: ui.text }]}>
          Add Exercise
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: ui.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
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
        {renderFilterChip('All', 'all', selectedCategory, setSelectedCategory)}
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

      {/* Loading overlay when adding exercise */}
      {addingExercise && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: ui.bg }]}>
            <ActivityIndicator size="large" color={ui.primary} />
            <Text style={[styles.loadingText, { color: ui.text }]}>
              Adding exercise...
            </Text>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
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
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  exercisesList: {
    padding: 20,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statsText: {
    fontSize: 12,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
});