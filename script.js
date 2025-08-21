// Modern SecurePass Application
class SecurePassApp {
    constructor() {
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
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
        // For GitHub Pages - check localStorage for demo user
        const savedUser = localStorage.getItem('demoUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
            this.loadUserStats();
        } else {
            this.showAuthSection();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email') || document.getElementById('loginEmail').value,
            password: formData.get('password') || document.getElementById('loginPassword').value
        };

        try {
            this.showLoading(e.target);
            
            // For GitHub Pages - simulate authentication
            if (loginData.email && loginData.password) {
                // Demo authentication - in real app this would be server-side
                const demoUser = {
                    id: 1,
                    name: 'Demo User',
                    email: loginData.email,
                    created_at: new Date().toISOString()
                };
                
                this.currentUser = demoUser;
                localStorage.setItem('demoUser', JSON.stringify(demoUser));
                localStorage.setItem('authToken', 'demo-token-' + Date.now());
                
                this.showAlert('Login successful! (Demo Mode)', 'success');
                this.showMainApp();
                this.loadUserStats();
            } else {
                this.showAlert('Please enter email and password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name') || document.getElementById('registerName').value,
            email: formData.get('email') || document.getElementById('registerEmail').value,
            password: formData.get('password') || document.getElementById('registerPassword').value
        };

        const confirmPassword = document.getElementById('confirmPassword').value;
        if (registerData.password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            this.showLoading(e.target);
            
            // For GitHub Pages - simulate registration
            if (registerData.name && registerData.email && registerData.password) {
                const demoUser = {
                    id: Date.now(),
                    name: registerData.name,
                    email: registerData.email,
                    created_at: new Date().toISOString()
                };
                
                this.currentUser = demoUser;
                localStorage.setItem('demoUser', JSON.stringify(demoUser));
                localStorage.setItem('authToken', 'demo-token-' + Date.now());
                
                this.showAlert('Account created successfully! (Demo Mode)', 'success');
                this.showMainApp();
                this.loadUserStats();
            } else {
                this.showAlert('Please fill in all fields', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('demoUser');
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
            nature: type === 'adjective' ? '&topics=nature+environment+natural' : '&topics=nature+animals+plants'
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

        const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
        
        if (savedPasswords.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i data-feather="lock" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                    <p>No saved passwords yet. Generate and save your first password!</p>
                </div>
            `;
            feather.replace();
            return;
        }

        container.innerHTML = savedPasswords.map(item => `
            <div class="password-item">
                <div>
                    <div class="password-text">${item.password}</div>
                    <div class="password-meta">
                        ${item.title} • Saved: ${new Date(item.created_at).toLocaleString()}
                        ${item.website ? ` • ${item.website}` : ''}
                    </div>
                </div>
                <div class="password-actions">
                    <button class="btn btn-outline btn-sm" onclick="app.copyToClipboard('${item.password}')" title="Copy">
                        <i data-feather="copy"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="app.deleteSavedPassword(${item.id})" title="Delete">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('');

        feather.replace();
    }

    deleteSavedPassword(id) {
        if (confirm('Are you sure you want to delete this password?')) {
            const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
            const filtered = savedPasswords.filter(item => item.id !== id);
            localStorage.setItem('savedPasswords', JSON.stringify(filtered));
            this.loadSavedPasswords();
            this.loadUserStats();
            this.showAlert('Password deleted', 'info');
        }
    }

    async saveCurrentPassword() {
        const password = document.getElementById('generatedPassword')?.value;
        if (!password) {
            this.showAlert('No password to save', 'error');
            return;
        }

        // For GitHub Pages - save to localStorage
        try {
            const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
            const newSavedPassword = {
                id: Date.now(),
                password: password,
                title: `Password ${savedPasswords.length + 1}`,
                website: '',
                username: '',
                notes: '',
                category: 'generated',
                created_at: new Date().toISOString(),
                user_id: this.currentUser?.id || 'demo'
            };
            
            savedPasswords.unshift(newSavedPassword);
            localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
            
            this.showAlert('Password saved successfully!', 'success');
            this.loadUserStats();
            this.loadSavedPasswords();
        } catch (error) {
            console.error('Failed to save password:', error);
            this.showAlert('Failed to save password', 'error');
        }
    }
}

// Initialize the application
const app = new SecurePassApp();

// Make app globally available for event handlers
window.app = app;
