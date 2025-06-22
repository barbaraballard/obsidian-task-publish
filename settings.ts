export interface TaskPublishSettings {
    publishPagePath: string;
    periodicNotesFolder: string;
    syncInterval: number; // in minutes
    pagePassword: string;
    netlifySiteName: string;
    netlifyToken: string;
    lastSync: number;
}

export const DEFAULT_SETTINGS: TaskPublishSettings = {
    publishPagePath: 'Daily Tasks.md',
    periodicNotesFolder: 'Daily Notes',
    syncInterval: 60,
    pagePassword: '',
    netlifySiteName: '',
    netlifyToken: '',
    lastSync: 0
};