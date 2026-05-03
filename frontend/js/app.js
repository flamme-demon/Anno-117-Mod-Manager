// Anno 117 Mod Manager — pywebview frontend bootstrap.
// Defines the Alpine root component used by index.html.

// UI strings keyed by stable id; English is the canonical source so any key
// missing in another language falls back to en. Add more languages by
// dropping a {key: 'localized text'} entry into the TRANSLATIONS map below.
const TRANSLATIONS = {
  english: {
    'profile.label':           'Profile',
    'profile.new':             '＋ New',
    'profile.delete':          '🗑 Delete',
    'profile.deleteConfirm':   'Delete preset "{name}"?',
    'profile.cantDeleteReserved': 'The "Default" and "Vanilla" profiles cannot be deleted.',
    'profile.promptName':      'Name of the new preset:',
    'mode.manage':             'Manage',
    'mode.order':              'Load order',
    'mode.manage.title':       'Sort and toggle mods on/off',
    'mode.order.title':        'Reorder load order via drag-and-drop',
    'list.head.toggleAll':     'Activate / deactivate all',
    'list.head.category':      'Category',
    'list.head.name':          'Mod name',
    'list.head.size':          'Size',
    'list.head.status':        'Status',
    'list.empty':              'No mods detected in the configured folders.',
    'count.active':            '{n} / {total} active',
    'pill.active':             'ON',
    'pill.off':                'OFF',
    'detail.empty':            'Select a mod from the list to view its sheet.',
    'detail.banner.empty':     'No banner provided for this mod.',
    'detail.description':      'Description',
    'detail.noDescription':    'No description provided.',
    'detail.details':          'Details',
    'detail.meta.category':    'Category',
    'detail.meta.difficulty':  'Difficulty',
    'detail.meta.size':        'Size',
    'detail.meta.folder':      'Folder',
    'detail.creator':          'by {name} · v{version}',
    'detail.openFolder':       'Open folder',
    'detail.uninstall':        'Uninstall',
    'detail.uninstallConfirm': 'Uninstall mod "{name}"?\n\nThe folder will be deleted from disk.',
    'tab.placeholder':         'This tab will be ported in phase 2 of the migration.',
    'tab.placeholderHint':     'pywebview POC in progress — only the {tab} tab works for now.',
    'launch.title':            'Launch Anno 117',
    'launch.error':            'Could not launch the game: {err}',
    'mods.openFolder.title':   'Open the mods folder',
    'tab.news':                'News',
    'tab.activation':          'Activation',
    'tab.browser':             'Mod Browser',
    'tab.collections':         'Collections',
    'tab.install':             'Manual Install',
    'tab.log':                 'Modloader Log',
    'tab.tweak':               'Tweaking',
    'tab.settings':            'Settings',
    'settings.section.paths':       'Paths',
    'settings.section.behaviour':   'Behaviour',
    'settings.section.advanced':    'Advanced',
    'settings.gamePath':            'Anno 117 executable',
    'settings.gamePath.empty':      'Not configured — set the path to Anno117.exe',
    'settings.docsPath':            'Documents folder override',
    'settings.docsPath.empty':      'Auto-detected (uses ~/Documents or the Proton prefix)',
    'settings.browseFile':          'Browse file…',
    'settings.browseFolder':        'Browse folder…',
    'settings.autoDetect':          'Auto-detect',
    'settings.clear':               'Clear',
    'settings.open':                'Open',
    'settings.modLocation':         'Mod storage location',
    'settings.modLocation.documents': 'Documents folder (recommended)',
    'settings.modLocation.game':      'Game install folder',
    'settings.enableNewMods':       'Newly installed mods',
    'settings.enableNewMods.on':    'Always activate them',
    'settings.enableNewMods.off':   'Never activate them',
    'settings.enableNewMods.keep':  'Keep their previous state',
    'settings.derived.docsMods':    'Documents mods folder',
    'settings.derived.gameMods':    'Game install mods folder',
    'settings.derived.profile':     'active-profile.txt',
    'settings.derived.appdata':     'AppData',
    'settings.derived.presets':     'Presets',
    'settings.pathError':           'Path could not be saved: {err}',
    'settings.detectError':         'Could not auto-detect: {err}',
    'settings.section.modio':       'mod.io integration',
    'settings.modio.hint':          'Enter your personal mod.io API key to enable the Mod Browser and Collections tabs. Generate one at',
    'settings.modio.apiKey':        'API key',
    'settings.modio.apiKeyPlaceholder': 'Paste your mod.io API key here',
    'settings.modio.save':          'Save',
    'settings.modio.disconnect':    'Disconnect',
    'settings.modio.disconnectConfirm': 'Remove the saved mod.io API key?',
    'settings.modio.emptyKey':      'API key is empty.',
    'settings.modio.connected':     'Connected',
    'settings.modio.notConnected':  'Not connected',
    'log.refresh':                  '↻ Refresh',
    'log.copy':                     '⧉ Copy',
    'log.openFile':                 'Open file',
    'log.loading':                  'Loading…',
    'log.empty':                    'mod-loader.log is empty.',
    'log.notFound':                 'mod-loader.log not found at:\n{path}',
    'log.truncated':                'Log truncated to last 2 MB',
    'install.title':                'Manual install',
    'install.hint':                 'Drop a mod ZIP here, or click to browse. The archive must contain a modinfo.json (or .jsonc) file.',
    'install.drop':                 'Drop a .zip mod here',
    'install.or':                   '— or —',
    'install.browse':               'Browse a ZIP file…',
    'install.targetLabel':          'Install destination:',
    'install.installing':           'Installing {name}…',
    'install.uploading':            'Uploading {name}…',
    'install.success':              '{name} installed.',
    'install.cancelled':            'Cancelled.',
    'install.notZip':               'Only .zip archives are supported.',
    'install.overwriteConfirm':     'A mod folder named "{name}" already exists. Replace it?',
    'install.dropFailed':           'The drop did not deliver a file (your file manager may not support drag-drop into the webview). Use the Browse button instead.',
    'tweak.listHeader':             'Tweakable mods',
    'tweak.optionWord':             'options',
    'tweak.noTweakable':            'None of your installed mods exposes options.',
    'tweak.pickHint':                'Select a mod on the left to tweak its options.',
    'tweak.noOptions':              'This mod has no configurable options.',
    'tweak.resetMod':               'Reset this mod',
    'tweak.resetAll':               'Reset all',
    'tweak.resetModConfirm':        'Reset all options for this mod to their defaults?',
    'tweak.resetAllConfirm':        'Reset every mod’s options? The active-options.jsonc file will be deleted.',
    'news.refresh':                 '↻ Refresh',
    'news.loading':                 'Fetching latest posts…',
    'news.empty':                   'No news to display.',
    'news.error':                   'Could not fetch news: {err}',
    'news.cached':                  'cached (10 min)',
    'news.includeReddit':           'Include r/anno posts',
    'news.visitUnion':              'Open Anno Union ↗',
  },
  french: {
    'profile.label':           'Profil',
    'profile.new':             '＋ Nouveau',
    'profile.delete':          '🗑 Supprimer',
    'profile.deleteConfirm':   'Supprimer le preset « {name} » ?',
    'profile.cantDeleteReserved': 'Les profils « Default » et « Vanilla » ne peuvent pas être supprimés.',
    'profile.promptName':      'Nom du nouveau preset :',
    'mode.manage':             'Gestion',
    'mode.order':              'Ordre de chargement',
    'mode.manage.title':       'Trier et activer/désactiver les mods',
    'mode.order.title':        'Réorganiser l’ordre de chargement par drag-and-drop',
    'list.head.toggleAll':     'Tout activer / désactiver',
    'list.head.category':      'Catégorie',
    'list.head.name':          'Nom du mod',
    'list.head.size':          'Taille',
    'list.head.status':        'Statut',
    'list.empty':              'Aucun mod détecté dans les dossiers configurés.',
    'count.active':            '{n} / {total} actifs',
    'pill.active':             'ACTIF',
    'pill.off':                'OFF',
    'detail.empty':            'Choisissez un mod dans la liste pour consulter sa fiche.',
    'detail.banner.empty':     'Aucune bannière fournie pour ce mod.',
    'detail.description':      'Description',
    'detail.noDescription':    'Aucune description fournie.',
    'detail.details':          'Détails',
    'detail.meta.category':    'Catégorie',
    'detail.meta.difficulty':  'Difficulté',
    'detail.meta.size':        'Taille',
    'detail.meta.folder':      'Dossier',
    'detail.creator':          'par {name} · v{version}',
    'detail.openFolder':       'Ouvrir le dossier',
    'detail.uninstall':        'Désinstaller',
    'detail.uninstallConfirm': 'Désinstaller le mod « {name} » ?\n\nLe dossier sera supprimé du disque.',
    'tab.placeholder':         'Cet onglet sera porté en phase 2 de la migration.',
    'tab.placeholderHint':     'POC pywebview en cours — seul l’onglet {tab} est fonctionnel pour l’instant.',
    'launch.title':            'Lancer Anno 117',
    'launch.error':            'Impossible de lancer le jeu : {err}',
    'mods.openFolder.title':   'Ouvrir le dossier des mods',
    'tab.news':                'Actualités',
    'tab.activation':          'Activation',
    'tab.browser':             'Mod Browser',
    'tab.collections':         'Collections',
    'tab.install':             'Installation manuelle',
    'tab.log':                 'Journal du Modloader',
    'tab.tweak':               'Ajustement',
    'tab.settings':            'Paramètres',
    'settings.section.paths':       'Chemins',
    'settings.section.behaviour':   'Comportement',
    'settings.section.advanced':    'Avancé',
    'settings.gamePath':            'Exécutable Anno 117',
    'settings.gamePath.empty':      'Non configuré — indiquez le chemin de Anno117.exe',
    'settings.docsPath':            'Dossier Documents personnalisé',
    'settings.docsPath.empty':      'Auto-détecté (utilise ~/Documents ou le préfixe Proton)',
    'settings.browseFile':          'Parcourir un fichier…',
    'settings.browseFolder':        'Parcourir un dossier…',
    'settings.autoDetect':          'Auto-détecter',
    'settings.clear':               'Effacer',
    'settings.open':                'Ouvrir',
    'settings.modLocation':         'Emplacement de stockage des mods',
    'settings.modLocation.documents': 'Dossier Documents (recommandé)',
    'settings.modLocation.game':      'Dossier d’installation du jeu',
    'settings.enableNewMods':       'Mods nouvellement installés',
    'settings.enableNewMods.on':    'Toujours les activer',
    'settings.enableNewMods.off':   'Ne jamais les activer',
    'settings.enableNewMods.keep':  'Conserver leur état précédent',
    'settings.derived.docsMods':    'Dossier mods (Documents)',
    'settings.derived.gameMods':    'Dossier mods (jeu)',
    'settings.derived.profile':     'active-profile.txt',
    'settings.derived.appdata':     'AppData',
    'settings.derived.presets':     'Presets',
    'settings.pathError':           'Le chemin n’a pas pu être sauvegardé : {err}',
    'settings.detectError':         'Auto-détection échouée : {err}',
    'settings.section.modio':       'Intégration mod.io',
    'settings.modio.hint':          'Saisissez votre clé API mod.io personnelle pour activer les onglets Mod Browser et Collections. Générez-en une sur',
    'settings.modio.apiKey':        'Clé API',
    'settings.modio.apiKeyPlaceholder': 'Collez ici votre clé API mod.io',
    'settings.modio.save':          'Sauvegarder',
    'settings.modio.disconnect':    'Déconnecter',
    'settings.modio.disconnectConfirm': 'Supprimer la clé API mod.io enregistrée ?',
    'settings.modio.emptyKey':      'La clé API est vide.',
    'settings.modio.connected':     'Connecté',
    'settings.modio.notConnected':  'Non connecté',
    'log.refresh':                  '↻ Rafraîchir',
    'log.copy':                     '⧉ Copier',
    'log.openFile':                 'Ouvrir le fichier',
    'log.loading':                  'Chargement…',
    'log.empty':                    'mod-loader.log est vide.',
    'log.notFound':                 'mod-loader.log introuvable à :\n{path}',
    'log.truncated':                'Log tronqué aux 2 derniers Mo',
    'install.title':                'Installation manuelle',
    'install.hint':                 'Déposez un ZIP de mod ici, ou cliquez pour parcourir. L’archive doit contenir un fichier modinfo.json (ou .jsonc).',
    'install.drop':                 'Déposez un mod .zip ici',
    'install.or':                   '— ou —',
    'install.browse':               'Parcourir un fichier ZIP…',
    'install.targetLabel':          'Destination d’installation :',
    'install.installing':           'Installation de {name}…',
    'install.uploading':            'Transfert de {name}…',
    'install.success':              '{name} installé.',
    'install.cancelled':            'Annulé.',
    'install.notZip':               'Seules les archives .zip sont supportées.',
    'install.overwriteConfirm':     'Un dossier de mod nommé « {name} » existe déjà. Le remplacer ?',
    'install.dropFailed':           'Le drop n’a livré aucun fichier (votre gestionnaire de fichiers ne supporte peut-être pas le drag-drop dans le webview). Utilisez le bouton Parcourir à la place.',
    'tweak.listHeader':             'Mods configurables',
    'tweak.optionWord':             'options',
    'tweak.noTweakable':            'Aucun de vos mods installés n’expose d’options.',
    'tweak.pickHint':                'Sélectionnez un mod à gauche pour ajuster ses options.',
    'tweak.noOptions':              'Ce mod n’a pas d’options configurables.',
    'tweak.resetMod':               'Réinitialiser ce mod',
    'tweak.resetAll':               'Tout réinitialiser',
    'tweak.resetModConfirm':        'Réinitialiser toutes les options de ce mod aux valeurs par défaut ?',
    'tweak.resetAllConfirm':        'Réinitialiser les options de tous les mods ? Le fichier active-options.jsonc sera supprimé.',
    'news.refresh':                 '↻ Rafraîchir',
    'news.loading':                 'Récupération des dernières actualités…',
    'news.empty':                   'Aucune actualité à afficher.',
    'news.error':                   'Échec de la récupération : {err}',
    'news.cached':                  'en cache (10 min)',
    'news.includeReddit':           'Inclure les posts r/anno',
    'news.visitUnion':              'Ouvrir Anno Union ↗',
  },
};

