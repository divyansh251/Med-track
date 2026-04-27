import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, DoseLog, TimeOfDay } from '../types';

const MEDICINES_KEY = '@med_track:medicines';
const LOGS_PREFIX = '@med_track:logs:';

export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const json = await AsyncStorage.getItem(MEDICINES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveMedicines = async (medicines: Medicine[]): Promise<void> => {
  await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
};

export const addMedicine = async (medicine: Medicine): Promise<void> => {
  const medicines = await getMedicines();
  medicines.push(medicine);
  await saveMedicines(medicines);
};

export const deleteMedicine = async (id: string): Promise<void> => {
  const medicines = await getMedicines();
  await saveMedicines(medicines.filter((m) => m.id !== id));
};

export const getLogsForDate = async (date: string): Promise<DoseLog[]> => {
  try {
    const json = await AsyncStorage.getItem(LOGS_PREFIX + date);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const toggleDose = async (
  date: string,
  medicineId: string,
  time: TimeOfDay
): Promise<DoseLog[]> => {
  const logs = await getLogsForDate(date);
  const idx = logs.findIndex(
    (l) => l.medicineId === medicineId && l.time === time
  );

  if (idx >= 0) {
    const wasTaken = logs[idx].taken;
    logs[idx] = {
      ...logs[idx],
      taken: !wasTaken,
      takenAt: !wasTaken ? new Date().toISOString() : null,
    };
  } else {
    logs.push({
      id: `${medicineId}_${time}_${date}`,
      medicineId,
      date,
      time,
      taken: true,
      takenAt: new Date().toISOString(),
    });
  }

  await AsyncStorage.setItem(LOGS_PREFIX + date, JSON.stringify(logs));
  return logs;
};

export const isDoseTaken = (
  logs: DoseLog[],
  medicineId: string,
  time: TimeOfDay
): boolean => {
  const log = logs.find(
    (l) => l.medicineId === medicineId && l.time === time
  );
  return log ? log.taken : false;
};
