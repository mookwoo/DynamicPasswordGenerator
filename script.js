// Modern SecurePass Application
class SecurePassApp {
    constructor() {
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        
        // Password presets configuration
        this.PRESETS = {
            Gaming:  { length: 16, upper: true,  lower: true,  numbers: true,  symbols: false },
            Work:    { length: 20, upper: true,  lower: true,  numbers: true,  symbols: true  },
            Banking: { length: 24, upper: true,  lower: true,  numbers: true,  symbols: true  },
            Social:  { length: 14, upper: true,  lower: true,  numbers: true,  symbols: false }
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        this.loadThemePreference();
        await this.checkAuthStatus();
        this.loadPasswordHistory();
        this.loadSavedPasswords();
        
        // Initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Authentication tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });

        // Authentication forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        // Password generation
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generatePassword());
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.generatePassword());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyPassword());
        document.getElementById('savePasswordBtn')?.addEventListener('click', () => this.saveCurrentPassword());

        // Password controls
        document.getElementById('passwordLength')?.addEventListener('input', (e) => this.updateLengthDisplay(e.target.value));
        document.getElementById('bulkGenerateBtn')?.addEventListener('click', () => this.toggleBulkGeneration());
        document.getElementById('strengthCheckBtn')?.addEventListener('click', () => this.checkPasswordStrength());

        // Password management
        document.getElementById('searchToggleBtn')?.addEventListener('click', () => this.toggleSearch());
        document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAllPasswords());
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('passwordSearch')?.addEventListener('input', (e) => this.searchPasswords(e.target.value));
    }

    // Theme Management
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.setAttribute('data-feather', newTheme === 'dark' ? 'sun' : 'moon');
            feather.replace();
        }
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update icon
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.setAttribute('data-feather', savedTheme === 'dark' ? 'sun' : 'moon');
        }
    }

    // Authentication Management
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-form="${tabName}"]`).classList.add('active');
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const userRaw = localStorage.getItem('user');
        if (token && userRaw) {
            try {
                this.currentUser = JSON.parse(userRaw);
                this.showMainApp();
                this.loadSavedPasswords();
                this.loadUserStats();
                return;
            } catch (_) {
                // fall through
            }
        }
        this.showAuthSection();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (!email || !password) return this.showAlert('Please enter email and password', 'error');
        try {
            this.showLoading(e.target);
            const resp = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!resp.ok) throw new Error('Login failed');
            const data = await resp.json();
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            this.currentUser = data.user;
            this.showMainApp();
            this.loadSavedPasswords();
            this.loadUserStats();
            this.showAlert('Login successful', 'success');
        } catch (err) {
            console.error(err);
            this.showAlert('Login failed', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) return this.showAlert('Passwords do not match', 'error');
        if (!name || !email || !password) return this.showAlert('Please fill in all fields', 'error');
        try {
            this.showLoading(e.target);
            const resp = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            if (!resp.ok) throw new Error('Registration failed');
            const data = await resp.json();
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            this.currentUser = data.user;
            this.showMainApp();
            this.loadSavedPasswords();
            this.loadUserStats();
            this.showAlert('Account created', 'success');
        } catch (err) {
            console.error(err);
            this.showAlert('Registration failed', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.showAuthSection();
        this.showAlert('Logged out successfully', 'info');
    }

    showAuthSection() {
        document.getElementById('authSection')?.classList.remove('hidden');
        document.getElementById('userInfo')?.classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('authSection')?.classList.add('hidden');
        document.getElementById('userInfo')?.classList.remove('hidden');
        
        if (this.currentUser) {
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = this.currentUser.email;
            }
        }
    }

    async loadUserStats() {
        // For GitHub Pages - simulate user stats from localStorage
        try {
            const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
            const passwordHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
            
            // Count passwords generated today
            const today = new Date().toDateString();
            const generatedToday = passwordHistory.filter(item => {
                const itemDate = new Date(item.timestamp).toDateString();
                return itemDate === today;
            }).length;
            
            document.getElementById('savedCount').textContent = savedPasswords.length || 0;
            document.getElementById('generatedToday').textContent = generatedToday || 0;
        } catch (error) {
            console.error('Failed to load user stats:', error);
            document.getElementById('savedCount').textContent = '0';
            document.getElementById('generatedToday').textContent = '0';
        }
    }

    // Password Generation
    async generatePassword() {
        const settings = this.getPasswordSettings();
        
        try {
            // Show mood/theme info to user
            this.showGenerationInfo(settings);
            
            const password = await this.createPassword(settings);
            
            if (password) {
                document.getElementById('generatedPassword').value = password;
                this.addToHistory(password, settings);
                this.showPasswordControls();
                
                // Show save button if user is logged in
                if (this.currentUser) {
                    document.getElementById('savePasswordBtn')?.classList.remove('hidden');
                }
                
                // Show success message with mood/theme info
                const moodText = settings.mood !== 'default' ? ` with ${settings.mood} mood` : '';
                const themeText = settings.theme !== 'default' ? ` and ${settings.theme} theme` : '';
                this.showAlert(`Password generated${moodText}${themeText}!`, 'success');
            }
        } catch (error) {
            console.error('Password generation failed:', error);
            this.showAlert('Failed to generate password', 'error');
        }
    }

    showGenerationInfo(settings) {
        const { mood, theme } = settings;
        
        if (mood !== 'default' || theme !== 'default') {
            let infoText = 'Generating ';
            
            if (mood !== 'default') {
                infoText += `${mood} `;
            }
            
            if (theme !== 'default') {
                infoText += `${theme} `;
            }
            
            infoText += 'password...';
            
            // Show temporary info (optional - you can uncomment this if you want)
            // this.showAlert(infoText, 'info');
        }
    }

    getPasswordSettings() {
        return {
            length: parseInt(document.getElementById('passwordLength')?.value || '16'),
            theme: document.getElementById('passwordTheme')?.value || 'default',
            mood: document.getElementById('passwordMood')?.value || 'default',
            includeNumbers: document.getElementById('includeNumbers')?.checked || false,
            includeSymbols: document.getElementById('includeSymbols')?.checked || false,
            includeUppercase: document.getElementById('includeUppercase')?.checked || true,
            includeLowercase: document.getElementById('includeLowercase')?.checked || true,
            customWords: document.getElementById('customWords')?.value || ''
        };
    }

    async createPassword(settings) {
        const { theme, mood, customWords, length } = settings;
        let basePassword = '';

        if (customWords.trim()) {
            const words = customWords.split(',').map(w => w.trim()).filter(w => w);
            basePassword = words[Math.floor(Math.random() * words.length)];
        } else {
            // Enhanced mood and theme system with fallback word banks
            try {
                const { adjectives, nouns } = await this.getThemedWords(theme, mood);
                
                if (adjectives.length > 0 && nouns.length > 0) {
                    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
                    basePassword = this.capitalizeFirst(randomAdjective) + this.capitalizeFirst(randomNoun);
                } else {
                    // Fallback to local word banks
                    const localWords = this.getLocalMoodWords(mood, theme);
                    basePassword = localWords.adjective + localWords.noun;
                }
            } catch (error) {
                console.error('Error fetching words:', error);
                const localWords = this.getLocalMoodWords(mood, theme);
                basePassword = localWords.adjective + localWords.noun;
            }
        }

        // Apply character type settings
        basePassword = this.applyCharacterTypes(basePassword, settings);
        
        // Adjust to desired length
        return this.adjustPasswordLength(basePassword, length);
    }

    async getThemedWords(theme, mood) {
        const adjectives = await this.fetchWords('adjective', theme, mood);
        const nouns = await this.fetchWords('noun', theme, mood);
        
        return { adjectives, nouns };
    }

    getLocalMoodWords(mood, theme) {
        const moodWordBanks = {
            happy: {
                adjectives: ['joyful', 'bright', 'cheerful', 'sunny', 'radiant', 'gleaming', 'sparkling', 'vibrant'],
                nouns: ['sunshine', 'rainbow', 'flower', 'smile', 'butterfly', 'star', 'gem', 'light']
            },
            fierce: {
                adjectives: ['mighty', 'bold', 'fierce', 'strong', 'brave', 'powerful', 'fearless', 'wild'],
                nouns: ['lion', 'tiger', 'storm', 'thunder', 'warrior', 'flame', 'steel', 'blade']
            },
            calm: {
                adjectives: ['peaceful', 'serene', 'tranquil', 'gentle', 'quiet', 'soft', 'smooth', 'still'],
                nouns: ['ocean', 'breeze', 'cloud', 'lake', 'moon', 'dove', 'silk', 'whisper']
            },
            dark: {
                adjectives: ['shadow', 'midnight', 'raven', 'obsidian', 'noir', 'gothic', 'mysterious', 'deep'],
                nouns: ['night', 'darkness', 'void', 'abyss', 'phantom', 'eclipse', 'raven', 'onyx']
            },
            creative: {
                adjectives: ['artistic', 'vibrant', 'inspired', 'imaginative', 'colorful', 'unique', 'original', 'dynamic'],
                nouns: ['canvas', 'palette', 'brush', 'vision', 'dream', 'creation', 'masterpiece', 'symphony']
            },
            default: {
                adjectives: ['secure', 'strong', 'reliable', 'trusted', 'solid', 'stable', 'protected', 'safe'],
                nouns: ['password', 'key', 'guard', 'shield', 'vault', 'fortress', 'lock', 'cipher']
            }
        };

        const themeWordBanks = {
            fantasy: {
                adjectives: ['magical', 'mystical', 'enchanted', 'legendary', 'ancient', 'ethereal', 'divine', 'arcane'],
                nouns: ['dragon', 'wizard', 'crystal', 'phoenix', 'unicorn', 'spell', 'potion', 'quest']
            },
            'sci-fi': {
                adjectives: ['cyber', 'quantum', 'neural', 'digital', 'cosmic', 'stellar', 'atomic', 'plasma'],
                nouns: ['robot', 'galaxy', 'matrix', 'nexus', 'android', 'starship', 'portal', 'core']
            },
            professional: {
                adjectives: ['executive', 'corporate', 'business', 'professional', 'strategic', 'efficient', 'premium', 'elite'],
                nouns: ['summit', 'venture', 'enterprise', 'corporation', 'executive', 'strategy', 'solution', 'network']
            },
            nature: {
                adjectives: ['natural', 'organic', 'wild', 'fresh', 'green', 'earthy', 'pure', 'living'],
                nouns: ['forest', 'mountain', 'river', 'tree', 'leaf', 'stone', 'earth', 'wind']
            },
            gaming: {
                adjectives: ['epic', 'legendary', 'virtual', 'digital', 'online', 'multiplayer', 'competitive', 'pro'],
                nouns: ['quest', 'level', 'boss', 'raid', 'loot', 'guild', 'avatar', 'console']
            },
            work: {
                adjectives: ['official', 'meeting', 'deadline', 'project', 'report', 'presentation', 'corporate', 'team'],
                nouns: ['task', 'goal', 'objective', 'milestone', 'document', 'spreadsheet', 'email', 'calendar']
            },
            banking: {
                adjectives: ['secure', 'financial', 'investment', 'savings', 'account', 'loan', 'credit', 'debit'],
                nouns: ['balance', 'transaction', 'deposit', 'withdrawal', 'interest', 'mortgage', 'statement', 'card']
            },
            social: {
                adjectives: ['friend', 'follower', 'like', 'share', 'comment', 'post', 'story', 'profile'],
                nouns: ['network', 'media', 'group', 'event', 'message', 'notification', 'feed', 'hashtag']
            },
            default: {
                adjectives: ['random', 'mixed', 'varied', 'diverse', 'general', 'standard', 'common', 'basic'],
                nouns: ['element', 'component', 'factor', 'aspect', 'feature', 'item', 'piece', 'part']
            }
        };

        // Combine mood and theme preferences
        let selectedBank = moodWordBanks[mood] || moodWordBanks.default;
        
        // If theme is specified and not default, mix in theme words
        if (theme !== 'default' && themeWordBanks[theme]) {
            const themeBank = themeWordBanks[theme];
            selectedBank = {
                adjectives: [...selectedBank.adjectives, ...themeBank.adjectives],
                nouns: [...selectedBank.nouns, ...themeBank.nouns]
            };
        }

        const adjective = selectedBank.adjectives[Math.floor(Math.random() * selectedBank.adjectives.length)];
        const noun = selectedBank.nouns[Math.floor(Math.random() * selectedBank.nouns.length)];

        return { adjective: this.capitalizeFirst(adjective), noun: this.capitalizeFirst(noun) };
    }

    capitalizeFirst(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    async fetchWords(type, theme = 'default', mood = 'default') {
        // Build more specific API queries based on mood and theme
        let url = `https://api.datamuse.com/words?`;
        
        if (type === 'adjective') {
            url += 'rel_jjb=object';
        } else {
            url += 'rel_jja=thing';
        }
        
        url += '&max=15';

        // Enhanced mood-specific queries
        const moodQueries = {
            happy: type === 'adjective' ? '&ml=happy+joyful+bright+cheerful' : '&ml=joy+happiness+sunshine+smile',
            fierce: type === 'adjective' ? '&ml=fierce+strong+powerful+wild' : '&ml=lion+tiger+fire+storm',
            calm: type === 'adjective' ? '&ml=calm+peaceful+serene+gentle' : '&ml=peace+tranquility+ocean+breeze',
            dark: type === 'adjective' ? '&ml=dark+mysterious+shadow+deep' : '&ml=night+darkness+shadow+mystery',
            creative: type === 'adjective' ? '&ml=creative+artistic+vibrant+unique' : '&ml=art+creativity+color+imagination'
        };

        const themeQueries = {
            fantasy: type === 'adjective' ? '&topics=fantasy+magic+mythology' : '&topics=fantasy+mythology+magic',
            'sci-fi': type === 'adjective' ? '&topics=science+technology+space' : '&topics=technology+science+space',
            professional: type === 'adjective' ? '&topics=business+corporate+professional' : '&topics=business+work+corporate',
            nature: type === 'adjective' ? '&topics=nature+environment+natural' : '&topics=nature+animals+plants',
            gaming: type === 'adjective' ? '&topics=video+games,gaming' : '&topics=video+games,gaming',
            work: type === 'adjective' ? '&topics=work,business' : '&topics=work,business',
            banking: type === 'adjective' ? '&topics=finance,banking' : '&topics=finance,banking',
            social: type === 'adjective' ? '&topics=social+media,communication' : '&topics=social+media,communication'
        };

        // Apply mood-specific query
        if (mood !== 'default' && moodQueries[mood]) {
            url += moodQueries[mood];
        }

        // Apply theme-specific query  
        if (theme !== 'default' && themeQueries[theme]) {
            url += themeQueries[theme];
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            let words = data.map(wordObj => wordObj.word).filter(word => 
                word.length > 2 && word.length < 12 && /^[a-zA-Z]+$/.test(word)
            );
            
            // If we didn't get enough words, try a simpler query
            if (words.length < 3) {
                const simpleUrl = `https://api.datamuse.com/words?${type === 'adjective' ? 'rel_jjb=object' : 'rel_jja=thing'}&max=10`;
                const simpleResponse = await fetch(simpleUrl);
                const simpleData = await simpleResponse.json();
                words = simpleData.map(wordObj => wordObj.word).filter(word => 
                    word.length > 2 && word.length < 12 && /^[a-zA-Z]+$/.test(word)
                );
            }
            
            return words;
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            return [];
        }
    }

    applyCharacterTypes(password, settings) {
        let result = password;

        // Apply case transformation based on settings
        if (settings.includeUppercase && settings.includeLowercase) {
            // Smart mixed case - keep first letters capitalized
            result = result.split('').map((char, index) => {
                if (index === 0 || (index > 0 && result[index - 1] === result[index - 1].toUpperCase())) {
                    return char.toUpperCase();
                }
                return Math.random() > 0.7 ? char.toUpperCase() : char.toLowerCase();
            }).join('');
        } else if (settings.includeUppercase) {
            result = result.toUpperCase();
        } else if (settings.includeLowercase) {
            result = result.toLowerCase();
        }

        // Add mood-specific numbers
        if (settings.includeNumbers) {
            const moodNumbers = {
                happy: () => Math.floor(Math.random() * 100) + 1, // 1-100
                fierce: () => Math.floor(Math.random() * 9000) + 1000, // 1000-9999
                calm: () => Math.floor(Math.random() * 10), // 0-9
                dark: () => 666 + Math.floor(Math.random() * 333), // 666-999
                creative: () => Math.floor(Math.random() * 2024) + 1, // 1-2024
                default: () => Math.floor(Math.random() * 1000) // 0-999
            };
            
            const mood = document.getElementById('passwordMood')?.value || 'default';
            const numberFunc = moodNumbers[mood] || moodNumbers.default;
            result += numberFunc();
        }

        // Add mood-specific symbols
        if (settings.includeSymbols) {
            const moodSymbols = {
                happy: "!@#*+",
                fierce: "!@#$%^&*",
                calm: ".-_~",
                dark: "@#$%&*",
                creative: "*+=#@!",
                default: "!@#$%^&*()_+-=[]{}|;:'\",.<>?"
            };
            
            const mood = document.getElementById('passwordMood')?.value || 'default';
            const symbolSet = moodSymbols[mood] || moodSymbols.default;
            const randomSymbol = symbolSet.charAt(Math.floor(Math.random() * symbolSet.length));
            result += randomSymbol;
        }

        return result;
    }

    adjustPasswordLength(password, length) {
        if (password.length > length) {
            return password.substring(0, length);
        }
        
        while (password.length < length) {
            password += password.charAt(Math.floor(Math.random() * password.length));
        }
        
        return password;
    }

    updateLengthDisplay(value) {
        const display = document.getElementById('lengthValue');
        if (display) {
            display.textContent = value;
        }
    }

    applyPreset(presetName) {
        const preset = this.PRESETS[presetName];
        if (!preset) return;

        // UI elements mapping to the existing form controls
        const ui = {
            length: document.querySelector('#passwordLength'),
            upper:  document.querySelector('#includeUppercase'),
            lower:  document.querySelector('#includeLowercase'),
            numbers:document.querySelector('#includeNumbers'),
            symbols:document.querySelector('#includeSymbols')
        };

        // Apply preset values to form controls
        if (ui.length) ui.length.value = preset.length;
        if (ui.upper) ui.upper.checked = preset.upper;
        if (ui.lower) ui.lower.checked = preset.lower;
        if (ui.numbers) ui.numbers.checked = preset.numbers;
        if (ui.symbols) ui.symbols.checked = preset.symbols;

        // Update length display
        this.updateLengthDisplay(preset.length);

        // Show feedback to user
        this.showAlert(`${presetName} preset applied!`, 'success');
    }

    copyPassword() {
        const passwordField = document.getElementById('generatedPassword');
        if (!passwordField || !passwordField.value) {
            this.showAlert('No password to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(passwordField.value).then(() => {
            this.showAlert('Password copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy password:', err);
            this.showAlert('Failed to copy password', 'error');
        });
    }

    showPasswordControls() {
        // Show additional controls when password is generated
        const strengthSection = document.getElementById('passwordStrength');
        if (strengthSection) {
            strengthSection.classList.remove('hidden');
            this.checkPasswordStrength();
        }
    }

    checkPasswordStrength() {
        const password = document.getElementById('generatedPassword')?.value;
        if (!password) return;

        const strength = this.calculatePasswordStrength(password);
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        if (strengthFill && strengthText) {
            strengthFill.className = `strength-fill ${strength.level}`;
            strengthText.textContent = `Password strength: ${strength.label} (${strength.score}/100)`;
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let level = 'weak';
        let label = 'Very Weak';

        // Length bonus
        score += Math.min(25, password.length * 2);

        // Character variety
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 15;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        // Length penalties/bonuses
        if (password.length >= 12) score += 10;
        if (password.length < 8) score -= 20;

        // Determine level and label
        if (score >= 80) {
            level = 'strong';
            label = 'Very Strong';
        } else if (score >= 60) {
            level = 'good';
            label = 'Strong';
        } else if (score >= 40) {
            level = 'fair';
            label = 'Moderate';
        } else {
            level = 'weak';
            label = 'Weak';
        }

        return { score: Math.min(100, Math.max(0, score)), level, label };
    }

    // History Management
    addToHistory(password, settings = {}) {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        const timestamp = new Date().toLocaleString();
        
        history.unshift({
            password,
            timestamp,
            id: Date.now(),
            settings: {
                length: settings.length || 16,
                mood: settings.mood || 'default',
                theme: settings.theme || 'default',
                includeNumbers: settings.includeNumbers || false,
                includeSymbols: settings.includeSymbols || false,
                includeUppercase: settings.includeUppercase || true,
                includeLowercase: settings.includeLowercase || true
            }
        });

        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('passwordHistory', JSON.stringify(history));
        this.renderPasswordHistory();
    }

    loadPasswordHistory() {
        this.renderPasswordHistory();
    }

    renderPasswordHistory() {
        const historyContainer = document.getElementById('passwordHistory');
        if (!historyContainer) return;

        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i data-feather="clock" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                    <p>No password history yet. Generate your first password!</p>
                </div>
            `;
            feather.replace();
            return;
        }

        historyContainer.innerHTML = history.map(item => {
            // Create mood/theme display
            let contextInfo = '';
            if (item.settings) {
                const { mood, theme } = item.settings;
                if (mood !== 'default' || theme !== 'default') {
                    const moodText = mood !== 'default' ? mood : '';
                    const themeText = theme !== 'default' ? theme : '';
                    const separator = moodText && themeText ? ' • ' : '';
                    contextInfo = ` • ${moodText}${separator}${themeText}`;
                }
            }

            return `
                <div class="password-item">
                    <div>
                        <div class="password-text">${item.password}</div>
                        <div class="password-meta">Generated: ${item.timestamp}${contextInfo}</div>
                    </div>
                    <div class="password-actions">
                        <button class="btn btn-outline btn-sm" onclick="app.copyToClipboard('${item.password}')" title="Copy">
                            <i data-feather="copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        feather.replace();
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showAlert('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showAlert('Failed to copy', 'error');
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all password history?')) {
            localStorage.removeItem('passwordHistory');
            this.renderPasswordHistory();
            this.showAlert('History cleared', 'info');
        }
    }

    // Utility Methods
    showAlert(message, type = 'info') {
        const container = document.getElementById('alertContainer') || document.body;
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        container.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('removing');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 3000);
    }

    showLoading(element) {
        const button = element.querySelector('button[type="submit"]') || element;
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> Loading...';
    }

    hideLoading(element) {
        const button = element.querySelector('button[type="submit"]') || element;
        button.disabled = false;
        
        // Restore original content based on form type
        if (element.id === 'loginForm') {
            button.innerHTML = '<i data-feather="log-in"></i> Sign In';
        } else if (element.id === 'registerForm') {
            button.innerHTML = '<i data-feather="user-plus"></i> Create Account';
        }
        
        feather.replace();
    }

    // Placeholder methods for future features
    toggleBulkGeneration() {
        const bulkSettings = document.getElementById('bulkSettings');
        const bulkResults = document.getElementById('bulkResults');
        
        if (bulkSettings) {
            bulkSettings.classList.toggle('hidden');
        }
        
        // Implementation for bulk generation
        this.showAlert('Bulk generation feature coming soon!', 'info');
    }

    toggleSearch() {
        const searchGroup = document.getElementById('searchGroup');
        if (searchGroup) {
            searchGroup.classList.toggle('hidden');
        }
    }

    searchPasswords(query) {
        // Implementation for password search
        console.log('Searching for:', query);
    }

    clearAllPasswords() {
        if (confirm('Are you sure you want to clear all saved passwords?')) {
            localStorage.removeItem('savedPasswords');
            this.loadSavedPasswords();
            this.loadUserStats();
            this.showAlert('All saved passwords cleared', 'info');
        }
    }

    loadSavedPasswords() {
        const container = document.getElementById('savedPasswordsList');
        if (!container) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            container.innerHTML = '<div class="text-center" style="padding:2rem;color:var(--text-secondary);">Login to view saved passwords.</div>';
            return;
        }
        fetch('/api/passwords', { headers: { 'Authorization': 'Bearer ' + token }})
            .then(r => r.json())
            .then(data => {
                const list = data.passwords || [];
                if (list.length === 0) {
                    container.innerHTML = `
                        <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                            <i data-feather="lock" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                            <p>No saved passwords yet.</p>
                        </div>`;
                    feather.replace();
                    return;
                }
                container.innerHTML = list.map(item => {
                    const strengthLabel = item.strength_score >= 80 ? 'Very Strong' : item.strength_score >= 60 ? 'Strong' : item.strength_score >= 40 ? 'Moderate' : 'Weak';
                    return `
                        <div class="password-item">
                            <div>
                                <div class="password-text">${item.title}</div>
                                <div class="password-meta">Saved: ${new Date(item.created_at).toLocaleString()} • Strength: ${strengthLabel} (${item.strength_score})</div>
                            </div>
                            <div class="password-actions">
                                <button class="btn btn-outline btn-sm" onclick="app.sharePassword(${item.id})" title="Share"><i data-feather="share-2"></i></button>
                                <button class="btn btn-outline btn-sm" onclick="app.deleteSavedPassword(${item.id})" title="Delete"><i data-feather="trash-2"></i></button>
                            </div>
                        </div>`;
                }).join('');
                feather.replace();
            })
            .catch(() => {
                container.innerHTML = '<div class="text-center" style="padding:2rem;color:var(--text-secondary);">Failed to load passwords.</div>';
            });
    }

    deleteSavedPassword(id) {
        if (!confirm('Delete this password?')) return;
        const token = localStorage.getItem('authToken');
        if (!token) return this.showAlert('Login required', 'error');
        fetch(`/api/passwords/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token }})
            .then(r => { if (!r.ok) throw new Error(); this.showAlert('Deleted', 'info'); this.loadSavedPasswords(); this.loadUserStats(); })
            .catch(() => this.showAlert('Delete failed', 'error'));
    }

    async saveCurrentPassword() {
        const password = document.getElementById('generatedPassword')?.value;
        if (!password) return this.showAlert('No password to save', 'error');
        const token = localStorage.getItem('authToken');
        if (!token) return this.showAlert('Login required', 'error');
        try {
            const resp = await fetch('/api/passwords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ password })
            });
            if (!resp.ok) throw new Error('Save failed');
            this.showAlert('Password saved', 'success');
            this.loadSavedPasswords();
            this.loadUserStats();
        } catch (e) {
            this.showAlert('Save failed', 'error');
        }
    }

    async sharePassword(id) {
        const token = localStorage.getItem('authToken');
        if (!token) return this.showAlert('Login required', 'error');
        try {
            const resp = await fetch(`/api/passwords/${id}/share`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } });
            if (!resp.ok) throw new Error();
            const data = await resp.json();
            const full = location.origin + data.share_url;
            navigator.clipboard.writeText(full).catch(()=>{});
            this.showAlert('Share link copied (valid 10 min)', 'success');
        } catch (_) {
            this.showAlert('Share failed', 'error');
        }
    }
}

// Initialize the application
const app = new SecurePassApp();

// Make app globally available for event handlers
window.app = app;
