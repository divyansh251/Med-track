import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine, TIME_LABELS, TimeOfDay } from '../types';
import { getMedicines, deleteMedicine, saveMedicines } from '../storage/storage';

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const navigation = useNavigation<any>();

  const load = async () => {
    const meds = await getMedicines();
    setMedicines(meds);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleDelete = (medicine: Medicine) => {
    Alert.alert(
      'Delete Medicine',
      `Remove "${medicine.name}" from your list? This will not affect past records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMedicine(medicine.id);
            setMedicines((prev) => prev.filter((m) => m.id !== medicine.id));
          },
        },
      ]
    );
  };

  const handleToggleActive = async (medicine: Medicine) => {
    const updated = medicines.map((m) =>
      m.id === medicine.id ? { ...m, active: !m.active } : m
    );
    setMedicines(updated);
    await saveMedicines(updated);
  };

  const renderMedicine = ({ item }: { item: Medicine }) => {
    const timeLabel = item.times
      .map((t: TimeOfDay) => TIME_LABELS[t])
      .join(', ');

    return (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardMain}>
            <Text style={[styles.name, !item.active && styles.nameInactive]}>
              {item.name}
            </Text>
            <Text style={styles.dosage}>{item.dosage}</Text>
            <Text style={styles.times}>{timeLabel}</Text>
            {item.notes ? (
              <Text style={styles.notes}>{item.notes}</Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleToggleActive(item)}
            >
              <Ionicons
                name={item.active ? 'pause-circle-outline' : 'play-circle-outline'}
                size={26}
                color={item.active ? '#FF9800' : '#4CAF50'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={24} color="#EF5350" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {medicines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="add-circle-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No medicines yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first medicine.
          </Text>
          <TouchableOpacity
            style={styles.addEmptyBtn}
            onPress={() => navigation.navigate('AddMedicine')}
          >
            <Text style={styles.addEmptyBtnText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicine}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddMedicine')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.55,
  },
  colorBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardMain: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  nameInactive: {
    color: '#9E9E9E',
  },
  dosage: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 2,
  },
  times: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
  },
  notes: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 3,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addEmptyBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  addEmptyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
