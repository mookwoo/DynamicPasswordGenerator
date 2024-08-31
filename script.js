document.getElementById('generateBtn').addEventListener('click', generateUsername);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);

async function fetchWords(type) {
    const url = type === 'adjective'
        ? 'https://api.datamuse.com/words?rel_jjb=object&max=10'
        : 'https://api.datamuse.com/words?rel_jja=thing&max=10';

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.map(wordObj => wordObj.word);
    } catch (error) {
        console.error('Error fetching words:', error);
        return [];
    }
}

async function generateUsername() {
    const format = document.getElementById('format').value;
    const adjectives = await fetchWords('adjective');
    const nouns = await fetchWords('noun');
    const randomNumber = Math.floor(Math.random() * 100);

    let randomUsername = '';

    if (adjectives.length > 0 && nouns.length > 0) {
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

        if (format === 'adjective-noun') {
            randomUsername = `${randomAdjective}${randomNoun}`;
        } else if (format === 'noun-number') {
            randomUsername = `${randomNoun}${randomNumber}`;
        } else {
            randomUsername = `${randomAdjective}${randomNoun}${randomNumber}`;
        }

        document.getElementById('username').value = randomUsername;
        addToHistory(randomUsername);
    } else {
        document.getElementById('username').value = 'DefaultUsername' + randomNumber;
    }
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
