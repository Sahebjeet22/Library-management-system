# Library Management System

A C++ library management system for managing books, members, book issue and return operations, and book availability. It runs as a console program and also provides a REST API and a React web interface. Data is saved to text files, so records persist between runs.

## Features

- Add, update, remove, search, and list books
- Register, update, remove, and list members
- Issue and return books, with a limit of 3 books per member and a 14-day loan period
- Check how many copies of a book are available
- Save and load all data automatically
- REST API server on port 8080
- Web interface (React) connected to the REST API

## Concepts Used

- Classes and objects
- Composition, where `Library` owns the books, members, and loan records
- File handling with `fstream`
- REST API with `cpp-httplib`

## Project Structure

| File | Purpose |
|---|---|
| `Book.h`, `book.cpp` | Book class |
| `Member.h`, `Member.cpp` | Member class |
| `IssueRecord.h`, `IssueRecord.cpp` | Loan record class |
| `Library.h`, `Library.cpp` | Core library logic |
| `FileManager.h`, `FileManager.cpp` | Saving and loading data |
| `main.cpp` | Console menu program |
| `server.cpp` | REST API server |
| `httplib.h` | HTTP library used by the server |
| `frontend/` | React web interface |

## Console Program
```g++ -std=c++17 main.cpp book.cpp Library.cpp Member.cpp IssueRecord.cpp FileManager.cpp -o main.exe```
```.\main.exe```

Save and exit from the main menu with option 0, so your changes are written to the data files.

## REST API Server

Requires GCC 9 or newer, or w64devkit on Windows.
```g++ -std=c++17 server.cpp book.cpp Library.cpp Member.cpp IssueRecord.cpp FileManager.cpp -o server.exe -lws2_32```
```.\server.exe```

The server runs on `http://localhost:8080`. Keep it running while you use the web interface.

## Web Interface

Requires Node.js.

```cd frontend```
```npm install```
```npm run dev```

Open `http://localhost:3000` in your browser. Create a `.env` file in `frontend/` containing:
VITE_LIBRARY_API_URL=http://localhost:8080


## Notes

- Data files (`books.txt`, `members.txt`, `records.txt`) are created in the folder where the program runs.
- Compiled files (`*.exe`) and `node_modules/` are not committed to the repo.
