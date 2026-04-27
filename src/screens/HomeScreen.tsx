import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  Medicine,
  DoseLog,
  TimeOfDay,
  TIME_LABELS,
  TIME_DISPLAY,
  TIME_EMOJI,
} from '../types';
import { getMedicines, getLogsForDate, toggleDose, isDoseTaken } from '../storage/storage';
import { today, formatTodayHeader } from '../utils/date';

interface DoseItem {
  medicine: Medicine;
  time: TimeOfDay;
  taken: boolean;
}

interface TimeGroup {
  time: TimeOfDay;
  doses: DoseItem[];
}

export default function HomeScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [meds, todayLogs] = await Promise.all([
      getMedicines(),
      getLogsForDate(today()),
    ]);
    setMedicines(meds.filter((m) => m.active));
    setLogs(todayLogs);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggle = async (medicine: Medicine, time: TimeOfDay) => {
    const updatedLogs = await toggleDose(today(), medicine.id, time);
    setLogs(updatedLogs);
  };

  const buildTimeGroups = (): TimeGroup[] => {
    const order: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
    const groups: TimeGroup[] = [];

    for (const time of order) {
      const doses: DoseItem[] = medicines
        .filter((m) => m.times.includes(time))
        .map((m) => ({
          medicine: m,
          time,
          taken: isDoseTaken(logs, m.id, time),
        }));

      if (doses.length > 0) {
        groups.push({ time, doses });
      }
    }
    return groups;
  };

  const timeGroups = buildTimeGroups();
  const totalDoses = timeGroups.reduce((sum, g) => sum + g.doses.length, 0);
  const takenDoses = timeGroups.reduce(
    (sum, g) => sum + g.doses.filter((d) => d.taken).length,
    0
  );
  const progress = totalDoses > 0 ? takenDoses / totalDoses : 0;

  const renderDoseCard = (item: DoseItem) => (
    <TouchableOpacity
      key={`${item.medicine.id}_${item.time}`}
      style={[styles.doseCard, item.taken && styles.doseCardTaken]}
      onPress={() => handleToggle(item.medicine, item.time)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorStrip, { backgroundColor: item.medicine.color }]} />
      <View style={styles.doseInfo}>
        <Text style={[styles.medicineName, item.taken && styles.medicineNameTaken]}>
          {item.medicine.name}
        </Text>
        <Text style={styles.dosage}>{item.medicine.dosage}</Text>
        {item.medicine.notes ? (
          <Text style={styles.notes}>{item.medicine.notes}</Text>
        ) : null}
      </View>
      <View style={styles.checkArea}>
        {item.taken ? (
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
        ) : (
          <Ionicons name="ellipse-outline" size={32} color="#BDBDBD" />
        )}
        <Text style={[styles.checkLabel, item.taken && styles.checkLabelTaken]}>
          {item.taken ? 'Taken' : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: TimeGroup }) => (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupEmoji}>{TIME_EMOJI[item.time]}</Text>
        <View>
          <Text style={styles.groupLabel}>{TIME_LABELS[item.time]}</Text>
          <Text style={styles.groupTime}>{TIME_DISPLAY[item.time]}</Text>
        </View>
      </View>
      {item.doses.map(renderDoseCard)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatTodayHeader()}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {totalDoses === 0
              ? 'No medicines scheduled'
              : `${takenDoses} of ${totalDoses} doses taken`}
          </Text>
          {totalDoses > 0 && (
            <Text style={styles.progressPct}>
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
        {totalDoses > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}
      </View>

      {timeGroups.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="medical-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No medicines for today</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Medicines tab to add your medications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={timeGroups}
          keyExtractor={(item) => item.time}
          renderItem={renderGroup}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  group: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  groupTime: {
    fontSize: 12,
    color: '#888',
  },
  doseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  doseCardTaken: {
    opacity: 0.75,
  },
  colorStrip: {
    width: 6,
    alignSelf: 'stretch',
  },
  doseInfo: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  medicineNameTaken: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  dosage: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  notes: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 2,
    fontStyle: 'italic',
  },
  checkArea: {
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 2,
  },
  checkLabel: {
    fontSize: 11,
    color: '#BDBDBD',
  },
  checkLabelTaken: {
    color: '#4CAF50',
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
  },
});
