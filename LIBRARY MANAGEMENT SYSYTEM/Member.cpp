#include "Member.h"
#include <algorithm>
#include <iostream>
#include <sstream>
using namespace std;

Member::Member() : memberId(0) {}

Member::Member(int memberId, const string& name, const string& contact)
    : memberId(memberId), name(name), contact(contact) {}

int Member::getId() const { return memberId; }
string Member::getName() const { return name; }
string Member::getContact() const { return contact; }
const vector<string>& Member::getIssuedIsbns() const { return issuedIsbns; }

void Member::setName(const string& newName) { name = newName; }
void Member::setContact(const string& newContact) { contact = newContact; }

bool Member::canIssueMore() const {
    return static_cast<int>(issuedIsbns.size()) < MAX_BOOKS;
}

bool Member::hasIssued(const std::string& isbn) const {
    return find(issuedIsbns.begin(), issuedIsbns.end(), isbn) != issuedIsbns.end();
}

void Member::addIssuedBook(const string& isbn) {
    issuedIsbns.push_back(isbn);
}

bool Member::removeIssuedBook(const string& isbn) {
    auto it = find(issuedIsbns.begin(), issuedIsbns.end(), isbn);
    if (it == issuedIsbns.end()) {
        return false;
    }
    issuedIsbns.erase(it);
    return true;
}

int Member::maxBooks() { return MAX_BOOKS; }

void Member::display() const {
    cout << "ID: " << memberId
              << " | Name: " << name
              << " | Contact: " << contact
              << " | Books issued: " << issuedIsbns.size() << "/" << MAX_BOOKS << "\n";
}

string Member::serialize() const {
    string line = to_string(memberId) + "|" + name + "|" + contact + "|";
    for (size_t i = 0; i < issuedIsbns.size(); ++i) {
        line += issuedIsbns[i];
        if (i + 1 < issuedIsbns.size()) {
            line += ",";
        }
    }
    return line;
}

Member Member::deserialize(const string& line) {
    stringstream ss(line);
    string id, name, contact, isbnList;
    getline(ss, id, '|');
    getline(ss, name, '|');
    getline(ss, contact, '|');
    getline(ss, isbnList);

    Member member(std::stoi(id), name, contact);
    stringstream isbnStream(isbnList);
    string isbn;
    while (getline(isbnStream, isbn, ',')) {
        if (!isbn.empty()) {
            member.addIssuedBook(isbn);
        }
    }
    return member;
}