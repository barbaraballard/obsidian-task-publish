import { App, TFile, Notice } from 'obsidian';
import { TaskPublishSettings } from './settings';

export class TaskSyncer {
    app: App;
    settings: TaskPublishSettings;

    constructor(app: App, settings: TaskPublishSettings) {
        this.app = app;
        this.settings = settings;
    }

    async sync(): Promise<void> {
        try {
            // Process any pending changes from the web interface
            await this.readPendingChangesFromRepo();
            
            // Update the settings with last sync time
            this.settings.lastSync = Date.now();
            
            console.log('Task sync completed successfully');
        } catch (error) {
            console.error('Error during task sync:', error);
            throw error;
        }
    }

    async processPendingWebChanges(): Promise<void> {
        // In a real implementation, this would check for pending changes
        // stored either locally or on a server endpoint
        
        // For now, we'll simulate processing localStorage-based pending changes
        // that would be set by the web interface
        
        const pendingToggles = this.getPendingToggles();
        const pendingPostpones = this.getPendingPostpones();
        const pendingTasks = this.getPendingTasks();

        // Process task toggles
        for (const [taskId, _] of Object.entries(pendingToggles)) {
            await this.toggleTaskInVault(taskId);
        }

        // Process task postponements
        for (const [taskId, newDate] of Object.entries(pendingPostpones)) {
            await this.postponeTaskInVault(taskId, newDate);
        }

        // Process new tasks
        for (const [_, taskText] of Object.entries(pendingTasks)) {
            await this.addTaskToPeriodicNote(taskText);
        }

        // Clear processed items (in real implementation)
        this.clearProcessedPendingChanges();
    }

    async toggleTaskInVault(taskId: string): Promise<void> {
        const [filePath, lineNumber] = taskId.split(':');
        const file = this.app.vault.getAbstractFileByPath(filePath);
        
        if (!file || !(file instanceof TFile)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }

        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        const targetLine = parseInt(lineNumber);

        if (targetLine >= 0 && targetLine < lines.length) {
            const line = lines[targetLine];
            const taskMatch = line.match(/^(\s*)-\s*\[([ x])\]\s*(.+)$/);
            
            if (taskMatch) {
                const [, indent, checkmark, taskText] = taskMatch;
                const newCheckmark = checkmark === 'x' ? ' ' : 'x';
                lines[targetLine] = `${indent}- [${newCheckmark}] ${taskText}`;
                
                const newContent = lines.join('\n');
                await this.app.vault.modify(file, newContent);
                
                console.log(`Toggled task: ${taskId}`);
            }
        }
    }

    async postponeTaskInVault(taskId: string, newDate: string): Promise<void> {
        const [filePath, lineNumber] = taskId.split(':');
        const file = this.app.vault.getAbstractFileByPath(filePath);
        
        if (!file || !(file instanceof TFile)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }

        const content = await this.app.vault.read(file);
        const lines = content.split('\n');
        const targetLine = parseInt(lineNumber);

        if (targetLine >= 0 && targetLine < lines.length) {
            let line = lines[targetLine];
            
            // Remove existing due date if present
            line = line.replace(/📅\s*\d{4}-\d{2}-\d{2}/, '').trim();
            
            // Add new due date
            if (line.endsWith(']')) {
                // Task with no content after checkbox
                line = line.slice(0, -1) + ` 📅 ${newDate}]`;
            } else {
                // Task with content
                line += ` 📅 ${newDate}`;
            }
            
            lines[targetLine] = line;
            
            const newContent = lines.join('\n');
            await this.app.vault.modify(file, newContent);
            
            console.log(`Postponed task ${taskId} to ${newDate}`);
        }
    }

