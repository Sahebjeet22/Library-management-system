#ifndef BOOK_H
#define BOOK_H

#include <string>
using namespace std;


class Book {
private:
    string isbn;
    string title;
    string author;
    int totalCopies;
    int availableCopies;

public:
    Book();
    Book(const string& isbn, const string& title, const string& author, int totalCopies);

    string getIsbn() const;
    string getTitle() const;
    string getAuthor() const;
    int getTotalCopies() const;
    int getAvailableCopies() const;

    void setTitle(const string& title);
    void setAuthor(const string& author);
    void setTotalCopies(int total);

    bool isAvailable() const;
    bool issueCopy();
    bool returnCopy();

    void display() const;
    string serialize() const;
    static Book deserialize(const string& line);
};

#endif