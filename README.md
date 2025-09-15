# Book Notes

Sistema para avaliação e registro de livros favoritos, com integração à API do Google Books.

## Tecnologias Utilizadas

- Node.js
- Express.js
- EJS (Embedded JavaScript Templates)
- Axios
- dotenv
- CSS customizado
- Google Books API
- PostgreSQL

## Estrutura do Projeto

```
Book notes/
├── BACKEND/
│   ├── index.js
│   └── package.json
├── FRONT/
│   ├── index.js
│   ├── package.json
│   ├── public/
│   │   ├── scripts/
│   │   │   └── book-search.js
│   │   └── styles/
│   │       ├── add.css
│   │       ├── avaliation.css
│   │       ├── edit.css
│   │       └── style.css
│   └── views/
│       ├── add.ejs
│       ├── avaliation.ejs
│       ├── edit.ejs
│       ├── header.ejs
│       └── index.ejs
```

## Banco de Dados

Tabela principal: `books`

| Coluna      | Tipo             | Descrição                |
|-------------|------------------|--------------------------|
| id          | integer (PK)     | Identificador único      |
| title       | varchar(50)      | Título do livro          |
| note        | double precision | Nota (1 a 10)            |
| avaliation  | text             | Avaliação do usuário     |
| book_cover  | text             | URL da capa do livro     |
| author      | varchar(50)      | Autor do livro           |

Exemplo de criação da tabela:
```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50),
  note DOUBLE PRECISION,
  avaliation TEXT,
  book_cover TEXT,
  author VARCHAR(50)
);
```

## Integração com Google Books API

- O frontend faz requisições para `/search`, que são repassadas ao backend e então para a API do Google Books.
- O resultado é usado para preencher dados do livro (título, autor, capa).

## Como rodar o projeto

1. Instale as dependências:
   ```bash
   cd FRONT && npm install
   cd ../BACKEND && npm install
   ```
2. Configure o arquivo `.env` em ambos os diretórios, usando como base os arquivos `.env.example`:
   - FRONT/.env:
     ```env
     BACKEND_URL=http://localhost:3000
     PORT=4000
     ```
   - BACKEND/.env:
     ```env
     PORT=4000
     DB_HOST=localhost
     DB_USER=postgres
     DB_PASSWORD=admin
     DB_NAME=booknotes
     DB_PORT=5432
     GOOGLE_BOOKS_API_KEY=your_google_books_api_key
     ```
3. Execute os servidores:
   ```bash
   npm run start:back
   npm run start:front
   ```

## Scripts disponíveis

No diretório raiz, adicione estes scripts aos arquivos `package.json` de FRONT e BACKEND:

### FRONT/package.json
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### BACKEND/package.json
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

## Licença
MIT
