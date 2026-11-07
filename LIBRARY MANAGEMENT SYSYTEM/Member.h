#ifndef MEMBER_H
#define MEMBER_H

#include <string>
#include <vector>
using namespace std;



class Member {
private:
    int memberId;
    string name;
    string contact;
    vector<string> issuedIsbns;
    static const int MAX_BOOKS = 3;

public:
    Member();
    Member(int memberId, const string& name, const string& contact);

    int getId() const;
    string getName() const;
    string getContact() const;
    const vector<string>& getIssuedIsbns() const;

    void setName(const string& name);
    void setContact(const string& contact);

    bool canIssueMore() const;
    bool hasIssued(const string& isbn) const;
    void addIssuedBook(const string& isbn);
    bool removeIssuedBook(const string& isbn);

    static int maxBooks();

    void display() const;
    string serialize() const;
    static Member deserialize(const string& line);
};

#endif