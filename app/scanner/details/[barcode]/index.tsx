import { Unit, UnitPicker } from '@/components/DropdownUnitPicker';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useFavourite } from '@/hooks/useFavourite';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const UNITS = [
  { short: 'g', full: 'Grams' },
  { short: 'ml', full: 'Millilitres' },
  { short: 'oz', full: 'Ounces' },
];

// Helper til at parse OFF serving_size string (fx "15 g" → { size: 15, unit: "g" })
const parseServingSize = (servingRaw?: string) => {
  if (!servingRaw) return { size: null, unit: null };

  const matchValue = servingRaw.match(/([\d.,]+)/);
  const size = matchValue ? parseFloat(matchValue[1].replace(',', '.')) : null;

  // vi tager første bogstav-sekvens efter tal som enhed
  const matchUnit = servingRaw.match(/([a-zA-Z]+)/g);
  const unit = matchUnit ? matchUnit[matchUnit.length - 1].toLowerCase() : null;

  return { size, unit };
};

export default function DetailsScreen() {
  const { barcode, product } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const { ui } = useTheme();
  const router = useRouter();

  const parsed = JSON.parse(product as string);
  const n = parsed.nutriments || {};

  const [selectedUnit, setSelectedUnit] = useState<Unit>('g');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [foodId, setFoodId] = useState<string | null>(null);

  const getUnitFullName = (shortUnit: string) => {
    const unitObj = UNITS.find(u => u.short === shortUnit);
    return unitObj ? unitObj.full : shortUnit;
  };

  const offHasUnit = (u: string) => {
    const keys = [
      `energy-kcal_100${u}`,
      `proteins_100${u}`,
      `carbohydrates_100${u}`,
      `fat_100${u}`,
    ];
    return keys.some(k => n[k] !== undefined && n[k] !== null);
  };

  const unitOptions = useMemo(() => {
    const opts = UNITS.filter(u => offHasUnit(u.short));
    return opts.length > 0 ? opts : [UNITS[0]];
  }, [n]);

  useEffect(() => {
    if (!unitOptions.find(u => u.short === selectedUnit)) {
      setSelectedUnit(unitOptions[0].short as 'g' | 'ml' | 'oz');
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, [unitOptions, selectedUnit]);

  useEffect(() => {
    if (!barcode) return;
    supabase
      .from('foods')
      .select('id')
      .eq('barcode', barcode)
      .single()
      .then(({ data }) => {
        if (data) setFoodId(data.id);
      });
  }, [barcode]);

  const { isFavourite, toggleFavourite } = useFavourite('food', foodId ?? '', userId ?? '');

  const getValue = (nutrient: string, quantity: number, selectedUnit: string) => {
    const key = `${nutrient}_100${selectedUnit}`;
    if (n[key] !== undefined && n[key] !== null) {
      return (n[key] * quantity) / 100;
    }
    return null;
  };

  const nutritionData = useMemo(() => {
    const quantity = parseFloat(amount) || 0;
    return {
      calories: getValue('energy-kcal', quantity, selectedUnit),
      protein: getValue('proteins', quantity, selectedUnit),
      carbs: getValue('carbohydrates', quantity, selectedUnit),
      fat: getValue('fat', quantity, selectedUnit),
      saturated_fat: getValue('saturated-fat', quantity, selectedUnit),
      sugar: getValue('sugars', quantity, selectedUnit),
      salt: getValue('salt', quantity, selectedUnit),
      sodium: getValue('sodium', quantity, selectedUnit),
      vitamin_c: getValue('vitamin-c', quantity, selectedUnit),
      vitamin_b12: getValue('vitamin-b12', quantity, selectedUnit),
      vitamin_d: getValue('vitamin-d', quantity, selectedUnit),
      vitamin_a: getValue('vitamin-a', quantity, selectedUnit),
      iron: getValue('iron', quantity, selectedUnit),
      magnesium: getValue('magnesium', quantity, selectedUnit),
      calcium: getValue('calcium', quantity, selectedUnit),
      potassium: getValue('potassium', quantity, selectedUnit),
      zinc: getValue('zinc', quantity, selectedUnit),
    };
  }, [amount, selectedUnit, n]);

  const handleInsert = async () => {
    setLoading(true);

    const quantity = parseFloat(amount);
    if (!quantity || quantity <= 0) {
      Alert.alert('Invalid amount');
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) {
      Alert.alert('Login required', 'Please sign in again.');
      setLoading(false);
      return;
    }

    // parse serving size fra OFF
    const { size: servingValue, unit: servingUnit } = parseServingSize(parsed.serving_size);

    // Step 1: Upsert into foods table
    const { data: foodData, error: foodError } = await supabase
      .from('foods')
      .upsert(
        [
          {
            barcode,
            product_name: parsed.product_name || 'Unknown',
            brand: parsed.brands || null,
            category: parsed.categories_tags?.[0] || null,
            image_url: parsed.image_url || null,
            serving_size: servingValue,   // numeric
            serving_unit: servingUnit,    // text
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
            saturated_fat: nutritionData.saturated_fat,
            sugar: nutritionData.sugar,
            salt: nutritionData.salt,
            sodium: nutritionData.sodium,
            vitamin_c: nutritionData.vitamin_c,
            vitamin_b12: nutritionData.vitamin_b12,
            vitamin_d: nutritionData.vitamin_d,
            vitamin_a: nutritionData.vitamin_a,
            iron: nutritionData.iron,
            magnesium: nutritionData.magnesium,
            calcium: nutritionData.calcium,
            potassium: nutritionData.potassium,
            zinc: nutritionData.zinc,
            ingredients: parsed.ingredients_text || null,
            allergens: parsed.allergens_tags || [],
            additives: parsed.additives_tags || [],
            traces: parsed.traces_tags || [],
            raw_data: parsed
          }
        ],
        { onConflict: 'barcode' }
      )
      .select()
      .single();

    if (foodError || !foodData) {
      console.error(foodError);
      Alert.alert('Error', 'Could not save food.');
      setLoading(false);
      return;
    }

    // Step 2: Insert into food_entries
    const { error: entryError } = await supabase.from('food_entries').insert([
      {
        user_id,
        food_id: foodData.id,
        quantity,
        unit: selectedUnit
      }
    ]);

    if (entryError) {
      console.error(entryError);
      Alert.alert('Error', 'Could not add food entry.');
      setLoading(false);
      return;
    }

    router.replace('/scanner');
    setLoading(false);
  };

  const NutritionRow = ({ label, value, unit: nutritionUnit }) => {
    if (value === null) return null;
    return (
      <View style={styles.nutritionRow}>
        <Text style={[styles.nutritionLabel, { color: ui.text }]}>{label}</Text>
        <Text style={[styles.nutritionValue, { color: ui.textMuted }]}>
          {value.toFixed(1)} {nutritionUnit}
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        leftIcon={
          <TouchableOpacity onPress={() => router.push(`/`)}>
            <Ionicons name={"exit-outline"} size={24} color={ui.text} />
          </TouchableOpacity>
        }
        title=""
        rightIcon={
          <TouchableOpacity onPress={toggleFavourite}>
            <Ionicons name={isFavourite ? "heart" : "heart-outline"} size={24} color={isFavourite ? "#ff0000" : ui.text} />
          </TouchableOpacity>
        }
      />

      <Text style={[styles.title, { color: ui.text }]}>
        {parsed.product_name || 'Unknown product'}
      </Text>

      <View style={styles.quantityRow}>
        <TextInput
          style={[styles.input, styles.quantityContainer, { borderColor: ui.border, color: ui.text }]}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor={ui.bgLight}
        />
        <View style={styles.unitContainer}>
          <UnitPicker
            selectedUnit={selectedUnit}
            onUnitChange={setSelectedUnit}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: ui.text }]}>
        Nutrition for {amount} {getUnitFullName(selectedUnit)}
      </Text>

      <View style={[styles.nutritionTable, { backgroundColor: ui?.bgLight ?? '#f8f8f8', borderColor: ui.border }]}>
        <View style={styles.section}>
          <NutritionRow label="Calories" value={nutritionData.calories} unit="kcal" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Protein" value={nutritionData.protein} unit="g" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Carbohydrates" value={nutritionData.carbs} unit="g" />
          <NutritionRow label="Sugar" value={nutritionData.sugar} unit="g" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Fat" value={nutritionData.fat} unit="g" />
          <NutritionRow label="Saturated fat" value={nutritionData.saturated_fat} unit="g" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Salt" value={nutritionData.salt} unit="g" />
          <NutritionRow label="Sodium" value={nutritionData.sodium} unit="mg" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Vitamin C" value={nutritionData.vitamin_c} unit="mg" />
          <NutritionRow label="Vitamin B12" value={nutritionData.vitamin_b12} unit="μg" />
          <NutritionRow label="Vitamin D" value={nutritionData.vitamin_d} unit="μg" />
          <NutritionRow label="Vitamin A" value={nutritionData.vitamin_a} unit="μg" />
        </View>
        <View style={styles.section}>
          <NutritionRow label="Iron" value={nutritionData.iron} unit="mg" />
          <NutritionRow label="Magnesium" value={nutritionData.magnesium} unit="mg" />
          <NutritionRow label="Calcium" value={nutritionData.calcium} unit="mg" />
          <NutritionRow label="Potassium" value={nutritionData.potassium} unit="mg" />
          <NutritionRow label="Zinc" value={nutritionData.zinc} unit="mg" />
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#29e329" }]} onPress={handleInsert} disabled={loading}>
        <Text style={[styles.buttonText, { color: loading ? ui.bgLight : '#fff' }]}>
          {loading ? 'Adding...' : 'Add Food'}
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6 },
  button: { marginTop: 20, width: '100%', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16 },
  quantityRow: { flexDirection: 'row', gap: '2%', alignItems: 'center', width: '100%', marginBottom: 20 },
  quantityContainer: { width: '25%', padding: 12 },
  unitContainer: { width: '73%', position: 'relative' },
  unitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 1 },
  unitButtonText: { fontSize: 16, fontWeight: '500' },
  pickerContainer: { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 1000, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  nutritionTable: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  section: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 4 },
  nutritionLabel: { fontSize: 14, flex: 1 },
  nutritionValue: { fontSize: 14, fontWeight: '500', textAlign: 'right' },
});