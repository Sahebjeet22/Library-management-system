# Library Management System

A console-based library management system written in C++. It manages books, members, book issue and return operations, and book availability. Data is saved to text files, so records persist between runs.

## Features

- Add, update, remove, search, and list books
- Register, update, remove, and list members
- Issue and return books, with a limit of 3 books per member and a 14-day loan period
- Check how many copies of a book are available
- Save and load all data automatically

## Concepts Used

- Classes and objects
- Composition, where `Library` owns the books, members, and loan records
- File handling with `fstream`

## How to Compile and Run

```
g++ -std=c++17 *.cpp -o main.exe
.\main.exe
```

Save and exit from the main menu with option **0**, so your changes are written to the data files.
