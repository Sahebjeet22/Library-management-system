#include "IssueRecord.h"
#include <iostream>
#include <sstream>
using namespace std;

IssueRecord::IssueRecord() : memberId(0), returned(false) {}

IssueRecord::IssueRecord(const string& isbn, int memberId, const string& issueDate, const string& dueDate)
    : isbn(isbn), memberId(memberId), issueDate(issueDate), dueDate(dueDate), returned(false) {}

string IssueRecord::getIsbn() const { return isbn; }
int IssueRecord::getMemberId() const { return memberId; }
string IssueRecord::getIssueDate() const { return issueDate; }
string IssueRecord::getDueDate() const { return dueDate; }
string IssueRecord::getReturnDate() const { return returnDate; }
bool IssueRecord::isReturned() const { return returned; }

void IssueRecord::markReturned(const string& date) {
    returnDate = date;
    returned = true;
}

void IssueRecord::display() const {
    cout << "ISBN: " << isbn
              << " | Member: " << memberId
              << " | Issued: " << issueDate
              << " | Due: " << dueDate
              << " | Returned: " << (returned ? returnDate : "No") << "\n";
}

string IssueRecord::serialize() const {
    return isbn + "|" + to_string(memberId) + "|" + issueDate + "|" +
           dueDate + "|" + returnDate + "|" + (returned ? "1" : "0");
}

IssueRecord IssueRecord::deserialize(const string& line) {
    stringstream ss(line);
    string isbn, memberId, issueDate, dueDate, returnDate, returned;
    getline(ss, isbn, '|');
    getline(ss, memberId, '|');
    getline(ss, issueDate, '|');
    getline(ss, dueDate, '|');
    getline(ss, returnDate, '|');
    getline(ss, returned, '|');

    IssueRecord record(isbn, stoi(memberId), issueDate, dueDate);
    if (returned == "1") {
        record.markReturned(returnDate);
    }
    return record;
}