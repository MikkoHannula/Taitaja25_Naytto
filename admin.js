// Check if user is logged in
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

// Initialize data from localStorage or use defaults
let questions = JSON.parse(localStorage.getItem('questions')) || mockQuestions;
let categories = JSON.parse(localStorage.getItem('categories')) || mockCategories;
let results = JSON.parse(localStorage.getItem('results')) || [];

// Tab handling
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Question management
function loadQuestions() {
    const questionList = document.getElementById('questionList');
    let allQuestions = [];
    
    // Flatten all questions from categories
    Object.keys(questions).forEach(categoryId => {
        questions[categoryId].forEach(question => {
            allQuestions.push({ ...question, categoryId });
        });
    });

    questionList.innerHTML = allQuestions.map((question, index) => `
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
                <button class="btn-secondary" onclick="editQuestion(${question.categoryId},${index})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteQuestion(${question.categoryId},${index})">Poista</button>
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
        const categoryId = document.getElementById('category').value;
        const newQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        if (!questions[categoryId]) {
            questions[categoryId] = [];
        }
        questions[categoryId].push(newQuestion);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        closeModal();
    });
}

function editQuestion(categoryId, index) {
    const question = questions[categoryId][index];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kysymystä</h2>
            <form id="editQuestionForm">
                <div class="form-group">
                    <label for="category">Kategoria</label>
                    <select id="category" required>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${cat.id === parseInt(categoryId) ? 'selected' : ''}>
                                ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
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
        const newCategoryId = document.getElementById('category').value;
        const updatedQuestion = {
            question: document.getElementById('question').value,
            options: Array.from({length: 4}, (_, i) => document.getElementById(`option${i}`).value),
            correctAnswer: parseInt(document.getElementById('correctAnswer').value)
        };

        // Remove from old category
        questions[categoryId].splice(index, 1);
        
        // Add to new category
        if (!questions[newCategoryId]) {
            questions[newCategoryId] = [];
        }
        questions[newCategoryId].push(updatedQuestion);
        
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
        closeModal();
    });
}

function deleteQuestion(categoryId, index) {
    if (confirm('Haluatko varmasti poistaa tämän kysymyksen?')) {
        questions[categoryId].splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }
}

// Category management
function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => `
        <div class="category-item">
            <h3>${category.name}</h3>
            <div class="category-actions">
                <button class="btn-secondary" onclick="editCategory(${category.id})">Muokkaa</button>
                <button class="btn-danger" onclick="deleteCategory(${category.id})">Poista</button>
            </div>
        </div>
    `).join('');
}

function addCategory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Lisää uusi kategoria</h2>
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategory = {
            id: categories.length + 1,
            name: document.getElementById('categoryName').value
        };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        loadCategories();
        closeModal();
    });
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Muokkaa kategoriaa</h2>
            <form id="editCategoryForm">
                <div class="form-group">
                    <label for="categoryName">Kategorian nimi</label>
                    <input type="text" id="categoryName" value="${category.name}" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Tallenna</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Peruuta</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('editCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories[index].name = document.getElementById('categoryName').value;
            localStorage.setItem('categories', JSON.stringify(categories));
            loadCategories();
            closeModal();
        }
    });
}

function deleteCategory(categoryId) {
    if (confirm('Haluatko varmasti poistaa tämän kategorian? Kaikki kategorian kysymykset poistetaan myös.')) {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories.splice(index, 1);
            delete questions[categoryId];
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('questions', JSON.stringify(questions));
            loadCategories();
            loadQuestions();
        }
    }
}

// Handle game results
function saveGameResult(playerName, category, score, total) {
    const result = {
        name: playerName,
        category: category,
        score: `${score}/${total}`,
        date: new Date().toISOString().split('T')[0]
    };
    results.push(result);
    localStorage.setItem('results', JSON.stringify(results));
    loadResults();
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
            const scoreA = parseInt(a.score);
            const scoreB = parseInt(b.score);
            return scoreB - scoreA;
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
    // Display teacher name
    const teacherName = sessionStorage.getItem('teacherName');
    document.getElementById('teacherName').textContent = teacherName;

    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('teacherName');
        window.location.href = 'login.html';
    });

    loadQuestions();
    loadCategories();
    loadResults();

    // Add event listeners for add buttons
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
});