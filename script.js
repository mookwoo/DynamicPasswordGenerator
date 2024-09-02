document.getElementById('generateBtn').addEventListener('click', async () => {
    const username = await generateUsername();
    if (username) {
        document.getElementById('username').value = username;
        generateVisual(username);
        addToHistory(username);
    }
});
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);
document.getElementById('bulkGenerateBtn').addEventListener('click', generateBulkUsernames);

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

async function generateUsername() {
    const theme = document.getElementById('theme').value;
    const mood = document.getElementById('mood').value;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    const adjectives = await fetchWords('adjective', theme, mood);
    const nouns = await fetchWords('noun', theme, mood);
    const length = parseInt(document.getElementById('usernameLength').value, 10);

    let randomUsername = '';
    if (adjectives.length > 0 && nouns.length > 0) {
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        randomUsername = `${randomAdjective}${randomNoun}`;
    } else {
        randomUsername = 'DefaultUsername';
    }

    randomUsername = adjustUsernameLength(randomUsername, length);

    // Add numbers or symbols if selected
    if (includeNumbers) randomUsername += Math.floor(Math.random() * 100);
    if (includeSymbols) randomUsername += getRandomSymbol();

    return randomUsername;
}

function adjustUsernameLength(username, length) {
    if (username.length > length) {
        return username.substring(0, length);
    }
    while (username.length < length) {
        username += username.charAt(Math.floor(Math.random() * username.length));
    }
    return username;
}

function getRandomSymbol() {
    const symbols = "!@#$%^&*()_+-=[]{}|;:'\",.<>?";
    return symbols.charAt(Math.floor(Math.random() * symbols.length));
}

async function generateBulkUsernames() {
    const count = parseInt(document.getElementById('bulkCount').value, 10);
    const resultsContainer = document.getElementById('bulkResults');
    resultsContainer.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const username = await generateUsername();
        const resultItem = document.createElement('div');
        resultItem.textContent = username;
        resultsContainer.appendChild(resultItem);
    }
}

function generateVisual(username) {
    const canvas = document.getElementById('usernameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Example visualization: create a pattern based on username components
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F4D03F', '#9B59B6'];
    ctx.fillStyle = colors[username.length % colors.length];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username.charAt(0), canvas.width / 2 - 10, canvas.height / 2 + 10);
}

function copyToClipboard() {
    const username = document.getElementById('username').value;
    navigator.clipboard.writeText(username).then(() => {
        alert('Username copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy username:', err);
    });
}

function addToHistory(username) {
    const historyList = document.getElementById('usernameHistory');
    const listItem = document.createElement('li');
    listItem.textContent = username;
    historyList.prepend(listItem);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}
