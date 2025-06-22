import { Plugin, TFile, Notice, Modal, Setting, PluginSettingTab } from 'obsidian';
import { TaskPublishSettings, DEFAULT_SETTINGS } from './settings';
import { TaskProcessor } from './taskProcessor';
import { WebPublisher } from './webPublisher';
import { TaskSyncer } from './taskSyncer';

export default class TaskPublishPlugin extends Plugin {
    settings: TaskPublishSettings = DEFAULT_SETTINGS;
    taskProcessor!: TaskProcessor;
    webPublisher!: WebPublisher;
    taskSyncer!: TaskSyncer;
    syncInterval?: number;

    async onload() {
        await this.loadSettings();

        // Initialize components
        this.taskProcessor = new TaskProcessor(this.app, this.settings);
        this.webPublisher = new WebPublisher(this.settings);
        this.taskSyncer = new TaskSyncer(this.app, this.settings);

        // Add ribbon icon
        this.addRibbonIcon('upload', 'Publish Tasks', () => {
            this.publishTasks();
        });

        // Add commands
        this.addCommand({
            id: 'publish-tasks',
            name: 'Publish Tasks',
            callback: () => this.publishTasks()
        });

        this.addCommand({
            id: 'sync-tasks',
            name: 'Sync Tasks',
            callback: () => this.syncTasks()
        });

        // Add settings tab
        this.addSettingTab(new TaskPublishSettingTab(this.app, this));

        // Set up auto-sync
        this.setupAutoSync();

        // Sync on startup
        setTimeout(() => this.syncTasks(), 2000);
    }

    onunload() {
        if (this.syncInterval) {
            window.clearInterval(this.syncInterval);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.setupAutoSync(); // Restart sync with new interval
    }

    setupAutoSync() {
        if (this.syncInterval) {
            window.clearInterval(this.syncInterval);
        }

        if (this.settings.syncInterval > 0) {
            this.syncInterval = window.setInterval(() => {
                this.syncTasks();
            }, this.settings.syncInterval * 60 * 1000); // Convert minutes to milliseconds
        }
    }

    async publishTasks() {
        try {
            const publishFile = this.app.vault.getAbstractFileByPath(this.settings.publishPagePath);
            if (!publishFile || !(publishFile instanceof TFile)) {
                new Notice('Publish page not found. Please check your settings.');
                return;
            }

            const content = await this.app.vault.read(publishFile);
            const processedContent = await this.taskProcessor.processTaskQueries(content);
            
            await this.webPublisher.publish(processedContent);
            new Notice('Tasks published successfully!');
        } catch (error) {
            console.error('Error publishing tasks:', error);
            new Notice('Error publishing tasks. Check console for details.');
        }
    }

    async syncTasks() {
        try {
            await this.taskSyncer.sync();
            new Notice('Tasks synced successfully!');
        } catch (error) {
            console.error('Error syncing tasks:', error);
            new Notice('Error syncing tasks. Check console for details.');
        }
    }
}

class TaskPublishSettingTab extends PluginSettingTab {
    plugin: TaskPublishPlugin;

    constructor(app: any, plugin: TaskPublishPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'TaskPublish Settings' });

        new Setting(containerEl)
            .setName('Publish Page Path')
            .setDesc('Path to the page containing task queries to publish')
            .addText(text => text
                .setPlaceholder('Daily Tasks.md')
                .setValue(this.plugin.settings.publishPagePath)
                .onChange(async (value) => {
                    this.plugin.settings.publishPagePath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Periodic Notes Folder')
            .setDesc('Folder where new tasks should be added (usually Daily Notes)')
            .addText(text => text
                .setPlaceholder('Daily Notes')
                .setValue(this.plugin.settings.periodicNotesFolder)
                .onChange(async (value) => {
                    this.plugin.settings.periodicNotesFolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Sync Interval (minutes)')
            .setDesc('How often to sync tasks (0 to disable)')
            .addText(text => text
                .setPlaceholder('60')
                .setValue(this.plugin.settings.syncInterval.toString())
                .onChange(async (value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 0) {
                        this.plugin.settings.syncInterval = num;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('Page Password/PIN')
            .setDesc('Password or PIN to protect the published page')
            .addText(text => text
                .setPlaceholder('Enter password')
                .setValue(this.plugin.settings.pagePassword)
                .onChange(async (value) => {
                    this.plugin.settings.pagePassword = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Netlify Site Name')
            .setDesc('Your Netlify site name (e.g., my-tasks)')
            .addText(text => text
                .setPlaceholder('my-tasks')
                .setValue(this.plugin.settings.netlifySiteName)
                .onChange(async (value) => {
                    this.plugin.settings.netlifySiteName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Netlify Access Token')
            .setDesc('Your Netlify personal access token')
            .addText(text => text
                .setPlaceholder('Enter access token')
                .setValue(this.plugin.settings.netlifyToken)
                .onChange(async (value) => {
                    this.plugin.settings.netlifyToken = value;
                    await this.plugin.saveSettings();
                }));
    }
}