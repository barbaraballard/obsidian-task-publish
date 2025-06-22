# TaskPublish - Obsidian Plugin

A powerful Obsidian plugin that publishes your task queries to a hosted web page with real-time synchronization via Git. Perfect for accessing and managing your tasks from any device!

## Features

- **Task Query Publishing**: Publishes pages containing Tasks plugin queries to a static website
- **Git-Based Publishing**: Uses Git commands to publish to a private repository
- **GitHub Pages Ready**: Works perfectly with GitHub Pages for free hosting
- **Real-time Sync**: Automatically syncs changes between Obsidian and your web interface
- **Task Management**: Complete, postpone, and modify tasks from the web interface
- **Add New Tasks**: Add tasks from the web that get synced back to your Periodic Notes
- **Password Protection**: Secure your published tasks with a PIN or password
- **Mobile Friendly**: Responsive design works great on phones and tablets
- **Simple Deployment**: No external hosting services required

## Requirements

- Obsidian with the **Tasks plugin** installed and enabled
- Git installed on your system
- A GitHub repository (can be private)
- GitHub Pages enabled on your repository (optional, for hosting)

## Installation

### Manual Installation

1. Download the latest release from the GitHub releases page
2. Extract the files to your vault's plugins folder: `VaultFolder/.obsidian/plugins/task-publish/`
3. Reload Obsidian and enable the plugin in Settings → Community Plugins

### Building from Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy the built files to your plugins folder

## Setup

### 1. Create a GitHub Repository

1. Create a new repository on GitHub (can be private)
2. Clone it locally or note the repository URL
3. (Optional) Enable GitHub Pages in repository settings for free hosting

### 2. Plugin Configuration

1. Open Obsidian Settings → TaskPublish
2. Configure the following settings:
   - **Publish Page Path**: Path to your task dashboard page (e.g., `Daily Tasks.md`)
   - **Periodic Notes Folder**: Folder where new tasks should be added (e.g., `Daily Notes`)
   - **Sync Interval**: How often to sync (in minutes, 0 to disable)
   - **Page Password/PIN**: Optional password to protect your published page
   - **Git Repository URL**: Your GitHub repository URL (e.g., `https://github.com/username/my-tasks.git`)
   - **Git Branch**: Branch to publish to (usually `main` or `gh-pages`)
   - **Local Repository Path**: Optional local path for the git repository

### 3. Configure Git Authentication

Make sure Git is configured with your credentials:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

For GitHub, you'll need either:
- Personal Access Token (recommended)
- SSH key authentication

### 4. Create Your Task Dashboard

Create a page in your vault that contains task queries. For example:

```markdown
# My Task Dashboard

## Today's Focus
``` tasks
not done 
(starts before tomorrow) 
(due on or before tomorrow) or (scheduled before tomorrow)
short mode
hide task count
```

## Important Tasks
``` tasks
not done
(starts before tomorrow) 
(priority is above medium)
short mode
hide task count
```

## Done Today
``` tasks
done today
short mode
```
```

## Usage

### Publishing Tasks

1. Click the upload icon in the ribbon, or
2. Use the command palette: "TaskPublish: Publish Tasks"

Your task dashboard will be processed and published to your GitHub repository as `index.html`!

### Accessing Your Published Tasks

- **GitHub Pages**: If enabled, access via `https://username.github.io/repository-name`
- **Local**: Open the `index.html` file from your local repository
- **Other Hosting**: Deploy the `index.html` file to any static hosting service

### Managing Tasks on the Web

Once published, you can:
- **Mark Complete**: Check/uncheck tasks
- **Postpone**: Use +1d or +1w buttons to postpone due dates
- **Add New Tasks**: Type new tasks that will be added to your Periodic Notes
- **View Updates**: See when the page was last synced

### Automatic Syncing

The plugin automatically syncs:
- On Obsidian startup (mobile and desktop)
- At your configured interval (default: every hour)
- When you manually run the sync command

Changes made on the web interface are stored locally and synced back to Obsidian when it next starts up or syncs.

## How It Works

1. **Publishing**: The plugin processes your task queries and generates a static HTML page
2. **Git Integration**: Uses git commands to clone/pull your repository, commit changes, and push updates
3. **Web Interface**: The HTML page includes JavaScript for task management
4. **Sync Back**: Changes from the web are stored in localStorage and processed on next Obsidian sync

## Supported Task Query Features

The plugin supports most Tasks plugin query features:

- ✅ `not done` / `done` filters
- ✅ Date filters (`due before`, `scheduled after`, etc.)
- ✅ Priority filters (`priority is above medium`)
- ✅ `short mode` formatting
- ✅ `hide task count` option
- ✅ Task priorities (⏫🔺🔼🔽)
- ✅ Due dates (📅), scheduled dates (⏳), start dates (🛫)

## Security

- Your Git repository can be private
- The published page can be password protected
- Only the specified task dashboard page is published
- No personal vault content is exposed beyond your chosen tasks
- Git credentials are handled by your local Git configuration

## Troubleshooting

### Publishing Fails
- Ensure Git is installed and configured
- Check that your repository URL is correct
- Verify Git authentication (personal access token or SSH key)
- Make sure you have push permissions to the repository

### Tasks Not Appearing
- Ensure the Tasks plugin is installed and enabled
- Check that your publish page path is correct
- Verify your task queries use supported syntax

### Sync Issues
- Check that the local repository path is accessible
- Verify your internet connection
- Try manually running the sync command
- Check the console for error messages

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you find this plugin helpful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- 💝 Sponsoring development

---

**Note**: This plugin requires the Tasks plugin and works best with daily notes or periodic notes workflows. Git must be installed and configured on your system.