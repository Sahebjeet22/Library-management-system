#include "Book.h"
#include <iostream>
#include <sstream>
using namespace std;


Book::Book() : totalCopies(0), availableCopies(0) {}

Book::Book(const string& isbn, const string& title, const string& author, int totalCopies)
    : isbn(isbn), title(title), author(author), totalCopies(totalCopies), availableCopies(totalCopies) {}

string Book::getIsbn() const { return isbn; }
string Book::getTitle() const { return title; }
string Book::getAuthor() const { return author; }
int Book::getTotalCopies() const { return totalCopies; }
int Book::getAvailableCopies() const { return availableCopies; }

void Book::setTitle(const string& newTitle) { title = newTitle; }
void Book::setAuthor(const string& newAuthor) { author = newAuthor; }

void Book::setTotalCopies(int total) {
    int issued = totalCopies - availableCopies;
    totalCopies = total;
    availableCopies = total - issued;
    if (availableCopies < 0) {
        availableCopies = 0;
    }
}

bool Book::isAvailable() const { return availableCopies > 0; }

bool Book::issueCopy() {
    if (availableCopies <= 0) {
        return false;
    }
    --availableCopies;
    return true;
}

bool Book::returnCopy() {
    if (availableCopies >= totalCopies) {
        return false;
    }
    ++availableCopies;
    return true;
}

void Book::display() const {
    cout << "ISBN: " << isbn
              << " | Title: " << title
              << " | Author: " << author
              << " | Available: " << availableCopies << "/" << totalCopies << "\n";
}

std::string Book::serialize() const {
    return isbn + "|" + title + "|" + author + "|" +
           std::to_string(totalCopies) + "|" + std::to_string(availableCopies);
}

Book Book::deserialize(const std::string& line) {
    stringstream ss(line);
    string isbn, title, author, total, available;
    getline(ss, isbn, '|');
    getline(ss, title, '|');
    getline(ss, author, '|');
    getline(ss, total, '|');
    getline(ss, available, '|');

    Book book(isbn, title, author, stoi(total));
    book.availableCopies = stoi(available);
    return book;
}