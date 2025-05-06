// Game state
const gameState = {
    teacher: null,
    category: null,
    questionCount: 10, // Default question count
    currentQuestion: 0,
    score: 0,
    questions: []
};

// Mock data for testing (replace with actual data later)
const mockTeachers = [
    { id: 1, name: "Olevi Opettaja" },
    { id: 2, name: "Outi Opettaja" }
];

const mockCategories = [
    { id: 1, name: "Historia" },
    { id: 2, name: "Matematiikka" },
    { id: 3, name: "Tietotekniikka" }
];

// Mock questions for testing
const mockQuestions = {
    1: [ // Historia
        {
            question: "Minä vuonna Suomi itsenäistyi?",
            options: ["1917", "1918", "1919", "1920"],
            correctAnswer: 0
        },
        {
            question: "Kuka oli Suomen ensimmäinen presidentti?",
            options: ["Urho Kekkonen", "K.J. Ståhlberg", "P.E. Svinhufvud", "Carl Gustaf Mannerheim"],
            correctAnswer: 1
        },
        {
            question: "Minä vuonna Suomi liittyi Euroopan unioniin?",
            options: ["1993", "1994", "1995", "1996"],
            correctAnswer: 2
        },
        {
            question: "Mikä oli Suomen pääkaupunki ennen Helsinkiä?",
            options: ["Turku", "Tampere", "Viipuri", "Porvoo"],
            correctAnswer: 0
        },
        {
            question: "Milloin Suomi sai oman rahan, markan?",
            options: ["1860", "1870", "1880", "1890"],
            correctAnswer: 0
        }
    ],
    2: [ // Matematiikka
        {
            question: "Mikä on 7 x 8?",
            options: ["54", "56", "58", "52"],
            correctAnswer: 1
        },
        {
            question: "Mikä on piin (π) likiarvo kahden desimaalin tarkkuudella?",
            options: ["3.14", "3.16", "3.12", "3.18"],
            correctAnswer: 0
        },
        {
            question: "Kuinka monta astetta on ympyrässä?",
            options: ["180", "270", "360", "400"],
            correctAnswer: 2
        },
        {
            question: "Mikä on kuutiojuuri luvusta 27?",
            options: ["2", "3", "4", "9"],
            correctAnswer: 1
        },
        {
            question: "Mikä on kolmion kulmien summa?",
            options: ["90°", "180°", "270°", "360°"],
            correctAnswer: 1
        }
    ],
    3: [ // Tietotekniikka
        {
            question: "Mikä seuraavista ei ole ohjelmointikieli?",
            options: ["Python", "Java", "Router", "JavaScript"],
            correctAnswer: 2
        },
        {
            question: "Mikä on HTML:n tarkoitus?",
            options: ["Tietokantojen hallinta", "Verkkosivujen tyylittely", "Verkkosivujen rakenne", "Palvelinohjelmointi"],
            correctAnswer: 2
        },
        {
            question: "Mitä tarkoittaa CSS?",
            options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Color Style Syntax"],
            correctAnswer: 1
        },
        {
            question: "Mikä seuraavista on pilvipalvelu?",
            options: ["Windows", "Firefox", "AWS", "Notepad"],
            correctAnswer: 2
        },
        {
            question: "Mikä on RAM?",
            options: ["Kiintolevy", "Suoritin", "Keskusmuisti", "Näytönohjain"],
            correctAnswer: 2
        }
    ]
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const playNowBtn = document.getElementById('playNowBtn');
    const loginLink = document.querySelector('.login-link');

    playNowBtn.addEventListener('click', startGame);
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/admin';
    });
});

