// Script para funcionalidade de busca de livros na página de adicionar avaliação

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const searchBtn = document.getElementById('search-books-btn');
    const modal = document.getElementById('search-modal');
    const closeModal = document.querySelector('.close-modal');
    const searchInput = document.getElementById('search-input');
    const searchSubmit = document.getElementById('search-submit');
    const searchResults = document.getElementById('search-results');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const bookCoverPreview = document.getElementById('book-cover-preview');
    const bookCoverInput = document.getElementById('book_cover');

    // Verificar se os elementos existem
    if (!searchBtn || !modal) {
        console.warn('Elementos de busca não encontrados na página');
        return;
    }

    // Abrir modal
    searchBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        searchInput.focus();
    });

    // Fechar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Buscar ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBooks();
        }
    });

    // Buscar ao clicar no botão
    searchSubmit.addEventListener('click', searchBooks);

    // Função para buscar livros
    async function searchBooks() {
        const query = searchInput.value.trim();
        if (!query) {
            showMessage('Por favor, digite o nome de um livro', 'error');
            return;
        }

        showMessage('🔄 Buscando livros...', 'loading');

        try {
            // Fazer requisição para o endpoint do frontend que faz proxy para o backend
            const response = await fetch(`/search?title=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const books = await response.json();

            if (books.length === 0) {
                showMessage('📚 Nenhum livro encontrado. Tente outro termo de busca.', 'no-results');
                return;
            }

            displayBooks(books);
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            showMessage('❌ Erro ao buscar livros. Verifique sua conexão e tente novamente.', 'error');
        }
    }

    // Função para exibir mensagens
    function showMessage(message, type = 'info') {
        searchResults.innerHTML = `<p class="${type}">${message}</p>`;
    }

    // Função para exibir os livros
    function displayBooks(books) {
        const booksHTML = books.map(book => {
            const authors = Array.isArray(book.authors) ? book.authors.join(', ') : book.authors || 'Autor não informado';
            const thumbnail = book.thumbnail || 'https://via.placeholder.com/64x96?text=Sem+Capa';
            
            return `
                <div class="book-result" 
                     data-title="${escapeHtml(book.title)}" 
                     data-authors="${escapeHtml(authors)}" 
                     data-cover="${escapeHtml(thumbnail)}">
                    <img src="${thumbnail}" alt="Capa do livro" class="book-result-cover">
                    <div class="book-result-info">
                        <h4>${escapeHtml(book.title)}</h4>
                        <p class="book-result-author">${escapeHtml(authors)}</p>
                    </div>
                    <button class="select-book-btn">Selecionar</button>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = booksHTML;

        // Adicionar event listeners aos botões de seleção
        document.querySelectorAll('.select-book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookResult = e.target.closest('.book-result');
                selectBook({
                    title: bookResult.dataset.title,
                    authors: bookResult.dataset.authors,
                    cover: bookResult.dataset.cover
                });
            });
        });
    }

    // Função para selecionar um livro
    function selectBook(book) {
        if (titleInput) titleInput.value = book.title;
        if (authorInput) authorInput.value = book.authors;
        
        if (book.cover && book.cover !== 'https://via.placeholder.com/64x96?text=Sem+Capa') {
            if (bookCoverPreview) bookCoverPreview.src = book.cover;
            if (bookCoverInput) bookCoverInput.value = book.cover;
        }

        modal.style.display = 'none';
        
        // Feedback visual
        showSuccessMessage('✅ Livro selecionado com sucesso!');
    }

    // Função para escape de HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Função para mostrar mensagem de sucesso
    function showSuccessMessage(message) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Fechar modal com tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // === FUNCIONALIDADES EXTRAS PARA O FORMULÁRIO ===
    
    // Contador de caracteres para textarea
    const avaliationTextarea = document.getElementById('avaliation');
    const charCounter = document.querySelector('.char-counter');
    
    if (avaliationTextarea && charCounter) {
        avaliationTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCounter.textContent = `${count} caracteres`;
            
            // Mudar cor baseado no tamanho
            if (count > 500) {
                charCounter.style.color = 'var(--color1)';
            } else if (count > 300) {
                charCounter.style.color = 'var(--color3)';
            } else {
                charCounter.style.color = 'var(--color4)';
            }
        });
    }
    
    // Validação visual em tempo real
    const noteInput = document.getElementById('note');
    if (noteInput) {
        noteInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const scaleLine = document.querySelector('.scale-line');
            
            if (scaleLine && !isNaN(value) && value >= 0 && value <= 10) {
                // Adicionar indicador visual na escala
                const percentage = (value / 10) * 100;
                scaleLine.style.background = `linear-gradient(to right, 
                    #ff6b6b 0%, 
                    #feca57 25%, 
                    #48cae4 50%, 
                    #51cf66 75%, 
                    #95e1d3 100%), 
                    linear-gradient(to right, transparent ${percentage}%, rgba(0,0,0,0.1) ${percentage}%)`;
            }
        });
    }
    
    // Animação de sucesso no formulário
    const form = document.querySelector('.book-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = document.querySelector('.submit-button');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="button-icon">⏳</span> Salvando...';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
            }
        });
    }
    
    // Efeitos visuais nos inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});