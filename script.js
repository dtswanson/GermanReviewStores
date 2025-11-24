// State
let currentMode = 'study'; // 'study' or 'quiz'
let currentCardIndex = 0;
let score = 0;
let streak = 0;
let currentQuizQuestion = null;
let isEnglishFront = false;

// DOM Elements
const btnStudy = document.getElementById('btnStudy');
const btnQuiz = document.getElementById('btnQuiz');
const studySection = document.getElementById('studySection');
const quizSection = document.getElementById('quizSection');
const langToggle = document.getElementById('langToggle');
const frontLangLabel = document.getElementById('frontLangLabel');

// Study Elements
const flashcard = document.getElementById('flashcard');
const cardCategory = document.getElementById('cardCategory');
const cardGerman = document.getElementById('cardGerman');
const cardPlural = document.getElementById('cardPlural');
const cardEnglish = document.getElementById('cardEnglish');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const cardCounter = document.getElementById('cardCounter');

// Quiz Elements
const scoreValue = document.getElementById('scoreValue');
const streakValue = document.getElementById('streakValue');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const feedback = document.getElementById('feedback');
const btnNextQuestion = document.getElementById('btnNextQuestion');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initStudyMode();
    setupEventListeners();
});

function loadState() {
    const savedScore = localStorage.getItem('germanAppScore');
    const savedStreak = localStorage.getItem('germanAppStreak');
    const savedLangPref = localStorage.getItem('germanAppEnglishFront');

    if (savedScore) score = parseInt(savedScore);
    if (savedStreak) streak = parseInt(savedStreak);
    if (savedLangPref === 'true') {
        isEnglishFront = true;
        langToggle.checked = true;
        frontLangLabel.textContent = 'English';
    }

    updateScoreBoard();
}

function saveState() {
    localStorage.setItem('germanAppScore', score);
    localStorage.setItem('germanAppStreak', streak);
    localStorage.setItem('germanAppEnglishFront', isEnglishFront);
}

function setupEventListeners() {
    // Mode Switching
    btnStudy.addEventListener('click', () => switchMode('study'));
    btnQuiz.addEventListener('click', () => switchMode('quiz'));

    // Language Toggle
    langToggle.addEventListener('change', (e) => {
        isEnglishFront = e.target.checked;
        frontLangLabel.textContent = isEnglishFront ? 'English' : 'German';
        saveState();
        renderCard();
    });

    // Study Controls
    flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
    btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevCard();
    });
    btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextCard();
    });

    // Quiz Controls
    btnNextQuestion.addEventListener('click', generateQuizQuestion);
}

function switchMode(mode) {
    currentMode = mode;
    if (mode === 'study') {
        btnStudy.classList.add('active');
        btnQuiz.classList.remove('active');
        studySection.classList.remove('hidden');
        studySection.classList.add('active');
        quizSection.classList.add('hidden');
        quizSection.classList.remove('active');
        initStudyMode();
    } else {
        btnQuiz.classList.add('active');
        btnStudy.classList.remove('active');
        quizSection.classList.remove('hidden');
        quizSection.classList.add('active');
        studySection.classList.add('hidden');
        studySection.classList.remove('active');
        initQuizMode();
    }
}

// --- Study Mode Logic ---

function initStudyMode() {
    currentCardIndex = 0;
    renderCard();
}

function renderCard() {
    const item = vocabulary[currentCardIndex];
    cardCategory.textContent = item.category;

    // Reset flip state
    flashcard.classList.remove('flipped');

    // Update content based on toggle
    if (isEnglishFront) {
        // Front: English
        cardGerman.textContent = item.english; // Reusing ID for layout, content changes
        cardPlural.textContent = ''; // No plural for English usually shown here

        // Back: German
        cardEnglish.textContent = `${item.german} ${item.plural ? `(${item.plural})` : ''}`;
    } else {
        // Front: German (Default)
        cardGerman.textContent = item.german;
        cardPlural.textContent = item.plural ? `Plural: ${item.plural}` : '';

        // Back: English
        cardEnglish.textContent = item.english;
    }

    cardCounter.textContent = `${currentCardIndex + 1} / ${vocabulary.length}`;
}

function nextCard() {
    if (currentCardIndex < vocabulary.length - 1) {
        currentCardIndex++;
    } else {
        currentCardIndex = 0; // Loop back
    }
    renderCard();
}

function prevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
    } else {
        currentCardIndex = vocabulary.length - 1; // Loop to end
    }
    renderCard();
}

// --- Quiz Mode Logic ---

function initQuizMode() {
    // Keep score/streak from state
    updateScoreBoard();
    generateQuizQuestion();
}

function updateScoreBoard() {
    scoreValue.textContent = score;
    streakValue.textContent = streak;
}

function generateQuizQuestion() {
    // Reset UI
    feedback.classList.add('hidden');
    btnNextQuestion.classList.add('hidden');
    quizOptions.innerHTML = '';

    // Pick a random word
    const randomIndex = Math.floor(Math.random() * vocabulary.length);
    const correctItem = vocabulary[randomIndex];
    currentQuizQuestion = correctItem;

    // Display Question (English -> German)
    quizQuestion.textContent = correctItem.english;

    // Generate Options (1 correct + 3 wrong)
    const options = [correctItem];
    while (options.length < 4) {
        const randomDistractor = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        if (!options.includes(randomDistractor)) {
            options.push(randomDistractor);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Render Options
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.german;
        btn.onclick = () => handleAnswer(option, btn);
        quizOptions.appendChild(btn);
    });
}

function handleAnswer(selectedOption, btnElement) {
    // Disable all buttons
    const buttons = quizOptions.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selectedOption === currentQuizQuestion) {
        // Correct
        btnElement.classList.add('correct');
        feedback.textContent = "Richtig! (Correct!)";
        feedback.style.color = "var(--success)";
        score += 10;
        streak++;
    } else {
        // Wrong
        btnElement.classList.add('wrong');
        feedback.textContent = `Falsch. The correct answer was: ${currentQuizQuestion.german}`;
        feedback.style.color = "var(--error)";
        streak = 0;

        // Highlight correct answer
        buttons.forEach(b => {
            if (b.textContent === currentQuizQuestion.german) {
                b.classList.add('correct');
            }
        });
    }

    saveState(); // Save new score/streak
    feedback.classList.remove('hidden');
    btnNextQuestion.classList.remove('hidden');
    updateScoreBoard();
}
