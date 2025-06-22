export interface TaskPublishSettings {
    publishPagePath: string;
    periodicNotesFolder: string;
    syncInterval: number; // in minutes
    pagePassword: string;
    gitRepoUrl: string;
    gitBranch: string;
    localRepoPath: string;
    lastSync: number;
}

export const DEFAULT_SETTINGS: TaskPublishSettings = {
    publishPagePath: 'Daily Tasks.md',
    periodicNotesFolder: 'Daily Notes',
    syncInterval: 60,
    pagePassword: '',
    gitRepoUrl: '',
    gitBranch: 'main',
    localRepoPath: '',
    lastSync: 0
};