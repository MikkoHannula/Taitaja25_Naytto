// Check if user is logged in
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// Tab handling
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Mock data for questions and results
let questions = mockQuestions[1].concat(mockQuestions[2]).concat(mockQuestions[3]);
let categories = mockCategories;
let results = [
    { name: "Testi Testaaja", category: "Historia", score: "8/10", date: "2025-05-06" },
    { name: "Matti Meikäläinen", category: "Matematiikka", score: "7/10", date: "2025-05-06" }
];

// Question management
function loadQuestions() {
    const questionList = document.getElementById('questionList');
    questionList.innerHTML = questions.map((question, index) => `
        <div class="question-item">
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map((option, optIndex) => `
                    <div class="option ${optIndex === question.correctAnswer ? 'correct' : ''}">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <div class="question-actions">
                <button class="btn-secondary" onclick="editQuestion(${index})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteQuestion(${index})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addQuestion() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kysymys</h2>
            <form id="questionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}">${cat.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" required>
                </div>
                ${Array.from({length: 4}, (_, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${Array.from({length: 4}, (_, i) => `
                            <option value="${i}">Vaihtoehto ${i + 1}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };
        questions.push(newQuestion);
        loadQuestions();
        closeModal();
    });
}

function editQuestion(index) {
    const question = questions[index];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kysymystä</h2>
            <form id="editQuestionForm">
                <div class="form-group">
                    <label for="question">Kysymys</label>
                    <input type="text" id="question" value="${question.question}" required>
                </div>
                ${question.options.map((option, i) => `
                    <div class="form-group">
                        <label for="option${i}">Vaihtoehto ${i + 1}</label>
                        <input type="text" id="option${i}" value="${option}" required>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="correctAnswer">Oikea vastaus</label>
                    <select id="correctAnswer" required>
                        ${question.options.map((_, i) => `
                            <option value="${i}" ${i === question.correctAnswer ? 'selected' : ''}>
                                Vaihtoehto ${i + 1}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editQuestionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        questions[index] = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };
        loadQuestions();
        closeModal();
    });
}

function deleteQuestion(index) {
    if (confirm('Haluatko varmasti poistaa tämän kysymyksen?')) {
        questions.splice(index, 1);
        loadQuestions();
    }
}

// Category management
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = `
        <div class="category-list">
            ${categories.map(category => `
                <div class="category-item">
                    <h3>${category.name}</h3>
                    <div class="category-actions">
                        <button class="btn-secondary" onclick="editCategory(${category.id})">Muokkaa</button>
                        <button class="btn-danger" onclick="deleteCategory(${category.id})">Poista</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Results management
function loadResults(page = 1) {
    const resultsPerPage = 10;
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedResults = results.slice(start, end);

    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = paginatedResults.map(result => `
        <tr>
            <td>${result.name}</td>
            <td>${result.category}</td>
            <td>${result.score}</td>
            <td>${result.date}</td>
        </tr>
    `).join('');

    // Update pagination
    const totalPages = Math.ceil(results.length / resultsPerPage);
    const pagination = document.getElementById('resultsPagination');
    pagination.innerHTML = `
        ${Array.from({length: totalPages}, (_, i) => `
            <button class="${page === i + 1 ? 'active' : ''}" 
                    onclick="loadResults(${i + 1})">
                ${i + 1}
            </button>
        `).join('')}
    `;
}

function sortResults(by) {
    results.sort((a, b) => {
        if (by === 'score') {
            return parseInt(b.score) - parseInt(a.score);
        } else {
            return new Date(b.date) - new Date(a.date);
        }
    });
    loadResults();
}

// Utility functions
function closeModal() {
    document.querySelector('.modal').remove();
}

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    loadCategories();
    loadResults();

    // Add event listeners for add buttons
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        // Implement category addition
    });
});