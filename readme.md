# TaskPublish - Obsidian Plugin

A powerful Obsidian plugin that publishes your task queries to a hosted web page with real-time synchronization. Perfect for accessing and managing your tasks from any device!

## Features

- **Task Query Publishing**: Publishes pages containing Tasks plugin queries to a hosted website
- **Real-time Sync**: Automatically syncs changes between Obsidian and your web interface
- **Task Management**: Complete, postpone, and modify tasks from the web interface
- **Add New Tasks**: Add tasks from the web that get synced back to your Periodic Notes
- **Password Protection**: Secure your published tasks with a PIN or password
- **Mobile Friendly**: Responsive design works great on phones and tablets
- **Netlify Integration**: Easy deployment to Netlify for reliable hosting

## Requirements

- Obsidian with the **Tasks plugin** installed and enabled
- A Netlify account (for hosting the web interface)
- Netlify personal access token

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

### 1. Configure Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Generate a personal access token in your Netlify settings
3. Note your site name (the subdomain before `.netlify.app`)

### 2. Plugin Configuration

1. Open Obsidian Settings → TaskPublish
2. Configure the following settings:
   - **Publish Page Path**: Path to your task dashboard page (e.g., `Daily Tasks.md`)
   - **Periodic Notes Folder**: Folder where new tasks should be added (e.g., `Daily Notes`)
   - **Sync Interval**: How often to sync (in minutes, 0 to disable)
   - **Page Password/PIN**: Optional password to protect your published page
   - **Netlify Site Name**: Your Netlify site name
   - **Netlify Access Token**: Your Netlify personal access token

### 3. Create Your Task Dashboard

Create a page in your vault that contains task queries. For example:


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


## Usage

### Publishing Tasks

1. Click the upload icon in the ribbon, or
2. Use the command palette: "TaskPublish: Publish Tasks"

Your task dashboard will be processed and published to your Netlify site!

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

- Your Netlify access token is stored locally in Obsidian
- The published page can be password protected
- Only the specified task dashboard page is published
- No personal vault content is exposed beyond your chosen tasks

## Troubleshooting

### Tasks Not Appearing
- Ensure the Tasks plugin is installed and enabled
- Check that your publish page path is correct
- Verify your task queries use supported syntax

### Publishing Fails
- Check your Netlify site name and access token
- Ensure your Netlify account has deployment permissions
- Check the console for error messages

### Sync Issues
- Verify your internet connection
- Check that the published page is accessible
- Try manually running the sync command

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

**Note**: This plugin requires the Tasks plugin and works best with daily notes or periodic notes workflows.