function startGame() {
    // Create game setup overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-setup-overlay';
    overlay.innerHTML = `
        <div class="game-setup">
            <h2>Aloita peli</h2>
            <div class="setup-section">
                <label for="teacher">Valitse opettaja:</label>
                <select id="teacher">
                    <option value="">Valitse opettaja...</option>
                    ${mockTeachers.map(teacher => 
                        `<option value="${teacher.id}">${teacher.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="setup-section">
                <label for="category">Valitse kategoria:</label>
                <select id="category">
                    <option value="">Valitse kategoria...</option>
                    ${mockCategories.map(category => 
                        `<option value="${category.id}">${category.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="setup-section">
                <label for="questionCount">Kysymysten määrä:</label>
                <select id="questionCount">
                    <option value="5">5 kysymystä</option>
                    <option value="10" selected>10 kysymystä</option>
                    <option value="15">15 kysymystä</option>
                </select>
            </div>
            <button id="startGameBtn" class="btn-primary">Aloita peli</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add styles for the overlay
    const style = document.createElement('style');
    style.textContent = `
        .game-setup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .game-setup {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            width: 90%;
            max-width: 500px;
        }

        .setup-section {
            margin: 1.5rem 0;
        }

        .setup-section label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .setup-section select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 1rem;
        }

        #startGameBtn {
            width: 100%;
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);

    // Add event listener for the start game button
    const startGameBtn = overlay.querySelector('#startGameBtn');
    startGameBtn.addEventListener('click', () => {
        const teacherSelect = document.getElementById('teacher');
        const categorySelect = document.getElementById('category');
        const questionCountSelect = document.getElementById('questionCount');

        if (!teacherSelect.value || !categorySelect.value) {
            alert('Valitse opettaja ja kategoria jatkaaksesi.');
            return;
        }

        gameState.teacher = teacherSelect.value;
        gameState.category = categorySelect.value;
        gameState.questionCount = parseInt(questionCountSelect.value);

        // Remove the overlay and start the actual game
        document.body.removeChild(overlay);
        loadGame();
    });
}

function loadGame() {
    // Clear the main content
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="game-container">
            <div class="game-header">
                <div class="progress">Kysymys: <span id="questionNumber">1</span>/${gameState.questionCount}</div>
                <div class="score">Pisteet: <span id="scoreDisplay">0</span></div>
            </div>
            <div id="questionContainer">
                <p>Ladataan kysymyksiä...</p>
            </div>
        </div>
    `;

    // Add game container styles
    const style = document.createElement('style');
    style.textContent = `
        .game-container {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .game-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            font-weight: 500;
        }

        #questionContainer {
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // Load questions for the selected category
    gameState.questions = getRandomQuestions(mockQuestions[gameState.category], gameState.questionCount);
    gameState.currentQuestion = 0;
    gameState.score = 0;
    
    displayQuestion();
}

function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    const questionContainer = document.getElementById('questionContainer');
    
    questionContainer.innerHTML = `
        <div class="question">
            <h2>${question.question}</h2>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option-btn" data-index="${index}">${option}</button>
                `).join('')}
            </div>
        </div>
    `;

    // Update progress
    document.getElementById('questionNumber').textContent = gameState.currentQuestion + 1;
    document.getElementById('scoreDisplay').textContent = gameState.score;

    // Add event listeners to option buttons
    const optionButtons = questionContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.addEventListener('click', handleAnswer);
    });
}

function handleAnswer(event) {
    const selectedIndex = parseInt(event.target.dataset.index);
    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;

    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        button.disabled = true;
        const buttonIndex = parseInt(button.dataset.index);
        
        if (buttonIndex === currentQuestion.correctAnswer) {
            button.classList.add('correct');
        } else if (buttonIndex === selectedIndex && !isCorrect) {
            button.classList.add('incorrect');
        }
    });

    // Update score
    if (isCorrect) {
        gameState.score++;
        document.getElementById('scoreDisplay').textContent = gameState.score;
    }

    // Show feedback and proceed to next question
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.questions.length) {
            displayQuestion();
        } else {
            showGameOver();
        }
    }, 1500);
}

function showGameOver() {
    const main = document.querySelector('main');
    const percentage = (gameState.score / gameState.questions.length) * 100;
    
    main.innerHTML = `
        <div class="game-over">
            <h2>Peli päättyi!</h2>
            <div class="results">
                <p>Pisteesi: ${gameState.score}/${gameState.questions.length}</p>
                <p>Onnistumisprosentti: ${percentage.toFixed(1)}%</p>
            </div>
            <div class="name-input">
                <label for="playerName">Syötä nimesi tulostaulukkoa varten:</label>
                <input type="text" id="playerName" placeholder="Nimi">
                <button id="saveScore" class="btn-primary">Tallenna tulos</button>
            </div>
            <button id="playAgain" class="btn-primary">Pelaa uudestaan</button>
        </div>
    `;

    // Add game over styles
    const style = document.createElement('style');
    style.textContent = `
        .game-over {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .results {
            margin: 2rem 0;
            font-size: 1.2rem;
        }

        .name-input {
            margin: 2rem 0;
        }

        .name-input input {
            display: block;
            width: 100%;
            max-width: 300px;
            margin: 1rem auto;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
        }

        .option-btn {
            display: block;
            width: 100%;
            padding: 1rem;
            margin: 0.5rem 0;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
        }

        .option-btn:hover:not(:disabled) {
            background: #f3f4f6;
        }

        .option-btn.correct {
            background: #10b981;
            color: white;
            border-color: #059669;
        }

        .option-btn.incorrect {
            background: #ef4444;
            color: white;
            border-color: #dc2626;
        }

        #playAgain {
            margin-top: 1rem;
        }

        .question {
            max-width: 600px;
            margin: 0 auto;
        }

        .question h2 {
            margin-bottom: 2rem;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners for the game over buttons
    document.getElementById('saveScore').addEventListener('click', saveHighScore);
    document.getElementById('playAgain').addEventListener('click', () => {
        location.reload();
    });
}

function saveHighScore() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Syötä nimesi tallentaaksesi tuloksen!');
        return;
    }

    // TODO: Implement actual high score saving to a backend
    alert('Tulos tallennettu!');
}