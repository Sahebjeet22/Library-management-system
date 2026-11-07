#ifndef ISSUERECORD_H
#define ISSUERECORD_H

#include <string>
using namespace std;

class IssueRecord {
private:
    string isbn;
    int memberId;
    string issueDate;
    string dueDate;
    string returnDate;
    bool returned;

public:
    IssueRecord();
    IssueRecord(const string& isbn, int memberId, const string& issueDate, const string& dueDate);

    string getIsbn() const;
    int getMemberId() const;
    string getIssueDate() const;
    string getDueDate() const;
    string getReturnDate() const;
    bool isReturned() const;

    void markReturned(const string& date);

    void display() const;
    string serialize() const;
    static IssueRecord deserialize(const string& line);
};

#endif