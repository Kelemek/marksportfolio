export interface Settings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsInsert {
  key: string;
  value: string;
}

export interface SettingsUpdate {
  key?: string;
  value?: string;
}
