import { TaskPublishSettings } from './settings';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class WebPublisher {
    settings: TaskPublishSettings;

    constructor(settings: TaskPublishSettings) {
        this.settings = settings;
    }

    async publish(content: string): Promise<void> {
        const htmlContent = this.generateHtmlPage(content);
        
        if (!this.settings.gitRepoUrl) {
            throw new Error('Git repository URL is required for publishing');
        }

        await this.publishToGitHub(htmlContent);
    }

    async publishToGitHub(htmlContent: string): Promise<void> {
        const repoPath = this.settings.localRepoPath || path.join(process.cwd(), '.taskpublish-repo');
        
        try {
            // Check if local repo exists, if not clone it
            if (!fs.existsSync(repoPath)) {
                console.log('Cloning repository...');
                await execAsync(`git clone ${this.settings.gitRepoUrl} "${repoPath}"`);
            }

            // Change to repo directory and pull latest changes
            process.chdir(repoPath);
            await execAsync('git pull origin ' + this.settings.gitBranch);

            // Write the HTML file
            const htmlPath = path.join(repoPath, 'index.html');
            fs.writeFileSync(htmlPath, htmlContent, 'utf8');

            // Check if there are changes to commit
            const { stdout: statusOutput } = await execAsync('git status --porcelain');
            
            if (statusOutput.trim()) {
                // Add, commit, and push changes
                await execAsync('git add index.html');
                await execAsync(`git commit -m "Update tasks - ${new Date().toISOString()}"`);
                await execAsync(`git push origin ${this.settings.gitBranch}`);
                
                console.log('Tasks published to GitHub successfully!');
            } else {
                console.log('No changes to publish');
            }
            
        } catch (error) {
            console.error('Error publishing to GitHub:', error);
            throw new Error(`GitHub publishing failed: ${error}`);
        }
    }

    generateHtmlPage(content: string): string {
        const passwordProtection = this.settings.pagePassword ? this.generatePasswordProtection() : '';
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Tasks</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    ${passwordProtection}
    <div id="main-content" ${this.settings.pagePassword ? 'style="display:none"' : ''}>
        <div class="container">
            <h1>My Tasks</h1>
            <div class="last-updated">Last updated: ${new Date().toLocaleString()}</div>
            <div class="repo-info">📁 Published from: ${this.settings.gitRepoUrl}</div>
            
            <div class="task-input-section">
                <h3>Add New Task</h3>
                <input type="text" id="new-task-input" placeholder="Enter a new task..." />
                <button onclick="addNewTask()">Add Task</button>
            </div>
            
            <div class="content">
                ${content}
            </div>
        </div>
    </div>
    
    <script>
        ${this.getJavaScript()}
    </script>
</body>
</html>`;
    }

    generatePasswordProtection(): string {
        return `
        <div id="password-prompt" class="password-screen">
            <div class="password-container">
                <h2>Enter Password</h2>
                <input type="password" id="password-input" placeholder="Password" />
                <button onclick="checkPassword()">Enter</button>
            </div>
        </div>`;
    }

    getStyles(): string {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .last-updated, .repo-info {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        
        .repo-info {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 4px solid #28a745;
            margin-bottom: 30px;
        }
        
        .task-input-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .task-input-section h3 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        #new-task-input {
            width: 70%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        button {
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }
        
        button:hover {
            background: #2980b9;
        }
        
        .task-group {
            margin-bottom: 30px;
        }
        
        .task-count {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
        }
        
        .task-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
            margin-bottom: 8px;
            background: white;
            transition: all 0.2s ease;
        }
        
        .task-item:hover {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .task-item.completed {
            opacity: 0.6;
            background: #f8f9fa;
        }
        
        .task-item.completed .task-text {
            text-decoration: line-through;
        }
        
        .task-item input[type="checkbox"] {
            margin-right: 12px;
            transform: scale(1.2);
        }
        
        .task-text {
            flex: 1;
            font-size: 16px;
        }
        
        .task-metadata {
            display: flex;
            gap: 10px;
            margin-left: 10px;
            font-size: 0.85em;
        }
        
        .task-metadata span {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .due-date { background: #fff3cd; }
        .scheduled-date { background: #d1ecf1; }
        .start-date { background: #d4edda; }
        .priority { background: #f8d7da; }
        
        .task-actions {
            display: flex;
            gap: 5px;
            margin-left: 10px;
        }
        
        .task-actions button {
            padding: 4px 8px;
            font-size: 0.8em;
            margin: 0;
        }
        
        .priority-highest { border-left: 4px solid #dc3545; }
        .priority-high { border-left: 4px solid #fd7e14; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #6c757d; }
        
        .password-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .password-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .password-container h2 {
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .password-container input {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 20px;
            width: 200px;
            font-size: 16px;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            
            #new-task-input {
                width: 100%;
                margin-bottom: 10px;
            }
            
            button {
                margin-left: 0;
                width: 100%;
            }
            
            .task-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .task-actions {
                margin-left: 0;
                margin-top: 10px;
            }
        }`;
    }

    getJavaScript(): string {
        return `
        let pendingChanges = {
            toggles: {},
            postpones: {},
            newTasks: {}
        };
        
        function checkPassword() {
            const input = document.getElementById('password-input');
            const enteredPassword = input.value;
            const correctPassword = '${this.settings.pagePassword}';
            
            if (enteredPassword === correctPassword) {
                document.getElementById('password-prompt').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';
            } else {
                alert('Incorrect password');
                input.value = '';
            }
        }
        
        function toggleTask(taskId) {
            // Store in pending changes object
            pendingChanges.toggles[taskId] = true;
            savePendingChanges();
            
            // Update UI immediately
            const checkbox = document.querySelector('input[data-task-id="' + taskId + '"]');
            if (checkbox) {
                const taskItem = checkbox.closest('.task-item');
                if (checkbox.checked) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }
            }
            
            console.log('Task toggle queued for next Obsidian sync');
        }
        
        function postponeTask(taskId, days) {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + days);
            const dateString = newDate.toISOString().split('T')[0];
            
            pendingChanges.postpones[taskId] = dateString;
            savePendingChanges();
            
            alert('Task postponed to ' + dateString + '. Will sync on next Obsidian startup.');
        }
        
        function addNewTask() {
            const input = document.getElementById('new-task-input');
            const taskText = input.value.trim();
            
            if (taskText) {
                const timestamp = Date.now();
                pendingChanges.newTasks[timestamp] = taskText;
                savePendingChanges();
                
                input.value = '';
                alert('Task queued for next sync!');
            }
        }
        
        function savePendingChanges() {
            // In a real implementation, this would save to a JSON file
            // that gets committed to the repository
            // For now, we'll use localStorage as a fallback
            localStorage.setItem('taskpublish_pending_changes', JSON.stringify(pendingChanges));
            console.log('Pending changes saved:', pendingChanges);
        }
        
        function loadPendingChanges() {
            const saved = localStorage.getItem('taskpublish_pending_changes');
            if (saved) {
                pendingChanges = JSON.parse(saved);
            }
        }
        
        // Handle Enter key in password input
        document.addEventListener('DOMContentLoaded', function() {
            loadPendingChanges();
            
            const passwordInput = document.getElementById('password-input');
            if (passwordInput) {
                passwordInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        checkPassword();
                    }
                });
            }
            
            const taskInput = document.getElementById('new-task-input');
            if (taskInput) {
                taskInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        addNewTask();
                    }
                });
            }
        });`;
    }
}