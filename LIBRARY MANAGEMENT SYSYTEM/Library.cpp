#include "Library.h"
#include <algorithm>
#include <ctime>
#include <iostream>
using namespace std;

Library::Library() : nextMemberId(1) {}

string Library::todayDate() const {
    time_t now = time(nullptr);
    tm* t = localtime(&now);
    char buf[11];
    strftime(buf, sizeof(buf), "%Y-%m-%d", t);
    return string(buf);
}

std::string Library::dueDateFromToday(int days) const {
    time_t now = std::time(nullptr) + static_cast<std::time_t>(days) * 24 * 60 * 60;
    tm* t = std::localtime(&now);
    char buf[11];
    strftime(buf, sizeof(buf), "%Y-%m-%d", t);
    return string(buf);
}

Book* Library::findBook(const string& isbn) {
    for (auto& b : books) {
        if (b.getIsbn() == isbn) {
            return &b;
        }
    }
    return nullptr;
}

Member* Library::findMember(int memberId) {
    for (auto& m : members) {
        if (m.getId() == memberId) {
            return &m;
        }
    }
    return nullptr;
}

bool Library::addBook(const Book& book) {
    if (findBook(book.getIsbn()) != nullptr) {
        return false;
    }
    books.push_back(book);
    return true;
}

bool Library::removeBook(const string& isbn) {
    Book* b = findBook(isbn);
    if (b == nullptr) {
        return false;
    }
    if (b->getAvailableCopies() != b->getTotalCopies()) {
        return false;
    }
    books.erase(remove_if(books.begin(), books.end(),
        [&isbn](const Book& x) { return x.getIsbn() == isbn; }), books.end());
    return true;
}

Book* Library::getBook(const string& isbn) {
    return findBook(isbn);
}

vector<Book*> Library::searchBooks(const string& keyword) {
    vector<Book*> results;
    for (auto& b : books) {
        if (b.getTitle().find(keyword) != std::string::npos ||
            b.getAuthor().find(keyword) != std::string::npos ||
            b.getIsbn().find(keyword) != std::string::npos) {
            results.push_back(&b);
        }
    }
    return results;
}

void Library::showAllBooks() const {
    if (books.empty()) {
        cout << "No books in the library.\n";
        return;
    }
    for (const auto& b : books) {
        b.display();
    }
}

bool Library::updateBook(const string& isbn, const string& title, const string& author, int totalCopies) {
    Book* b = findBook(isbn);
    if (b == nullptr) {
        return false;
    }
    b->setTitle(title);
    b->setAuthor(author);
    b->setTotalCopies(totalCopies);
    return true;
}

int Library::addMember(const string& name, const string& contact) {
    int id = nextMemberId++;
    members.emplace_back(id, name, contact);
    return id;
}

bool Library::removeMember(int memberId) {
    Member* m = findMember(memberId);
    if (m == nullptr) {
        return false;
    }
    if (!m->getIssuedIsbns().empty()) {
        return false;
    }
    members.erase(remove_if(members.begin(), members.end(),
        [memberId](const Member& x) { return x.getId() == memberId; }), members.end());
    return true;
}

Member* Library::getMember(int memberId) {
    return findMember(memberId);
}

void Library::showAllMembers() const {
    if (members.empty()) {
        cout << "No members registered.\n";
        return;
    }
    for (const auto& m : members) {
        m.display();
    }
}

bool Library::updateMember(int memberId, const string& name, const string& contact) {
    Member* m = findMember(memberId);
    if (m == nullptr) {
        return false;
    }
    m->setName(name);
    m->setContact(contact);
    return true;
}

bool Library::issueBook(const string& isbn, int memberId, string& message) {
    Book* b = findBook(isbn);
    if (b == nullptr) {
        message = "Book not found.";
        return false;
    }
    Member* m = findMember(memberId);
    if (m == nullptr) {
        message = "Member not found.";
        return false;
    }
    if (m->hasIssued(isbn)) {
        message = "Member already has this book.";
        return false;
    }
    if (!m->canIssueMore()) {
        message = "Member has reached the limit of " + to_string(Member::maxBooks()) + " books.";
        return false;
    }
    if (!b->issueCopy()) {
        message = "No copies available.";
        return false;
    }
    m->addIssuedBook(isbn);
    records.emplace_back(isbn, memberId, todayDate(), dueDateFromToday(14));
    message = "Book issued successfully. Due date: " + records.back().getDueDate();
    return true;
}

bool Library::returnBook(const string& isbn, int memberId, string& message) {
    Book* b = findBook(isbn);
    if (b == nullptr) {
        message = "Book not found.";
        return false;
    }
    Member* m = findMember(memberId);
    if (m == nullptr) {
        message = "Member not found.";
        return false;
    }
    if (!m->removeIssuedBook(isbn)) {
        message = "This member has not issued this book.";
        return false;
    }
    for (auto& r : records) {
        if (!r.isReturned() && r.getIsbn() == isbn && r.getMemberId() == memberId) {
            r.markReturned(todayDate());
            break;
        }
    }
    b->returnCopy();
    message = "Book returned successfully.";
    return true;
}

void Library::showIssueRecords() const {
    if (records.empty()) {
        cout << "No issue records.\n";
        return;
    }
    for (const auto& r : records) {
        r.display();
    }
}

void Library::showActiveIssues() const {
    bool any = false;
    for (const auto& r : records) {
        if (!r.isReturned()) {
            r.display();
            any = true;
        }
    }
    if (!any) {
        cout << "No books currently issued.\n";
    }
}

bool Library::isAvailable(const string& isbn) const {
    for (const auto& b : books) {
        if (b.getIsbn() == isbn) {
            return b.isAvailable();
        }
    }
    return false;
}

void Library::setBooks(const vector<Book>& b) { books = b; }
void Library::setMembers(const vector<Member>& m) { members = m; }
void Library::setRecords(const vector<IssueRecord>& r) { records = r; }
const vector<Book>& Library::getBooks() const { return books; }
const vector<Member>& Library::getMembers() const { return members; }
const vector<IssueRecord>& Library::getRecords() const { return records; }
int Library::getNextMemberId() const { return nextMemberId; }
void Library::setNextMemberId(int id) { nextMemberId = id; }