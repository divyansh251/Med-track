import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine, DoseLog, TIME_LABELS, TimeOfDay } from '../types';
import { getMedicines, getLogsForDate, isDoseTaken } from '../storage/storage';
import { getLast7Days, getDateLabel } from '../utils/date';

interface DayStats {
  date: string;
  total: number;
  taken: number;
  logs: DoseLog[];
}

export default function HistoryScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadHistory = async () => {
    const meds = await getMedicines();
    setMedicines(meds);

    const dates = getLast7Days();
    const stats: DayStats[] = await Promise.all(
      dates.map(async (date) => {
        const logs = await getLogsForDate(date);
        let total = 0;
        let taken = 0;

        for (const med of meds.filter((m) => m.active)) {
          for (const time of med.times) {
            total++;
            if (isDoseTaken(logs, med.id, time)) taken++;
          }
        }

        return { date, total, taken, logs };
      })
    );

    setDayStats(stats);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const getStatusColor = (taken: number, total: number): string => {
    if (total === 0) return '#E0E0E0';
    const pct = taken / total;
    if (pct === 1) return '#4CAF50';
    if (pct >= 0.5) return '#FF9800';
    return '#EF5350';
  };

  const renderDayDetail = (stat: DayStats) => {
    const times: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
    return (
      <View style={styles.detail}>
        {medicines
          .filter((m) => m.active)
          .map((med) =>
            med.times.map((time) => {
              const taken = isDoseTaken(stat.logs, med.id, time);
              return (
                <View key={`${med.id}_${time}`} style={styles.detailRow}>
                  <View
                    style={[styles.detailDot, { backgroundColor: med.color }]}
                  />
                  <Text style={styles.detailMed}>
                    {med.name} · {med.dosage}
                  </Text>
                  <Text style={styles.detailTime}>
                    {TIME_LABELS[time]}
                  </Text>
                  {taken ? (
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  ) : (
                    <Ionicons name="close-circle-outline" size={18} color="#EF5350" />
                  )}
                </View>
              );
            })
          )}
      </View>
    );
  };

  const overallTotal = dayStats.reduce((s, d) => s + d.total, 0);
  const overallTaken = dayStats.reduce((s, d) => s + d.taken, 0);
  const overallPct =
    overallTotal > 0 ? Math.round((overallTaken / overallTotal) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {overallTotal > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>7-Day Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{overallTaken}</Text>
                <Text style={styles.summaryLabel}>Taken</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{overallTotal - overallTaken}</Text>
                <Text style={styles.summaryLabel}>Missed</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, styles.summaryPct]}>
                  {overallPct}%
                </Text>
                <Text style={styles.summaryLabel}>Adherence</Text>
              </View>
            </View>
          </View>
        )}

        {dayStats.map((stat) => {
          const pct =
            stat.total > 0
              ? Math.round((stat.taken / stat.total) * 100)
              : null;
          const barColor = getStatusColor(stat.taken, stat.total);
          const isExpanded = expanded === stat.date;

          return (
            <View key={stat.date} style={styles.dayCard}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() =>
                  setExpanded(isExpanded ? null : stat.date)
                }
                activeOpacity={0.7}
              >
                <View style={styles.dayLeft}>
                  <Text style={styles.dayLabel}>{getDateLabel(stat.date)}</Text>
                  <Text style={styles.dayDate}>{stat.date}</Text>
                </View>
                <View style={styles.dayRight}>
                  {stat.total === 0 ? (
                    <Text style={styles.noDoses}>—</Text>
                  ) : (
                    <>
                      <Text style={styles.dayCount}>
                        {stat.taken}/{stat.total}
                      </Text>
                      <View style={styles.barBg}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${pct}%` as any,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.dayPct, { color: barColor }]}>
                        {pct}%
                      </Text>
                    </>
                  )}
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#9E9E9E"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
              {isExpanded && stat.total > 0 && renderDayDetail(stat)}
              {isExpanded && stat.total === 0 && (
                <Text style={styles.noMedsText}>
                  No medicines were scheduled.
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#2196F3',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryPct: {
    fontSize: 26,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dayLeft: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  dayDate: {
    fontSize: 11,
    color: '#BDBDBD',
    marginTop: 1,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayCount: {
    fontSize: 13,
    color: '#757575',
    minWidth: 30,
    textAlign: 'right',
  },
  barBg: {
    width: 80,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  dayPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  noDoses: {
    fontSize: 14,
    color: '#BDBDBD',
  },
  detail: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailMed: {
    flex: 1,
    fontSize: 13,
    color: '#424242',
  },
  detailTime: {
    fontSize: 12,
    color: '#9E9E9E',
    marginRight: 4,
  },
  noMedsText: {
    fontSize: 13,
    color: '#BDBDBD',
    textAlign: 'center',
    padding: 16,
  },
});
