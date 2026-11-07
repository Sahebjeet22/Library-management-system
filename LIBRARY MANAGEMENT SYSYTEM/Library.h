#ifndef LIBRARY_H
#define LIBRARY_H

#include "Book.h"
#include "Member.h"
#include "IssueRecord.h"
#include <string>
#include <vector>
using namespace std;

class Library {
private:
    vector<Book> books;
    vector<Member> members;
    vector<IssueRecord> records;
    int nextMemberId;

    Book* findBook(const string& isbn);
    Member* findMember(int memberId);
    string todayDate() const;
    string dueDateFromToday(int days) const;

public:
    Library();

    bool addBook(const Book& book);
    bool removeBook(const string& isbn);
    Book* getBook(const string& isbn);
    std::vector<Book*> searchBooks(const string& keyword);
    void showAllBooks() const;
    bool updateBook(const string& isbn, const string& title, const string& author, int totalCopies);

    int addMember(const string& name, const string& contact);
    bool removeMember(int memberId);
    Member* getMember(int memberId);
    void showAllMembers() const;
    bool updateMember(int memberId, const string& name, const string& contact);

    bool issueBook(const string& isbn, int memberId, string& message);
    bool returnBook(const string& isbn, int memberId, string& message);
    void showIssueRecords() const;
    void showActiveIssues() const;

    bool isAvailable(const string& isbn) const;

    void setBooks(const vector<Book>& b);
    void setMembers(const vector<Member>& m);
    void setRecords(const vector<IssueRecord>& r);
    const vector<Book>& getBooks() const;
    const vector<Member>& getMembers() const;
    const vector<IssueRecord>& getRecords() const;
    int getNextMemberId() const;
    void setNextMemberId(int id);
};

#endif