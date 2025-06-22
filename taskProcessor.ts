import { App, TFile } from 'obsidian';
import { TaskPublishSettings } from './settings';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: string;
    dueDate?: string;
    scheduledDate?: string;
    startDate?: string;
    filePath: string;
    lineNumber: number;
}

export class TaskProcessor {
    app: App;
    settings: TaskPublishSettings;

    constructor(app: App, settings: TaskPublishSettings) {
        this.app = app;
        this.settings = settings;
    }

    async processTaskQueries(content: string): Promise<string> {
        // Find all task query blocks
        const taskQueryRegex = /```tasks\n([\s\S]*?)\n```/g;
        let processedContent = content;
        let match;

        while ((match = taskQueryRegex.exec(content)) !== null) {
            const queryText = match[1];
            const tasks = await this.executeTaskQuery(queryText);
            const taskHtml = this.renderTasksAsHtml(tasks, queryText);
            
            // Replace the query block with rendered tasks
            processedContent = processedContent.replace(match[0], taskHtml);
        }

        return processedContent;
    }

    async executeTaskQuery(queryText: string): Promise<Task[]> {
        const allTasks = await this.getAllTasks();
        return this.filterTasks(allTasks, queryText);
    }

    async getAllTasks(): Promise<Task[]> {
        const tasks: Task[] = [];
        const files = this.app.vault.getMarkdownFiles();

        for (const file of files) {
            const content = await this.app.vault.read(file);
            const fileTasks = this.extractTasksFromContent(content, file.path);
            tasks.push(...fileTasks);
        }

        return tasks;
    }

    extractTasksFromContent(content: string, filePath: string): Task[] {
        const tasks: Task[] = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const taskMatch = line.match(/^(\s*)-\s*\[([ x])\]\s*(.+)$/);
            if (taskMatch) {
                const [, indent, checkmark, taskText] = taskMatch;
                const completed = checkmark === 'x';
                
                // Parse task metadata
                const priority = this.extractPriority(taskText);
                const dueDate = this.extractDate(taskText, '📅');
                const scheduledDate = this.extractDate(taskText, '⏳');
                const startDate = this.extractDate(taskText, '🛫');

                const task: Task = {
                    id: `${filePath}:${index}`,
                    text: this.cleanTaskText(taskText),
                    completed,
                    priority,
                    dueDate,
                    scheduledDate,
                    startDate,
                    filePath,
                    lineNumber: index
                };

                tasks.push(task);
            }
        });

        return tasks;
    }

    extractPriority(text: string): string {
        const priorityMatch = text.match(/[⏫🔺🔼🔽]/);
        if (!priorityMatch) return 'none';
        
        const symbol = priorityMatch[0];
        switch (symbol) {
            case '⏫': return 'highest';
            case '🔺': return 'high';
            case '🔼': return 'medium';
            case '🔽': return 'low';
            default: return 'none';
        }
    }

    extractDate(text: string, emoji: string): string | undefined {
        const regex = new RegExp(`${emoji}\\s*(\\d{4}-\\d{2}-\\d{2})`);
        const match = text.match(regex);
        return match ? match[1] : undefined;
    }

    cleanTaskText(text: string): string {
        // Remove task metadata symbols
        return text
            .replace(/[⏫🔺🔼🔽]/g, '')
            .replace(/📅\s*\d{4}-\d{2}-\d{2}/g, '')
            .replace(/⏳\s*\d{4}-\d{2}-\d{2}/g, '')
            .replace(/🛫\s*\d{4}-\d{2}-\d{2}/g, '')
            .trim();
    }

    filterTasks(tasks: Task[], queryText: string): Task[] {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        return tasks.filter(task => {
            // Parse query conditions
            const conditions = queryText.toLowerCase().split('\n').map(line => line.trim());
            
            for (const condition of conditions) {
                if (condition.includes('not done') && task.completed) return false;
                if (condition.includes('done today') && (!task.completed || !this.isCompletedToday(task))) return false;
                if (condition.includes('starts before tomorrow') && task.startDate && task.startDate >= tomorrow) return false;
                if (condition.includes('due on or before tomorrow') && task.dueDate && task.dueDate > tomorrow) return false;
                if (condition.includes('scheduled before tomorrow') && task.scheduledDate && task.scheduledDate >= tomorrow) return false;
                if (condition.includes('priority is above medium') && !['high', 'highest'].includes(task.priority)) return false;
                if (condition.includes('priority is medium') && task.priority !== 'medium') return false;
                if (condition.includes('due after today') && task.dueDate && task.dueDate <= today) return false;
                if (condition.includes('due within 3 days') && task.dueDate) {
                    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    if (task.dueDate > threeDaysFromNow) return false;
                }
            }
            
            return true;
        });
    }

    isCompletedToday(task: Task): boolean {
        // This would need to be enhanced to track completion dates
        // For now, assume tasks marked as completed were done today
        return task.completed;
    }

    renderTasksAsHtml(tasks: Task[], queryText: string): string {
        const isShortMode = queryText.includes('short mode');
        const hideTaskCount = queryText.includes('hide task count');

        let html = '<div class="task-group">';
        
        if (!hideTaskCount) {
            html += `<div class="task-count">${tasks.length} tasks</div>`;
        }

        tasks.forEach(task => {
            const priorityClass = task.priority !== 'none' ? `priority-${task.priority}` : '';
            const completedClass = task.completed ? 'completed' : '';
            
            html += `
                <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                    <span class="task-text">${task.text}</span>
                    ${!isShortMode ? this.renderTaskMetadata(task) : ''}
                    <div class="task-actions">
                        <button onclick="postponeTask('${task.id}', 1)">+1d</button>
                        <button onclick="postponeTask('${task.id}', 7)">+1w</button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    renderTaskMetadata(task: Task): string {
        let metadata = '';
        if (task.dueDate) metadata += `<span class="due-date">📅 ${task.dueDate}</span>`;
        if (task.scheduledDate) metadata += `<span class="scheduled-date">⏳ ${task.scheduledDate}</span>`;
        if (task.startDate) metadata += `<span class="start-date">🛫 ${task.startDate}</span>`;
        if (task.priority !== 'none') metadata += `<span class="priority">${this.getPrioritySymbol(task.priority)}</span>`;
        
        return metadata ? `<div class="task-metadata">${metadata}</div>` : '';
    }

    getPrioritySymbol(priority: string): string {
        switch (priority) {
            case 'highest': return '⏫';
            case 'high': return '🔺';
            case 'medium': return '🔼';
            case 'low': return '🔽';
            default: return '';
        }
    }
}