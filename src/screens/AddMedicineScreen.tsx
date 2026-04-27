import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Medicine, TimeOfDay, TIME_LABELS, TIME_DISPLAY, MEDICINE_COLORS } from '../types';
import { addMedicine } from '../storage/storage';

const generateId = (): string =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

const TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export default function AddMedicineScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(['morning']);
  const [selectedColor, setSelectedColor] = useState(MEDICINE_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const toggleTime = (time: TimeOfDay) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter the medicine name.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required', 'Please enter the dosage (e.g. 500mg, 1 tablet).');
      return;
    }
    if (selectedTimes.length === 0) {
      Alert.alert('Required', 'Please select at least one time of day.');
      return;
    }

    setSaving(true);
    try {
      const medicine: Medicine = {
        id: generateId(),
        name: name.trim(),
        dosage: dosage.trim(),
        notes: notes.trim(),
        times: selectedTimes,
        color: selectedColor,
        active: true,
        createdAt: new Date().toISOString(),
      };
      await addMedicine(medicine);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save medicine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Metformin, Aspirin"
              placeholderTextColor="#BDBDBD"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500mg, 1 tablet, 10ml"
              placeholderTextColor="#BDBDBD"
              value={dosage}
              onChangeText={setDosage}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time of Day *</Text>
            <Text style={styles.sublabel}>Select all times you take this medicine</Text>
            <View style={styles.timeGrid}>
              {TIMES.map((time) => {
                const selected = selectedTimes.includes(time);
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, selected && styles.timeChipSelected]}
                    onPress={() => toggleTime(time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeChipText, selected && styles.timeChipTextSelected]}>
                      {TIME_LABELS[time]}
                    </Text>
                    <Text style={[styles.timeChipSub, selected && styles.timeChipSubSelected]}>
                      {TIME_DISPLAY[time]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {MEDICINE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.8}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. Take with food, avoid grapefruit"
              placeholderTextColor="#BDBDBD"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : 'Save Medicine'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sublabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  timeChipTextSelected: {
    color: '#1565C0',
  },
  timeChipSub: {
    fontSize: 11,
    color: '#BDBDBD',
    marginTop: 2,
  },
  timeChipSubSelected: {
    color: '#42A5F5',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