    async addTaskToPeriodicNote(taskText: string): Promise<void> {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const fileName = `${dateString}.md`;
        const filePath = `${this.settings.periodicNotesFolder}/${fileName}`;
        
        let file = this.app.vault.getAbstractFileByPath(filePath);
        
        if (!file || !(file instanceof TFile)) {
            // Create the daily note if it doesn't exist
            try {
                file = await this.app.vault.create(filePath, this.getDefaultDailyNoteTemplate(dateString));
            } catch (error) {
                console.error(`Error creating daily note: ${error}`);
                // Try to find any existing file in the periodic notes folder
                const periodicNotesFolder = this.app.vault.getAbstractFileByPath(this.settings.periodicNotesFolder);
                if (periodicNotesFolder) {
                    // Add to the most recent file instead
                    const files = this.app.vault.getMarkdownFiles()
                        .filter(f => f.path.startsWith(this.settings.periodicNotesFolder))
                        .sort((a, b) => b.stat.mtime - a.stat.mtime);
                    
                    if (files.length > 0) {
                        file = files[0];
                    } else {
                        throw new Error('No periodic notes found');
                    }
                } else {
                    throw new Error('Periodic notes folder not found');
                }
            }
        }

        if (file instanceof TFile) {
            const content = await this.app.vault.read(file);
            const newTask = `- [ ] ${taskText}`;
            
            // Find a good place to add the task
            let newContent;
            if (content.includes('## Tasks') || content.includes('# Tasks')) {
                // Add under existing tasks section
                newContent = content.replace(
                    /(## Tasks|# Tasks)/,
                    `$1\n${newTask}`
                );
            } else {
                // Add at the end
                newContent = content + `\n\n## Tasks\n${newTask}`;
            }
            
            await this.app.vault.modify(file, newContent);
            console.log(`Added new task: ${taskText}`);
        }
    }

    getDefaultDailyNoteTemplate(dateString: string): string {
        return `# ${dateString}

## Tasks
- [ ] Review daily tasks

## Notes

`;
    }

    // Mock methods for handling pending changes
    // In a real implementation, these would read from a JSON file
    // that the web interface could write to in the git repository

    getPendingToggles(): Record<string, boolean> {
        // Read from a JSON file in the git repository
        // For now, mock implementation
        return {};
    }

    getPendingPostpones(): Record<string, string> {
        // Read from a JSON file in the git repository
        // For now, mock implementation
        return {};
    }

    getPendingTasks(): Record<string, string> {
        // Read from a JSON file in the git repository
        // For now, mock implementation
        return {};
    }

    clearProcessedPendingChanges(): void {
        // Clear the JSON file in the git repository
        console.log('Cleared processed pending changes');
    }

    async readPendingChangesFromRepo(): Promise<void> {
        // This would read pending changes from a JSON file in the git repository
        // The web interface would write changes to this file, and Obsidian would read them
        const repoPath = this.settings.localRepoPath || '.taskpublish-repo';
        const pendingChangesPath = `${repoPath}/pending-changes.json`;
        
        try {
            const fs = require('fs');
            if (fs.existsSync(pendingChangesPath)) {
                const pendingChanges = JSON.parse(fs.readFileSync(pendingChangesPath, 'utf8'));
                
                // Process toggles
                for (const [taskId, _] of Object.entries(pendingChanges.toggles || {})) {
                    await this.toggleTaskInVault(taskId);
                }
                
                // Process postponements
                for (const [taskId, newDate] of Object.entries(pendingChanges.postpones || {})) {
                    await this.postponeTaskInVault(taskId, newDate as string);
                }
                
                // Process new tasks
                for (const [_, taskText] of Object.entries(pendingChanges.newTasks || {})) {
                    await this.addTaskToPeriodicNote(taskText as string);
                }
                
                // Clear the file after processing
                fs.unlinkSync(pendingChangesPath);
                console.log('Processed and cleared pending changes from repository');
            }
        } catch (error) {
            console.error('Error reading pending changes from repository:', error);
        }
    }



    // Utility method to find tasks that need to be synced
    async findModifiedTasks(): Promise<string[]> {
        const modifiedTasks: string[] = [];
        const files = this.app.vault.getMarkdownFiles();
        
        for (const file of files) {
            if (file.stat.mtime > this.settings.lastSync) {
                // File was modified since last sync
                const content = await this.app.vault.read(file);
                if (this.containsTasks(content)) {
                    modifiedTasks.push(file.path);
                }
            }
        }
        
        return modifiedTasks;
    }

    containsTasks(content: string): boolean {
        return /^[\s]*-\s*\[[ x]\]/m.test(content);
    }


}