window.annoApp = function () {
  return {
    // ── State ──────────────────────────────────────────────────────────────
    version: '',
    currentTab: 'activation',
    mods: [],
    selectedModId: null,
    selectedBannerUrl: '',
    _bannerCache: new Map(),
    search: '',
    profileName: 'Default',
    presets: [],                // user-saved preset names (filled by refreshMods)
    sortBy: 'status',           // 'status' | 'category' | 'name'
    sortDir: 1,                 // 1 = asc, -1 = desc, 0 = unsorted (status only)
    mode: 'manage',             // 'manage' | 'order'
    profileOrder: [],           // mod ids in active-profile.txt order (Load Order view)
    _dragId: null,              // id of the row currently being dragged
    languages: [],              // [{key, name, flag}, ...] from the backend
    currentLang: 'english',     // selected language key
    langOpen: false,            // popover open state
    settings: {},               // mirror of the persisted settings.json
    pathsInfo: {},              // resolved paths from the backend (Settings tab)
    log: { content: '', path: '', exists: false, truncated: false, loaded: false },
    _logTimer: null,            // setInterval id while the Log tab is open
    install: { busy: false, message: '', error: false, dragOver: false },
    _dragDepth: 0,              // dragenter counter — kills the flicker that
                                // happens when the cursor crosses child nodes
    tweak: {
      mods: [],                 // [{id, name, category, folder, option_count}, ...]
      selectedId: null,
      schema: {},               // current selected mod's options schema
      values: {},               // current values (saved or default per option)
      saving: '',               // key being saved (lights up the row briefly)
    },
    news: { items: [], loading: false, error: '', cached: false, loaded: false },
    _newsTimer: null,           // background poll started on first News open

    // Sidebar tab definitions (icons stay text-glyph for the POC; phase 2 will
    // swap them for the data/ui/4k icon set the Tk version already uses).
    // Static tab metadata; the human-readable label is computed live from the
    // translation table so the labels swap when the language changes.
    _tabsRaw: [
      { id: 'activation',   key: 'tab.activation',   img: 'icons/activation.png',  group: 'mods' },
      { id: 'browser',      key: 'tab.browser',      img: 'icons/browser.png',     group: 'mods', disabled: true },
      { id: 'collections',  key: 'tab.collections',  img: 'icons/collections.png', group: 'mods', disabled: true },
      { id: 'install',      key: 'tab.install',      img: 'icons/install.png',     group: 'mods' },
      { id: 'news',         key: 'tab.news',         img: 'icons/news.png',        group: 'tools' },
      { id: 'log',          key: 'tab.log',          img: 'icons/log.png',         group: 'tools' },
      { id: 'tweak',        key: 'tab.tweak',        img: 'icons/tweak.png',       group: 'tools' },
      // Settings lives in the bottom HUD row (gear circle), not the tab pill.
    ],
    get tabs() {
      return this._tabsRaw.map((t) => ({ ...t, label: this.t(t.key) }));
    },

    // ── Lifecycle ──────────────────────────────────────────────────────────
    async init() {
      // Stop the webview from navigating to a file when the user drops it
      // outside the install zone — without this, dropping a .zip anywhere on
      // the page makes WebKit2GTK try to open the file as a new document.
      document.addEventListener('dragover', (e) => { e.preventDefault(); }, false);
      document.addEventListener('drop', (e) => {
        // If the drop happened on the install zone, its own handler runs
        // first and we already preventDefault'd there. This catches drops
        // anywhere else.
        e.preventDefault();
      }, false);

      // pywebview injects window.pywebview.api asynchronously; wait for it.
      await this.waitForApi();
      const info = await window.pywebview.api.app_info();
      this.version = info.version;
      try {
        this.languages = await window.pywebview.api.get_languages();
        this.currentLang = await window.pywebview.api.get_language();
      } catch (e) {
        console.error('language init failed:', e);
      }
      await this.refreshMods();
      // Refresh contextual data each time the user opens a tab that needs it.
      // For the log we also kick off a 2-second poll so the user sees new
      // entries land while the game is running, and stop the poll the moment
      // they navigate away.
      this.$watch('currentTab', (next, prev) => {
        if (next === 'settings') this.refreshSettings();
        if (next === 'tweak')    this.refreshTweakable();
        if (next === 'news' && !this.news.loaded) this.refreshNews(false);
        if (next === 'log') {
          this.refreshLog();
          this._stopLogPolling();
          this._logTimer = setInterval(() => this.refreshLog(), 2000);
        }
        if (prev === 'log' && next !== 'log') {
          this._stopLogPolling();
        }
      });
    },

    async refreshNews(force) {
      this.news = { ...this.news, loading: true, error: '' };
      try {
        const res = await window.pywebview.api.fetch_news(!!force);
        if (res && res.ok) {
          this.news = {
            items: res.items || [],
            cached: !!res.cached,
            loading: false,
            loaded: true,
            error: '',
          };
        } else {
          this.news = { ...this.news, loading: false, loaded: true,
                        error: (res && res.error) || 'fetch failed' };
        }
      } catch (e) {
        console.error('fetch_news threw:', e);
        this.news = { ...this.news, loading: false, loaded: true, error: String(e) };
      }
      // First time we fetch, kick off a 5-minute background poll so the
      // feed stays fresh even when the user is on another tab. Subsequent
      // fetches reuse the same timer (TTL on the Python cache prevents
      // hammering when force=false).
      if (!this._newsTimer) {
        this._newsTimer = setInterval(() => this.refreshNews(true), 5 * 60 * 1000);
      }
    },

    _stopLogPolling() {
      if (this._logTimer) {
        clearInterval(this._logTimer);
        this._logTimer = null;
      }
    },

    async refreshLog() {
      try {
        const res = await window.pywebview.api.read_modloader_log();
        this.log = {
          content: (res && res.content) || '',
          path:    (res && res.path) || '',
          exists:  !!(res && res.exists),
          truncated: !!(res && res.truncated),
          loaded:  true,
        };
      } catch (e) {
        console.error('read_modloader_log failed:', e);
        this.log = { content: '', path: '', exists: false, truncated: false, loaded: true };
      }
    },

    async copyLogToClipboard() {
      try {
        await navigator.clipboard.writeText(this.log.content || '');
      } catch (e) {
        // Older webkit2gtk fallback — drop into a textarea + execCommand.
        const ta = document.createElement('textarea');
        ta.value = this.log.content || '';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
    },

    get currentLanguage() {
      return this.languages.find((l) => l.key === this.currentLang) || null;
    },

    /** Localised string lookup. Falls back to English if the active language
     *  doesn't have the key, and finally to the key itself so missing
     *  translations surface visibly. ``vars`` interpolates {placeholder}
     *  tokens. */
    t(key, vars) {
      const en = TRANSLATIONS.english[key];
      const localized = (TRANSLATIONS[this.currentLang] && TRANSLATIONS[this.currentLang][key]) || en || key;
      if (!vars) return localized;
      return localized.replace(/\{(\w+)\}/g, (_, name) =>
        (vars[name] !== undefined ? String(vars[name]) : `{${name}}`));
    },

    async selectLanguage(key) {
      this.langOpen = false;
      if (key === this.currentLang) return;
      this.currentLang = key;
      try {
        const res = await window.pywebview.api.set_language(key);
        if (!res || !res.ok) {
          console.error('set_language failed:', res && res.error);
        }
      } catch (e) {
        console.error('set_language threw:', e);
      }
    },

    // ── Settings ────────────────────────────────────────────────────────────
    async refreshSettings() {
      try {
        this.settings = (await window.pywebview.api.get_settings()) || {};
        this.pathsInfo = (await window.pywebview.api.get_paths_info()) || {};
      } catch (e) {
        console.error('refresh settings failed:', e);
      }
    },

    async setSetting(key, value) {
      try {
        const res = await window.pywebview.api.update_setting(key, value);
        if (!res || !res.ok) {
          console.error('update_setting failed:', res && res.error);
          return;
        }
        this.settings[key] = value;
      } catch (e) {
        console.error('update_setting threw:', e);
      }
    },

    async pickGamePath(asFile) {
      try {
        const path = asFile
          ? await window.pywebview.api.pick_file('Sélectionner Anno117.exe',
              ['Anno executable (Anno117.exe;*.exe)'])
          : await window.pywebview.api.pick_folder('Sélectionner le dossier d\'installation');
        if (!path) return;
        const res = await window.pywebview.api.set_game_path(path);
        if (!res || !res.ok) {
          alert(this.t('settings.pathError', { err: (res && res.error) || '?' }));
          return;
        }
        await this.refreshSettings();
        await this.refreshMods();
      } catch (e) {
        console.error('pickGamePath threw:', e);
      }
    },

    async detectGamePath() {
      try {
        const res = await window.pywebview.api.detect_game_path();
        if (!res || !res.ok) {
          alert(this.t('settings.detectError', { err: (res && res.error) || '?' }));
          return;
        }
        await this.refreshSettings();
        await this.refreshMods();
      } catch (e) {
        console.error('detect_game_path threw:', e);
      }
    },

    async pickDocsPath() {
      try {
        const path = await window.pywebview.api.pick_folder('Sélectionner le dossier Documents');
        if (!path) return;
        const res = await window.pywebview.api.set_custom_docs_path(path);
        if (!res || !res.ok) {
          alert(this.t('settings.pathError', { err: (res && res.error) || '?' }));
          return;
        }
        await this.refreshSettings();
        await this.refreshMods();
      } catch (e) {
        console.error('pickDocsPath threw:', e);
      }
    },

    async clearDocsPath() {
      try {
        await window.pywebview.api.set_custom_docs_path('');
        await this.refreshSettings();
        await this.refreshMods();
      } catch (e) {
        console.error('clearDocsPath threw:', e);
      }
    },

    async saveModioKey(value) {
      const trimmed = (value || '').trim();
      if (!trimmed) {
        alert(this.t('settings.modio.emptyKey'));
        return;
      }
      await this.setSetting('modio_api_key', trimmed);
      await this.refreshSettings();
    },

    async clearModioKey() {
      if (!confirm(this.t('settings.modio.disconnectConfirm'))) return;
      await this.setSetting('modio_api_key', '');
      await this.refreshSettings();
    },

    // ── Manual install ──────────────────────────────────────────────────────
    async pickAndInstall() {
      try {
        const path = await window.pywebview.api.pick_file(
          'Sélectionner le fichier ZIP du mod',
          ['ZIP archive (*.zip)']);
        if (!path) return;
        const display = path.split(/[\\/]/).pop();
        await this._performInstall(
          (allow) => window.pywebview.api.install_zip_from_path(path, allow),
          display);
      } catch (e) {
        console.error('pickAndInstall threw:', e);
      }
    },

    onZipDragEnter(ev) {
      ev.preventDefault();
      this._dragDepth += 1;
      this.install.dragOver = true;
      console.log('[install] dragenter, depth=', this._dragDepth,
                  'types=', ev.dataTransfer && Array.from(ev.dataTransfer.types || []));
    },

    onZipDragOver(ev) {
      ev.preventDefault();
      // dropEffect must be set on every dragover for the cursor to show "+"
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
    },

    onZipDragLeave(ev) {
      this._dragDepth = Math.max(0, this._dragDepth - 1);
      if (this._dragDepth === 0) this.install.dragOver = false;
    },

    onZipDrop(ev) {
      // The actual install happens in app.py via pywebview's DOM event
      // bridge (see _on_native_drop). Here we just reset the drag visual.
      // ev.preventDefault is enforced at document level by the Python handler.
      this._dragDepth = 0;
      this.install.dragOver = false;
    },

    /** Called from Python (via window.evaluate_js) when a native file drop
     *  is detected anywhere in the app. We switch to the Install tab so the
     *  status banner is visible, then mark the install as busy. */
    onNativeDropStart(name) {
      this.currentTab = 'install';
      this.install = { ...this.install, busy: true, error: false,
                       message: this.t('install.installing', { name }) };
    },

    /** Called from Python with the install result and the source ZIP path.
     *  Handles the overwrite-confirm round-trip back through the JS API. */
    async onNativeDropResult(res, path) {
      const display = (path || '').split(/[\\/]/).pop() || '';
      if (res && !res.ok && res.exists_already) {
        this.install.busy = false;
        if (!confirm(this.t('install.overwriteConfirm', { name: res.folder || display }))) {
          this._setInstallStatus(this.t('install.cancelled'), true);
          return;
        }
        this.install.busy = true;
        try {
          res = await window.pywebview.api.install_zip_from_path(path, true);
        } catch (e) {
          this._setInstallStatus(String(e), true);
          return;
        }
      }
      if (!res || !res.ok) {
        this._setInstallStatus((res && res.error) || 'unknown error', true);
        return;
      }
      this._setInstallStatus(this.t('install.success', { name: res.folder || display }), false);
      await this.refreshMods();
    },

    /** ``callFactory`` is invoked with a boolean ``allow_overwrite`` so we can
     *  retry the same operation cleanly when the user agrees to overwrite an
     *  existing mod folder. */
    async _performInstall(callFactory, displayName) {
      this.install = { ...this.install, busy: true, error: false,
                       message: this.t('install.installing', { name: displayName }) };
      try {
        let res = await callFactory(false);
        if (res && !res.ok && res.exists_already) {
          this.install.busy = false;
          if (!confirm(this.t('install.overwriteConfirm', { name: res.folder || displayName }))) {
            this._setInstallStatus(this.t('install.cancelled'), true);
            return;
          }
          this.install.busy = true;
          res = await callFactory(true);
        }
        if (!res || !res.ok) {
          this._setInstallStatus((res && res.error) || 'unknown error', true);
          return;
        }
        this._setInstallStatus(this.t('install.success', { name: res.folder || displayName }), false);
        await this.refreshMods();
      } catch (e) {
        this._setInstallStatus(String(e), true);
      } finally {
        this.install.busy = false;
      }
    },

    _setInstallStatus(message, isError) {
      this.install = { ...this.install, message, error: !!isError, busy: false };
    },

    _fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // dataURL prefix → "data:<mime>;base64,<payload>" — strip the head
          const s = String(reader.result || '');
          const comma = s.indexOf(',');
          resolve(comma === -1 ? s : s.slice(comma + 1));
        };
        reader.onerror = () => reject(reader.error || new Error('read failed'));
        reader.readAsDataURL(file);
      });
    },

    // ── Tweaking ────────────────────────────────────────────────────────────
    async refreshTweakable() {
      try {
        this.tweak.mods = await window.pywebview.api.list_tweakable_mods();
      } catch (e) {
        console.error('list_tweakable_mods failed:', e);
        this.tweak.mods = [];
      }
      // If nothing is selected and we have at least one mod, auto-select it
      if (!this.tweak.selectedId && this.tweak.mods.length) {
        await this.selectTweakMod(this.tweak.mods[0].id);
      } else if (this.tweak.selectedId) {
        // Refresh the schema/values for the currently selected mod
        await this.selectTweakMod(this.tweak.selectedId);
      }
    },

    async selectTweakMod(id) {
      this.tweak.selectedId = id;
      try {
        const res = await window.pywebview.api.get_mod_options(id);
        if (res && res.ok) {
          this.tweak.schema = res.schema || {};
          this.tweak.values = res.values || {};
        } else {
          this.tweak.schema = {};
          this.tweak.values = {};
        }
      } catch (e) {
        console.error('get_mod_options failed:', e);
      }
    },

    async setTweakOption(key, value) {
      const id = this.tweak.selectedId;
      if (!id) return;
      // Optimistic local update + brief saving indicator on the row
      this.tweak.values[key] = value;
      this.tweak.saving = key;
      try {
        await window.pywebview.api.set_mod_option(id, key, value);
      } catch (e) {
        console.error('set_mod_option failed:', e);
      } finally {
        // Clear the saving flag after a short tick so the visual cue is visible
        setTimeout(() => { if (this.tweak.saving === key) this.tweak.saving = ''; }, 300);
      }
    },

    async resetTweakMod() {
      const id = this.tweak.selectedId;
      if (!id) return;
      if (!confirm(this.t('tweak.resetModConfirm'))) return;
      try {
        await window.pywebview.api.reset_mod_options(id);
        await this.selectTweakMod(id);  // re-fetch defaults
      } catch (e) {
        console.error('reset_mod_options failed:', e);
      }
    },

    async resetAllTweaks() {
      if (!confirm(this.t('tweak.resetAllConfirm'))) return;
      try {
        await window.pywebview.api.reset_all_options();
        if (this.tweak.selectedId) await this.selectTweakMod(this.tweak.selectedId);
      } catch (e) {
        console.error('reset_all_options failed:', e);
      }
    },

    async openExternalUrl(url) {
      // open_path delegates to xdg-open / startfile / open which all handle
      // https:// URLs in addition to local paths.
      try {
        await window.pywebview.api.open_path(url);
      } catch (e) {
        console.error('openExternalUrl threw:', e);
      }
    },

    waitForApi() {
      return new Promise((resolve) => {
        if (window.pywebview && window.pywebview.api) return resolve();
        window.addEventListener('pywebviewready', resolve, { once: true });
      });
    },

    // ── Mods ───────────────────────────────────────────────────────────────
    async refreshMods() {
      try {
        this.mods = await window.pywebview.api.list_mods();
      } catch (e) {
        console.error('list_mods failed', e);
        this.mods = [];
      }
      try {
        this.presets = await window.pywebview.api.list_presets();
      } catch (e) {
        console.error('list_presets failed', e);
        this.presets = [];
      }
    },

    async switchProfile(name) {
      if (!name) return;
      try {
        const res = await window.pywebview.api.load_preset(name);
        if (!res || !res.ok) {
          alert('Échec du chargement du preset : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = name;
        await this.refreshMods();
      } catch (e) {
        console.error('load_preset threw:', e);
      }
    },

    async createPreset() {
      const name = prompt(this.t('profile.promptName'));
      if (!name) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const res = await window.pywebview.api.save_preset(trimmed);
        if (!res || !res.ok) {
          alert('Échec de la sauvegarde : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = trimmed;
        await this.refreshMods();
      } catch (e) {
        console.error('save_preset threw:', e);
      }
    },

    async deletePreset() {
      const name = this.profileName;
      if (!name || name === 'Default' || name === 'Vanilla') {
        alert(this.t('profile.cantDeleteReserved'));
        return;
      }
      if (!confirm(this.t('profile.deleteConfirm', { name }))) return;
      try {
        const res = await window.pywebview.api.delete_preset(name);
        if (!res || !res.ok) {
          alert('Échec de la suppression : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = 'Default';
        await this.refreshMods();
      } catch (e) {
        console.error('delete_preset threw:', e);
      }
    },

    // The list excludes sub-mods from top-level rows; sub-mods will be shown
    // indented beneath their parent in renderModRows.
    get topLevelMods() {
      return this.mods.filter((m) => !m.parent_path);
    },

    get categories() {
      const set = new Set();
      this.topLevelMods.forEach((m) => { if (m.category) set.add(m.category); });
      return [...set].sort((a, b) => a.localeCompare(b));
    },

    get filteredMods() {
      const q = this.search.trim().toLowerCase();
      let out = this.topLevelMods;
      if (this.filterCategory) {
        out = out.filter((m) => m.category === this.filterCategory);
      }
      if (q) {
        out = out.filter((m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.category || '').toLowerCase().includes(q)
        );
      }
      // Sort — copy first so we don't mutate the underlying mods array.
      const dir = this.sortDir;
      const key = this.sortBy;
      const sorted = [...out];
      if (key === 'status' && dir !== 0) {
        sorted.sort((a, b) => (Number(b.active) - Number(a.active)) * dir);
      } else if (key === 'name' && dir !== 0) {
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '') * dir);
      } else if (key === 'category' && dir !== 0) {
        sorted.sort((a, b) => ((a.category || '').localeCompare(b.category || '') * dir)
                              || (a.name || '').localeCompare(b.name || ''));
      }
      return sorted;
    },

    subModsOf(parentPath) {
      return this.mods.filter((m) => m.parent_path === parentPath);
    },

    get selectedMod() {
      return this.mods.find((m) => m.id === this.selectedModId) || null;
    },

    get activeCount() {
      return this.topLevelMods.filter((m) => m.active).length;
    },

    get totalSizeBytes() {
      return this.topLevelMods.reduce((s, m) => s + (m.size_bytes || 0), 0);
    },

    get activeSizeBytes() {
      return this.topLevelMods.filter((m) => m.active).reduce((s, m) => s + (m.size_bytes || 0), 0);
    },

    /** 'all' if every top-level mod is active, 'none' if none are, otherwise
     *  'partial' — used to drive the tri-state header checkbox. */
    get headerSelectionState() {
      const top = this.topLevelMods;
      if (!top.length) return 'none';
      const active = top.filter((m) => m.active).length;
      if (active === 0) return 'none';
      if (active === top.length) return 'all';
      return 'partial';
    },

    async toggleAllFromHeader() {
      // 'all' → deactivate everything, otherwise activate everything (common
      // sense: if some are off, the user usually wants them all on).
      const next = this.headerSelectionState !== 'all';
      await this.setAllActive(next);
    },

    formatSize(bytes) {
      if (!bytes) return '0 KB';
      const mb = bytes / (1024 * 1024);
      if (mb >= 1) return `${mb.toFixed(1)} MB`;
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    },

    async toggleMod(id) {
      const mod = this.mods.find((m) => m.id === id);
      if (!mod) return;
      const next = !mod.active;
      // Optimistic UI update — flip immediately, then call Python. If the
      // backend reports failure we roll back so the checkbox stays in sync
      // with the file on disk.
      mod.active = next;
      try {
        const res = await window.pywebview.api.toggle_mod(id, next);
        if (!res || !res.ok) {
          mod.active = !next;
          console.error('toggle_mod failed:', res && res.error);
        }
      } catch (e) {
        mod.active = !next;
        console.error('toggle_mod threw:', e);
      }
    },

    async setAllActive(active) {
      try {
        const res = await window.pywebview.api.set_all_active(active);
        if (!res || !res.ok) {
          console.error('set_all_active failed:', res && res.error);
          return;
        }
        await this.refreshMods();
      } catch (e) {
        console.error('set_all_active threw:', e);
      }
    },

    async openModFolder(path) {
      if (!path) return;
      try {
        await window.pywebview.api.open_path(path);
      } catch (e) {
        console.error('open_path threw:', e);
      }
    },

    async openModsFolder() {
      try {
        const res = await window.pywebview.api.open_mods_folder();
        if (!res || !res.ok) {
          console.error('open_mods_folder failed:', res && res.error);
        }
      } catch (e) {
        console.error('open_mods_folder threw:', e);
      }
    },

    setSort(col) {
      // Status cycles between active-first / inactive-first; the other columns
      // cycle asc → desc → off so users can disable a sort to fall back to
      // the previous one.
      if (this.sortBy === col) {
        if (col === 'status') {
          this.sortDir = this.sortDir === 1 ? -1 : 1;
        } else {
          this.sortDir = this.sortDir === 1 ? -1 : (this.sortDir === -1 ? 0 : 1);
          if (this.sortDir === 0) this.sortBy = 'status';
        }
      } else {
        this.sortBy = col;
        this.sortDir = 1;
      }
    },

    sortIndicator(col) {
      if (this.sortBy !== col) return '';
      if (this.sortDir === 1) return '▲';
      if (this.sortDir === -1) return '▼';
      return '';
    },

    async setMode(m) {
      this.mode = m;
      if (m === 'order') {
        await this.refreshProfileOrder();
      }
    },

    async refreshProfileOrder() {
      try {
        this.profileOrder = await window.pywebview.api.get_profile_order();
      } catch (e) {
        console.error('get_profile_order failed:', e);
        this.profileOrder = [];
      }
    },

    /** In 'order' mode, list mods following the profile's actual line order.
     *  Mods that aren't yet recorded in the file are appended at the end
     *  (sorted by name) so newly-installed mods don't disappear from view. */
    get orderedTopLevelMods() {
      const top = this.topLevelMods;
      const idToMod = new Map(top.map((m) => [m.id, m]));
      const out = [];
      const seen = new Set();
      for (const id of this.profileOrder) {
        if (idToMod.has(id) && !seen.has(id)) {
          out.push(idToMod.get(id));
          seen.add(id);
        }
      }
      const remaining = top.filter((m) => !seen.has(m.id))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return out.concat(remaining);
    },

    onDragStart(id, ev) {
      this._dragId = id;
      ev.dataTransfer.effectAllowed = 'move';
      // Some browsers require dataTransfer.setData to actually start the drag
      try { ev.dataTransfer.setData('text/plain', id); } catch (_) {}
    },

    onDragOver(ev) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    },

    async onDrop(targetId, ev) {
      ev.preventDefault();
      const draggedId = this._dragId;
      this._dragId = null;
      if (!draggedId || draggedId === targetId) return;
      // Reorder profileOrder locally
      const order = this.orderedTopLevelMods.map((m) => m.id);
      const fromIdx = order.indexOf(draggedId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, draggedId);
      this.profileOrder = order;
      // Persist
      try {
        const res = await window.pywebview.api.reorder_mods(order);
        if (!res || !res.ok) {
          console.error('reorder_mods failed:', res && res.error);
          await this.refreshProfileOrder();
        }
      } catch (e) {
        console.error('reorder_mods threw:', e);
      }
    },

    onDragEnd() {
      this._dragId = null;
    },

    async uninstallMod(folder, name) {
      if (!folder) return;
      if (!confirm(this.t('detail.uninstallConfirm', { name }))) return;
      try {
        const res = await window.pywebview.api.uninstall_mod(folder);
        if (!res || !res.ok) {
          alert('Échec de la désinstallation : ' + ((res && res.error) || 'erreur inconnue'));
          return;
        }
        if (this.selectedMod && this.selectedMod.folder === folder) {
          this.selectedModId = null;
        }
        await this.refreshMods();
      } catch (e) {
        console.error('uninstall_mod threw:', e);
      }
    },

    async fetchBannerForSelected() {
      const mod = this.selectedMod;
      if (!mod) { this.selectedBannerUrl = ''; return; }
      if (this._bannerCache.has(mod.id)) {
        this.selectedBannerUrl = this._bannerCache.get(mod.id);
        return;
      }
      this.selectedBannerUrl = '';
      if (!mod.banner) return;
      try {
        const res = await window.pywebview.api.get_mod_banner(mod.id);
        const url = (res && res.ok && res.data_url) || '';
        this._bannerCache.set(mod.id, url);
        if (this.selectedMod && this.selectedMod.id === mod.id) {
          this.selectedBannerUrl = url;
        }
      } catch (e) {
        console.error('get_mod_banner threw:', e);
      }
    },

    selectMod(id) {
      this.selectedModId = id;
      this.fetchBannerForSelected();
    },

    async launchGame() {
      try {
        const res = await window.pywebview.api.launch_game();
        if (!res || !res.ok) {
          console.error('launch_game failed:', res && res.error);
          alert(this.t('launch.error', { err: (res && res.error) || '?' }));
        }
      } catch (e) {
        console.error('launch_game threw:', e);
      }
    },

    // ── Templates ──────────────────────────────────────────────────────────
    renderTab(tab) {
      switch (tab) {
        case 'activation': return this.activationTemplate();
        case 'settings':   return this.settingsTemplate();
        case 'log':        return this.logTemplate();
        case 'install':    return this.installTemplate();
        case 'tweak':      return this.tweakingTemplate();
        case 'news':       return this.newsTemplate();
        default:           return this.placeholderTemplate(tab);
      }
    },

    placeholderTemplate(tab) {
      return `
        <div class="placeholder">
          <div class="placeholder__inner">
            <div class="ornament">───── ◆ ─────</div>
            <p>${escapeHtml(this.t('tab.placeholder'))}</p>
            <p class="placeholder__hint">${escapeHtml(this.t('tab.placeholderHint', { tab: this.t('tab.activation') }))}</p>
          </div>
        </div>`;
    },

    newsTemplate() {
      const n = this.news;

      const toolbar = `
        <div class="news__toolbar">
          <button class="settings__btn"
                  ${n.loading ? 'disabled' : ''}
                  onclick="annoRoot().refreshNews(true)">
            ${escapeHtml(this.t(n.loading ? 'news.loading' : 'news.refresh'))}
          </button>
          <label class="news__toggle">
            <input type="checkbox" ${this.settings.show_reddit_news ? 'checked' : ''}
                   onchange="annoRoot().setSetting('show_reddit_news', this.checked).then(() => annoRoot().refreshNews(true))" />
            <span>${escapeHtml(this.t('news.includeReddit'))}</span>
          </label>
          <button class="settings__btn"
                  onclick="annoRoot().openExternalUrl('https://www.anno-union.com/en/blogs/')">
            ${escapeHtml(this.t('news.visitUnion'))}
          </button>
          ${n.cached ? `<span class="news__cached">${escapeHtml(this.t('news.cached'))}</span>` : ''}
        </div>`;

      let body;
      if (n.loading && !n.items.length) {
        body = `<div class="news__empty">${escapeHtml(this.t('news.loading'))}</div>`;
      } else if (n.error) {
        body = `<div class="news__empty news__empty--error">${escapeHtml(this.t('news.error', { err: n.error }))}</div>`;
      } else if (!n.items.length) {
        body = `<div class="news__empty">${escapeHtml(this.t('news.empty'))}</div>`;
      } else {
        body = `<div class="news__grid">${n.items.map((item) => `
          <article class="news-card"
                   onclick="annoRoot().openExternalUrl('${escapeAttr(item.url || '')}')">
            ${item.img_url
                ? `<div class="news-card__media"><img src="${escapeAttr(item.img_url)}" alt="" loading="lazy" /></div>`
                : `<div class="news-card__media news-card__media--placeholder"><span>📜</span></div>`}
            <div class="news-card__body">
              <div class="news-card__meta">
                <span class="news-card__badge"
                      style="background: ${escapeAttr(item.badge_color || '#444')}">${escapeHtml(item.badge_text || '?')}</span>
                <span class="news-card__date">${escapeHtml(item.date || '')}</span>
              </div>
              <h3 class="news-card__title">${escapeHtml(item.title || '')}</h3>
              ${item.excerpt
                  ? `<p class="news-card__excerpt">${escapeHtml(item.excerpt)}</p>`
                  : ''}
            </div>
          </article>`).join('')}</div>`;
      }

      return `
        <div class="news">
          ${toolbar}
          <div class="news__body">${body}</div>
        </div>`;
    },

    tweakingTemplate() {
      const t = this.tweak;
      const selected = t.mods.find((m) => m.id === t.selectedId) || null;

      // Left list of tweakable mods
      const list = t.mods.length ? t.mods.map((m) => `
        <li class="tweak-list__item ${m.id === t.selectedId ? 'is-selected' : ''}"
            onclick="annoRoot().selectTweakMod('${escapeAttr(m.id)}')">
          <div class="tweak-list__name">${escapeHtml(m.name)}</div>
          <div class="tweak-list__meta">${escapeHtml(m.category || '—')} · ${m.option_count} ${escapeHtml(this.t('tweak.optionWord'))}</div>
        </li>`).join('') : `<li class="tweak-list__empty">${escapeHtml(this.t('tweak.noTweakable'))}</li>`;

      // Right panel: dynamic form built from the schema
      let form;
      if (!selected) {
        form = `<div class="tweak-form__empty">
                  <div class="ornament">───── ◆ ─────</div>
                  ${escapeHtml(this.t('tweak.pickHint'))}
                </div>`;
      } else if (!Object.keys(t.schema).length) {
        form = `<div class="tweak-form__empty">${escapeHtml(this.t('tweak.noOptions'))}</div>`;
      } else {
        const rows = Object.entries(t.schema).map(([key, spec]) => {
          if (!spec || typeof spec !== 'object') return '';
          const label = spec.label || key;
          const type = (spec.type || 'text').toLowerCase();
          const labels = Array.isArray(spec.labels) ? spec.labels : [];
          const values = Array.isArray(spec.values) ? spec.values : [];
          const current = t.values[key] !== undefined ? String(t.values[key]) : String(spec.default ?? '');
          const savingCls = t.saving === key ? 'is-saving' : '';
          let control = '';
          let hint = '';

          if (type === 'enum') {
            control = `
              <select class="tweak-control"
                      onchange="annoRoot().setTweakOption('${escapeAttr(key)}', this.value)">
                ${values.map((v, i) => {
                  const sel = String(v) === current ? ' selected' : '';
                  const lbl = labels[i] || v;
                  return `<option value="${escapeAttr(String(v))}"${sel}>${escapeHtml(String(lbl))}</option>`;
                }).join('')}
              </select>`;
            const idx = values.indexOf(current) >= 0 ? values.indexOf(current) : values.findIndex((v) => String(v) === current);
            if (idx >= 0 && labels[idx]) hint = String(labels[idx]);

          } else if (type === 'slider') {
            const min = parseFloat(values[0]) || 0;
            const max = parseFloat(values[1]) || 100;
            const step = parseFloat(values[2]) || 1;
            const num = parseFloat(current);
            const safe = isFinite(num) ? Math.max(min, Math.min(max, num)) : min;
            control = `
              <div class="tweak-slider">
                <span class="tweak-slider__bound">${min}</span>
                <input type="range"
                       min="${min}" max="${max}" step="${step}"
                       value="${safe}"
                       oninput="this.nextElementSibling.textContent = this.value"
                       onchange="annoRoot().setTweakOption('${escapeAttr(key)}', this.value)" />
                <span class="tweak-slider__value">${safe}</span>
                <span class="tweak-slider__bound">${max}</span>
              </div>`;
            if (labels.length) hint = String(labels[0]);

          } else if (type === 'toggle') {
            const isOn = String(current).toLowerCase() === 'true';
            control = `
              <label class="tweak-toggle">
                <input type="checkbox" ${isOn ? 'checked' : ''}
                       onchange="annoRoot().setTweakOption('${escapeAttr(key)}', this.checked ? 'true' : 'false')" />
                <span class="tweak-toggle__pill ${isOn ? 'is-on' : ''}">
                  <span class="tweak-toggle__dot"></span>
                </span>
                <span class="tweak-toggle__text">${isOn ? 'ON' : 'OFF'}</span>
              </label>`;
            const lbl = labels[isOn ? 0 : 1];
            if (lbl) hint = String(lbl);

          } else { // text fallback
            control = `
              <input class="tweak-control" type="text"
                     value="${escapeAttr(current)}"
                     onchange="annoRoot().setTweakOption('${escapeAttr(key)}', this.value)" />`;
            if (labels.length) hint = String(labels[0]);
          }

          return `
            <div class="tweak-row ${savingCls}">
              <div class="tweak-row__label">${escapeHtml(label)}</div>
              ${control}
              ${hint ? `<div class="tweak-row__hint">${escapeHtml(hint)}</div>` : ''}
            </div>`;
        }).join('');

        form = `
          <div class="tweak-form__header">
            <h3 class="tweak-form__title">${escapeHtml(selected.name)}</h3>
            <button class="settings__btn settings__btn--danger settings__btn--small"
                    onclick="annoRoot().resetTweakMod()">${escapeHtml(this.t('tweak.resetMod'))}</button>
          </div>
          <div class="tweak-form__rows">${rows}</div>`;
      }

      return `
        <div class="tweak">
          <aside class="tweak-list">
            <div class="tweak-list__header">
              <span>${escapeHtml(this.t('tweak.listHeader'))}</span>
              <button class="settings__btn settings__btn--small"
                      ${t.mods.length ? '' : 'disabled'}
                      onclick="annoRoot().resetAllTweaks()">${escapeHtml(this.t('tweak.resetAll'))}</button>
            </div>
            <ul>${list}</ul>
          </aside>
          <section class="tweak-form">${form}</section>
        </div>`;
    },

    installTemplate() {
      const i = this.install;
      const dropClasses = ['install__drop'];
      if (i.dragOver) dropClasses.push('is-over');
      if (i.busy)     dropClasses.push('is-busy');

      const status = i.message
        ? `<div class="install__status ${i.error ? 'is-error' : 'is-ok'}">${escapeHtml(i.message)}</div>`
        : '';

      return `
        <div class="install">
          <div class="install__inner">
            <h2 class="install__title">${escapeHtml(this.t('install.title'))}</h2>
            <p class="install__hint">${escapeHtml(this.t('install.hint'))}</p>

            <div class="${dropClasses.join(' ')}"
                 ondragenter="annoRoot().onZipDragEnter(event)"
                 ondragover="annoRoot().onZipDragOver(event)"
                 ondragleave="annoRoot().onZipDragLeave(event)"
                 ondrop="annoRoot().onZipDrop(event)"
                 onclick="annoRoot().pickAndInstall()">
              <div class="install__drop-icon">⤓</div>
              <div class="install__drop-line">${escapeHtml(this.t('install.drop'))}</div>
              <div class="install__drop-sub">${escapeHtml(this.t('install.or'))}</div>
              <button class="settings__btn settings__btn--accent install__pick"
                      onclick="event.stopPropagation(); annoRoot().pickAndInstall()">
                ${escapeHtml(this.t('install.browse'))}
              </button>
            </div>

            ${status}

            <div class="install__targets">
              <div><span>${escapeHtml(this.t('install.targetLabel'))}</span>
                <code>${escapeHtml(this.pathsInfo.documents_mods_root || (this.settings.mod_location_mode === 'GameDirectory'
                  ? (this.pathsInfo.game_mods_root || '—') : '—'))}</code>
              </div>
            </div>
          </div>
        </div>`;
    },

    logTemplate() {
      const log = this.log;
      // Colour each line based on its severity token. Stays close to the Tk
      // version's choices (red for error, amber for warn).
      const renderLines = (text) => {
        if (!text) return '';
        return text.split('\n').map((raw) => {
          const upper = raw.toUpperCase();
          let cls = '';
          if (upper.includes('[ERRO') || upper.includes('ERROR')) cls = 'log-line--error';
          else if (upper.includes('WARN')) cls = 'log-line--warn';
          else if (upper.includes('[INFO]')) cls = 'log-line--info';
          return `<div class="log-line ${cls}">${escapeHtml(raw) || '&nbsp;'}</div>`;
        }).join('');
      };

      let body;
      if (!log.loaded) {
        body = `<div class="log-view__empty">${escapeHtml(this.t('log.loading'))}</div>`;
      } else if (!log.exists) {
        body = `<div class="log-view__empty">${escapeHtml(this.t('log.notFound', { path: log.path || '?' }))}</div>`;
      } else if (!log.content) {
        body = `<div class="log-view__empty">${escapeHtml(this.t('log.empty'))}</div>`;
      } else {
        body = renderLines(log.content);
      }

      return `
        <div class="log-view">
          <div class="log-view__toolbar">
            <button class="settings__btn" onclick="annoRoot().refreshLog()">${escapeHtml(this.t('log.refresh'))}</button>
            <button class="settings__btn" onclick="annoRoot().copyLogToClipboard()"
                    ${log.exists && log.content ? '' : 'disabled'}>${escapeHtml(this.t('log.copy'))}</button>
            <button class="settings__btn"
                    ${log.path ? '' : 'disabled'}
                    onclick="annoRoot().openModFolder('${escapeAttr(log.path || '')}')">${escapeHtml(this.t('log.openFile'))}</button>
            <span class="log-view__path" title="${escapeAttr(log.path || '')}">${escapeHtml(log.path || '—')}</span>
            ${log.truncated ? `<span class="log-view__warn">${escapeHtml(this.t('log.truncated'))}</span>` : ''}
          </div>
          <div class="log-view__body">${body}</div>
        </div>`;
    },

    settingsTemplate() {
      const p = this.pathsInfo || {};
      const gameSet = !!(p.game_path && p.game_path_exists);
      const docsSet = !!(p.custom_docs_path && p.custom_docs_path_exists);
      const modLoc = this.settings.mod_location_mode || 'Documents';
      const enableNew = this.settings.enable_new_mods || 'on';
      return `
        <div class="settings">
          <div class="settings__inner">

            <section class="settings__card">
              <h3 class="settings__title">${escapeHtml(this.t('settings.section.paths'))}</h3>

              <div class="settings__row">
                <label class="settings__label">${escapeHtml(this.t('settings.gamePath'))}</label>
                <div class="settings__field">
                  <input class="settings__input" type="text" readonly
                         value="${escapeAttr(p.game_path || '')}"
                         placeholder="${escapeAttr(this.t('settings.gamePath.empty'))}" />
                  <span class="settings__status ${gameSet ? 'is-ok' : 'is-bad'}">${gameSet ? '✓' : '✕'}</span>
                </div>
                <div class="settings__actions">
                  <button class="settings__btn" onclick="annoRoot().pickGamePath(true)">${escapeHtml(this.t('settings.browseFile'))}</button>
                  <button class="settings__btn" onclick="annoRoot().pickGamePath(false)">${escapeHtml(this.t('settings.browseFolder'))}</button>
                  <button class="settings__btn settings__btn--accent" onclick="annoRoot().detectGamePath()">${escapeHtml(this.t('settings.autoDetect'))}</button>
                </div>
              </div>

              <div class="settings__row">
                <label class="settings__label">${escapeHtml(this.t('settings.docsPath'))}</label>
                <div class="settings__field">
                  <input class="settings__input" type="text" readonly
                         value="${escapeAttr(p.custom_docs_path || '')}"
                         placeholder="${escapeAttr(this.t('settings.docsPath.empty'))}" />
                  <span class="settings__status ${docsSet ? 'is-ok' : ''}">${docsSet ? '✓' : '–'}</span>
                </div>
                <div class="settings__actions">
                  <button class="settings__btn" onclick="annoRoot().pickDocsPath()">${escapeHtml(this.t('settings.browseFolder'))}</button>
                  <button class="settings__btn settings__btn--danger"
                          ${docsSet ? '' : 'disabled'}
                          onclick="annoRoot().clearDocsPath()">${escapeHtml(this.t('settings.clear'))}</button>
                </div>
              </div>

              <div class="settings__derived">
                <div><span>${escapeHtml(this.t('settings.derived.docsMods'))}</span><code>${escapeHtml(p.documents_mods_root || '—')}</code></div>
                <div><span>${escapeHtml(this.t('settings.derived.gameMods'))}</span><code>${escapeHtml(p.game_mods_root || '—')}</code></div>
                <div><span>${escapeHtml(this.t('settings.derived.profile'))}</span><code>${escapeHtml(p.active_profile_path || '—')}</code></div>
              </div>
            </section>

            <section class="settings__card">
              <h3 class="settings__title">${escapeHtml(this.t('settings.section.behaviour'))}</h3>

              <div class="settings__row settings__row--inline">
                <label class="settings__label">${escapeHtml(this.t('settings.modLocation'))}</label>
                <div class="settings__radio-group">
                  <label class="settings__radio">
                    <input type="radio" name="mod_location_mode" value="Documents"
                           ${modLoc === 'Documents' ? 'checked' : ''}
                           onchange="annoRoot().setSetting('mod_location_mode','Documents')" />
                    <span>${escapeHtml(this.t('settings.modLocation.documents'))}</span>
                  </label>
                  <label class="settings__radio">
                    <input type="radio" name="mod_location_mode" value="GameDirectory"
                           ${modLoc === 'GameDirectory' ? 'checked' : ''}
                           onchange="annoRoot().setSetting('mod_location_mode','GameDirectory')" />
                    <span>${escapeHtml(this.t('settings.modLocation.game'))}</span>
                  </label>
                </div>
              </div>

              <div class="settings__row settings__row--inline">
                <label class="settings__label">${escapeHtml(this.t('settings.enableNewMods'))}</label>
                <select class="activation__profile"
                        onchange="annoRoot().setSetting('enable_new_mods', this.value)">
                  <option value="on" ${enableNew === 'on' ? 'selected' : ''}>${escapeHtml(this.t('settings.enableNewMods.on'))}</option>
                  <option value="off" ${enableNew === 'off' ? 'selected' : ''}>${escapeHtml(this.t('settings.enableNewMods.off'))}</option>
                  <option value="keep" ${enableNew === 'keep' ? 'selected' : ''}>${escapeHtml(this.t('settings.enableNewMods.keep'))}</option>
                </select>
              </div>
            </section>

            <section class="settings__card">
              <h3 class="settings__title settings__title--with-logo">
                <img class="settings__logo" src="icons/modio.png" alt="mod.io" />
                <span>${escapeHtml(this.t('settings.section.modio'))}</span>
                <span class="settings__badge ${this.settings.modio_api_key ? 'is-on' : 'is-off'}">
                  ${escapeHtml(this.settings.modio_api_key ? this.t('settings.modio.connected') : this.t('settings.modio.notConnected'))}
                </span>
              </h3>
              <p class="settings__hint">${escapeHtml(this.t('settings.modio.hint'))}
                <a class="settings__link" href="https://mod.io/me/access"
                   onclick="event.preventDefault(); annoRoot().openExternalUrl('https://mod.io/me/access')">https://mod.io/me/access</a>
              </p>
              <div class="settings__row">
                <label class="settings__label">${escapeHtml(this.t('settings.modio.apiKey'))}</label>
                <div class="settings__field">
                  <input class="settings__input" type="password"
                         x-ref="modioKey"
                         value="${escapeAttr(this.settings.modio_api_key || '')}"
                         placeholder="${escapeAttr(this.t('settings.modio.apiKeyPlaceholder'))}" />
                  <span class="settings__status ${this.settings.modio_api_key ? 'is-ok' : ''}">${this.settings.modio_api_key ? '✓' : '–'}</span>
                </div>
                <div class="settings__actions">
                  <button class="settings__btn settings__btn--accent"
                          onclick="annoRoot().saveModioKey($refs.modioKey.value)">${escapeHtml(this.t('settings.modio.save'))}</button>
                  <button class="settings__btn settings__btn--danger"
                          ${this.settings.modio_api_key ? '' : 'disabled'}
                          onclick="annoRoot().clearModioKey()">${escapeHtml(this.t('settings.modio.disconnect'))}</button>
                </div>
              </div>
            </section>

            <section class="settings__card">
              <h3 class="settings__title">${escapeHtml(this.t('settings.section.advanced'))}</h3>
              <div class="settings__derived">
                <div><span>${escapeHtml(this.t('settings.derived.appdata'))}</span>
                  <code>${escapeHtml(p.appdata_dir || '—')}</code>
                  <button class="settings__btn settings__btn--small"
                          onclick="annoRoot().openModFolder('${escapeAttr(p.appdata_dir || '')}')">${escapeHtml(this.t('settings.open'))}</button>
                </div>
                <div><span>${escapeHtml(this.t('settings.derived.presets'))}</span>
                  <code>${escapeHtml(p.presets_dir || '—')}</code>
                  <button class="settings__btn settings__btn--small"
                          onclick="annoRoot().openModFolder('${escapeAttr(p.presets_dir || '')}')">${escapeHtml(this.t('settings.open'))}</button>
                </div>
              </div>
            </section>

          </div>
        </div>`;
    },

    activationTemplate() {
      // Returned as a single HTML string and injected via x-html so the POC
      // stays in one file. Phase 2 will split this into Alpine components or
      // a small templating helper; for now it keeps the structure obvious.
      const orderMode = this.mode === 'order';
      const renderRow = (m, isSubMod = false) => {
        const active = m.active ? 'is-on' : '';
        const selected = m.id === this.selectedModId ? 'is-selected' : '';
        const subClass = isSubMod ? 'mod-row--sub' : '';
        const dragClass = orderMode && !isSubMod ? 'mod-row--draggable' : '';
        const category = m.category || '—';
        const initials = (category || '?').slice(0, 2).toUpperCase();
        const dragAttrs = (orderMode && !isSubMod) ? `
              draggable="true"
              ondragstart="annoRoot().onDragStart('${escapeAttr(m.id)}', event)"
              ondragover="annoRoot().onDragOver(event)"
              ondrop="annoRoot().onDrop('${escapeAttr(m.id)}', event)"
              ondragend="annoRoot().onDragEnd()"` : '';
        return `
          <li class="mod-row ${selected} ${subClass} ${dragClass}"
              onclick="annoRoot().selectMod('${m.id}')"
              ${dragAttrs}>
            <span class="mod-row__check ${active}"
                  onclick="event.stopPropagation(); annoRoot().toggleMod('${m.id}')"></span>
            <span class="mod-row__medallion">${orderMode && !isSubMod ? '⋮⋮' : initials}</span>
            <span class="mod-row__category-cell">${escapeHtml(category)}</span>
            <div class="mod-row__text">
              <div class="mod-row__name">${escapeHtml(m.name)}</div>
              <div class="mod-row__version">v${escapeHtml(m.version)}</div>
            </div>
            <span class="mod-row__size">${this.formatSize(m.size_bytes)}</span>
            <span class="pill ${m.active ? '' : 'pill--ghost'}">${escapeHtml(m.active ? this.t('pill.active') : this.t('pill.off'))}</span>
          </li>`;
      };

      const sourceMods = orderMode ? this.orderedTopLevelMods : this.filteredMods;
      const rows = sourceMods.flatMap((m) => {
        const own = renderRow(m, false);
        // In order mode we hide sub-mods to keep the drag-drop list flat;
        // they'll come along with their parent in the saved order.
        const subs = orderMode ? [] : this.subModsOf(m.path).map((s) => renderRow(s, true));
        return [own, ...subs];
      }).join('');

      const sel = this.selectedMod;
      const banner = sel && this.selectedBannerUrl
        ? `<img class="mod-detail__banner" src="${this.selectedBannerUrl}" alt="" />`
        : `<div class="mod-detail__banner mod-detail__banner--placeholder">
             <div class="ornament">───── ◆ ─────</div>
             ${sel ? escapeHtml(this.t('detail.banner.empty')) : ''}
           </div>`;

      const detail = sel ? `
        ${banner}
        <div class="mod-detail__header">
          <h3 class="mod-detail__title">${escapeHtml(sel.name)}</h3>
          <div class="mod-detail__creator">${escapeHtml(this.t('detail.creator', { name: sel.creator || '?', version: sel.version }))}</div>
        </div>
        ${sel.description ? `
        <div class="mod-detail__section">
          <h4>${escapeHtml(this.t('detail.description'))}</h4>
          <p>${escapeHtml(sel.description)}</p>
        </div>` : ''}
        <div class="mod-detail__section">
          <h4>${escapeHtml(this.t('detail.details'))}</h4>
          <dl class="mod-detail__meta">
            <dt>${escapeHtml(this.t('detail.meta.category'))}</dt><dd>${escapeHtml(sel.category || '—')}</dd>
            <dt>${escapeHtml(this.t('detail.meta.difficulty'))}</dt><dd>${escapeHtml(sel.difficulty)}</dd>
            <dt>${escapeHtml(this.t('detail.meta.size'))}</dt><dd>${this.formatSize(sel.size_bytes)}</dd>
            <dt>${escapeHtml(this.t('detail.meta.folder'))}</dt><dd>${escapeHtml(sel.folder || basename(sel.path))}</dd>
          </dl>
        </div>
        <div class="mod-detail__actions">
          <button class="mod-detail__btn"
                  onclick="annoRoot().openModFolder('${escapeAttr(sel.path)}')">
            ${escapeHtml(this.t('detail.openFolder'))}
          </button>
          ${sel.parent_path ? '' : `
          <button class="mod-detail__btn mod-detail__btn--danger"
                  onclick="annoRoot().uninstallMod('${escapeAttr(sel.folder)}', '${escapeAttr(sel.name)}')">
            ${escapeHtml(this.t('detail.uninstall'))}
          </button>`}
        </div>` : `
        <div class="mod-detail__empty">
          <div class="ornament">───── ◆ ─────</div>
          ${escapeHtml(this.t('detail.empty'))}
        </div>`;

      const totalSize = this.formatSize(this.totalSizeBytes);
      const activeSize = this.formatSize(this.activeSizeBytes);

      const allProfiles = ['Default', 'Vanilla', ...this.presets];
      const profileOpts = allProfiles.map((p) => {
        const sel = p === this.profileName ? ' selected' : '';
        return `<option value="${escapeAttr(p)}"${sel}>${escapeHtml(p)}</option>`;
      }).join('');
      const isReserved = this.profileName === 'Default' || this.profileName === 'Vanilla';

      return `
        <div class="activation">
          <div class="activation__toolbar">
            <label>${escapeHtml(this.t('profile.label'))}</label>
            <select class="activation__profile"
                    onchange="annoRoot().switchProfile(this.value)">
              ${profileOpts}
            </select>
            <button class="activation__btn"
                    onclick="annoRoot().createPreset()">${escapeHtml(this.t('profile.new'))}</button>
            <button class="activation__btn activation__btn--danger"
                    onclick="annoRoot().deletePreset()"
                    ${isReserved ? 'disabled' : ''}>${escapeHtml(this.t('profile.delete'))}</button>

            <div class="activation__mode">
              <button class="activation__mode-btn ${this.mode === 'manage' ? 'is-active' : ''}"
                      onclick="annoRoot().setMode('manage')"
                      title="${escapeAttr(this.t('mode.manage.title'))}">${escapeHtml(this.t('mode.manage'))}</button>
              <button class="activation__mode-btn ${this.mode === 'order' ? 'is-active' : ''}"
                      onclick="annoRoot().setMode('order')"
                      title="${escapeAttr(this.t('mode.order.title'))}">${escapeHtml(this.t('mode.order'))}</button>
            </div>

            <span class="activation__count">${escapeHtml(this.t('count.active', { n: this.activeCount, total: this.topLevelMods.length }))}</span>
            <span class="activation__count activation__count--size">${activeSize} / ${totalSize}</span>
          </div>

          <div class="activation__list-wrap">
            <div class="mod-row mod-row--head">
              <span class="mod-row__check mod-row__check--head mod-row__check--${this.headerSelectionState}"
                    onclick="annoRoot().toggleAllFromHeader()"
                    title="${escapeAttr(this.t('list.head.toggleAll'))}"></span>
              <span></span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('category')"`}>${escapeHtml(this.t('list.head.category'))} ${orderMode ? '' : this.sortIndicator('category')}</span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('name')"`}>${escapeHtml(this.t('list.head.name'))} ${orderMode ? '' : this.sortIndicator('name')}</span>
              <span class="mod-row__head">${escapeHtml(this.t('list.head.size'))}</span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('status')"`}>${escapeHtml(this.t('list.head.status'))} ${orderMode ? '' : this.sortIndicator('status')}</span>
            </div>
            <ul class="activation__list">
              ${this.topLevelMods.length ? rows : `<li class="mod-detail__empty">${escapeHtml(this.t('list.empty'))}</li>`}
            </ul>
          </div>

          <aside class="mod-detail">
            ${detail}
          </aside>
        </div>`;
    },
  };
};

// ── helpers ────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// For values interpolated INSIDE single-quoted attributes built in template
// strings (e.g. onclick="...('${val}')"). Escapes both ' and \ so a folder
// name with an apostrophe doesn't break the markup or the JS arg list.
function escapeAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

function basename(p) {
  if (!p) return '';
  return p.split(/[\\/]/).pop();
}

// Returns the Alpine root scope so the inline event handlers in the injected
// template strings can call back into the component (Alpine's @click only sees
// scope on the originating element, but x-html breaks that chain).
function annoRoot() {
  return Alpine.$data(document.body);
}
