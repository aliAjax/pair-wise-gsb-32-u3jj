import type { TripTemplate } from '../models/tripTemplate';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

export const tripTemplateApi = {
  list: () => loadLocal<TripTemplate[]>(STORAGE_KEYS.templates, []),
  save: (templates: TripTemplate[]) => saveLocal(STORAGE_KEYS.templates, templates),
};
