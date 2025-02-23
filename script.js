document.getElementById('generateBtn').addEventListener('click', async () => {
    const password = await generatePassword();
    if (password) {
        document.getElementById('username').value = password;
        addToHistory(password);
    }
});
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);
document.getElementById('bulkGenerateBtn').addEventListener('click', generateBulkPasswords);
document.getElementById('usernameLength').addEventListener('input', updateLengthValue);
document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
document.getElementById('resetFormBtn').addEventListener('click', resetForm);

function updateLengthValue() {
    const lengthValue = document.getElementById('usernameLength').value;
    document.getElementById('lengthValue').textContent = lengthValue;
}

async function fetchWords(type, theme = 'default', mood = 'default') {
    let url = `https://api.datamuse.com/words?${type === 'adjective' ? 'rel_jjb=object' : 'rel_jja=thing'}&max=10`;

    if (theme !== 'default') {
        url += `&topics=${theme}`;
    }
    if (mood !== 'default') {
        url += `&topics=${mood}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.map(wordObj => wordObj.word);
    } catch (error) {
        console.error(`Error fetching ${type}s:`, error);
        return [];
    }
}

async function generatePassword() {
    const theme = document.getElementById('theme').value;
    const mood = document.getElementById('mood').value;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    const customInput = document.getElementById('customInput').value.trim();
    const adjectives = await fetchWords('adjective', theme, mood);
    const nouns = await fetchWords('noun', theme, mood);
    const length = parseInt(document.getElementById('usernameLength').value, 10);

    let randomPassword = '';
    if (customInput) {
        randomPassword = customInput;
    } else if (adjectives.length > 0 && nouns.length > 0) {
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        randomPassword = `${randomAdjective}${randomNoun}`;
    } else {
        randomPassword = 'DefaultPassword';
    }

    randomPassword = adjustPasswordLength(randomPassword, length);

    // Add numbers or symbols if selected
    if (includeNumbers) randomPassword += Math.floor(Math.random() * 100);
    if (includeSymbols) randomPassword += getRandomSymbol();

    return randomPassword;
}

function adjustPasswordLength(password, length) {
    if (password.length > length) {
        return password.substring(0, length);
    }
    while (password.length < length) {
        password += password.charAt(Math.floor(Math.random() * password.length));
    }
    return password;
}

function getRandomSymbol() {
    const symbols = "!@#$%^&*()_+-=[]{}|;:'\",.<>?";
    return symbols.charAt(Math.floor(Math.random() * symbols.length));
}

async function generateBulkPasswords() {
    const count = parseInt(document.getElementById('bulkCount').value, 10);
    const resultsContainer = document.getElementById('bulkResults');
    resultsContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const password = await generatePassword();
        const resultItem = document.createElement('div');
        resultItem.textContent = password;
        resultsContainer.appendChild(resultItem);
    }
}

function copyToClipboard() {
    const password = document.getElementById('username').value;
    navigator.clipboard.writeText(password).then(() => {
        const tooltip = document.getElementById('copyTooltip');
        tooltip.style.visibility = 'visible';
        setTimeout(() => {
            tooltip.style.visibility = 'hidden';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy password:', err);
    });
}

function addToHistory(password) {
    const historyList = document.getElementById('usernameHistory');
    const listItem = document.createElement('li');
    const timestamp = new Date().toLocaleString();
    listItem.textContent = `${password} (Generated on: ${timestamp})`;
    historyList.prepend(listItem);

    saveHistory(password, timestamp);
}

function saveHistory(password, timestamp) {
    const history = JSON.parse(localStorage.getItem('usernameHistory')) || [];
    history.unshift({ password, timestamp });
    localStorage.setItem('usernameHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('usernameHistory')) || [];
    const historyList = document.getElementById('usernameHistory');
    history.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.password} (Generated on: ${entry.timestamp})`;
        historyList.appendChild(listItem);
    });
}

loadHistory();

function clearHistory() {
    localStorage.removeItem('usernameHistory');
    document.getElementById('usernameHistory').innerHTML = '';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

loadDarkModePreference();

function resetForm() {
    document.getElementById('theme').value = 'default';
    document.getElementById('mood').value = 'default';
    document.getElementById('usernameLength').value = 10;
    document.getElementById('lengthValue').textContent = 10;
    document.getElementById('bulkCount').value = 5;
    document.getElementById('includeNumbers').checked = false;
    document.getElementById('includeSymbols').checked = false;
    document.getElementById('username').value = '';
    document.getElementById('bulkResults').innerHTML = '';
}
