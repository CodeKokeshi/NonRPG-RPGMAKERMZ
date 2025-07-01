//=============================================================================
// RPG Maker MZ - Simple Menu Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Simple Menu Plugin v1.0.0
 * @author YourName
 * @url 
 * @help SimpleMenuPlugin.js
 * 
 * @param hideCharacterProfiles
 * @text Hide Character Profiles
 * @desc Hide character profiles in the menu screen
 * @type boolean
 * @default true
 *
 * This plugin simplifies the menu system by:
 * - Removing weapons and armor from inventory (only items and key items remain)
 * - Removing Skills, Equip, and Formation from the main menu
 * - Optionally hiding character profiles on the left side
 *
 * It does not provide plugin commands.
 */

/*:ja
 * @target MZ
 * @plugindesc シンプルメニュープラグイン v1.0.0
 * @author YourName
 * @url 
 * @help SimpleMenuPlugin.js
 * 
 * @param hideCharacterProfiles
 * @text キャラクタープロフィールを非表示
 * @desc メニュー画面でキャラクタープロフィールを非表示にする
 * @type boolean
 * @default true
 *
 * このプラグインは以下の機能でメニューシステムを簡素化します：
 * - インベントリから武器と防具を削除（アイテムとキーアイテムのみ残す）
 * - メインメニューからスキル、装備、隊列変更を削除
 * - オプションで左側のキャラクタープロフィールを非表示
 *
 * プラグインコマンドはありません。
 */

(() => {
    'use strict';
    
    const pluginName = 'SimpleMenuPlugin';
    const parameters = PluginManager.parameters(pluginName);
    const hideCharacterProfiles = parameters['hideCharacterProfiles'] === 'true';

    //=============================================================================
    // Remove Skills, Equip, Formation, and Status from Main Menu
    //=============================================================================
    
    const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        const enabled = this.areMainCommandsEnabled();
        // Only add Item command, skip skill, equip, and status
        if (this.needsCommand("item")) {
            this.addCommand(TextManager.item, "item", enabled);
        }
        // Add Load Game command to pause menu
        this.addCommand("Load Game", "load", true);
        // Skip skill, equip, and status commands
    };

    // Remove Formation command
    const _Window_MenuCommand_addFormationCommand = Window_MenuCommand.prototype.addFormationCommand;
    Window_MenuCommand.prototype.addFormationCommand = function() {
        // Do nothing - this removes the formation command
    };

    //=============================================================================
    // Remove Weapons and Armor from Item Categories
    //=============================================================================
    
    const _Window_ItemCategory_makeCommandList = Window_ItemCategory.prototype.makeCommandList;
    Window_ItemCategory.prototype.makeCommandList = function() {
        // Only add Item and Key Item commands, skip weapon and armor
        if (this.needsCommand("item")) {
            this.addCommand(TextManager.item, "item");
        }
        // Skip weapon command
        // Skip armor command
        if (this.needsCommand("keyItem")) {
            this.addCommand(TextManager.keyItem, "keyItem");
        }
    };

    //=============================================================================
    // Hide Character Profiles - Force Remove Status Window
    //=============================================================================
    
    // Completely override the Scene_Menu creation to exclude status window
    Scene_Menu.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createCommandWindow();
        this.createGoldWindow();
        // Completely skip creating status window - no character profiles
    };

    // Override status window creation to do nothing
    Scene_Menu.prototype.createStatusWindow = function() {
        // Do nothing - this prevents the status window from being created
    };

    // Adjust command window to take full width when status window is hidden
    Scene_Menu.prototype.commandWindowRect = function() {
        const ww = Graphics.boxWidth; // Full width instead of partial
        const wh = this.mainAreaHeight() - this.goldWindowRect().height;
        const wx = 0;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    };

    // Adjust gold window position and size to full width
    Scene_Menu.prototype.goldWindowRect = function() {
        const ww = Graphics.boxWidth; // Full width
        const wh = this.calcWindowHeight(1, true);
        const wx = 0;
        const wy = this.mainAreaBottom() - wh;
        return new Rectangle(wx, wy, ww, wh);
    };

    // Override the status window rect to return empty rectangle
    Scene_Menu.prototype.statusWindowRect = function() {
        return new Rectangle(0, 0, 0, 0);
    };

    // Override start method to avoid trying to refresh non-existent status window
    Scene_Menu.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        // Skip status window refresh since we don't create it
    };

    // Prevent any references to status window
    Scene_Menu.prototype.onPersonalOk = function() {
        // Do nothing - prevents status window interactions
    };

    Scene_Menu.prototype.onPersonalCancel = function() {
        // Do nothing - prevents status window interactions
    };

    //=============================================================================
    // Prevent access to removed menu options, including status
    //=============================================================================
    
    // Override Scene_Menu command handling to prevent access to removed commands
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("skill", null); // Remove skill handler
        this._commandWindow.setHandler("equip", null); // Remove equip handler
        this._commandWindow.setHandler("formation", null); // Remove formation handler
        this._commandWindow.setHandler("status", null); // Remove status handler
        this._commandWindow.setHandler("load", this.commandLoad.bind(this)); // Add load handler
    };

    // Add Load Game command functionality
    Scene_Menu.prototype.commandLoad = function() {
        SceneManager.push(Scene_Load);
    };

    //=============================================================================
    // System Data Override (Additional Safety)
    //=============================================================================
    
    // Override the item categories in the system data to ensure weapons and armor don't show
    const _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        _DataManager_onLoad.call(this, object);
        if (object === $dataSystem) {
            // Disable weapon and armor categories
            $dataSystem.itemCategories[1] = false; // weapon
            $dataSystem.itemCategories[2] = false; // armor
        }
    };

    // Block access to the status scene entirely
    Scene_Status.prototype.create = function() {
        // Do nothing: disables the entire status scene
    };
    Scene_Status.prototype.start = function() {
        // Do nothing
    };
    Scene_Status.prototype.update = function() {
        // Do nothing
    };
    Scene_Status.prototype.isReady = function() {
        return false;
    };

})();
