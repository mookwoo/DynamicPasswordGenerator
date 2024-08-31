document.getElementById('generateBtn').addEventListener('click', generateUsername);

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
    const adjectives = await fetchWords('adjective');
    const nouns = await fetchWords('noun');
    const randomNumber = Math.floor(Math.random() * 100);

    if (adjectives.length > 0 && nouns.length > 0) {
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomUsername = `${randomAdjective}${randomNoun}${randomNumber}`;

        document.getElementById('username').value = randomUsername;
    } else {
        document.getElementById('username').value = 'DefaultUsername' + randomNumber;
    }
}
