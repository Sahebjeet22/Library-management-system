#include "FileManager.h"
#include <fstream>
#include <vector>
using namespace std;


FileManager::FileManager(const string& booksFile,
                         const string& membersFile,
                         const string& recordsFile,
                         const string& metaFile)
    : booksFile(booksFile), membersFile(membersFile), recordsFile(recordsFile), metaFile(metaFile) {}

bool FileManager::load(Library& library) {
    vector<Book> books;
    vector<Member> members;
    vector<IssueRecord> records;
    int nextId = 1;

    ifstream bf(booksFile);
    string line;
    while (getline(bf, line)) {
        if (!line.empty()) {
            books.push_back(Book::deserialize(line));
        }
    }

    ifstream mf(membersFile);
    while (getline(mf, line)) {
        if (!line.empty()) {
            members.push_back(Member::deserialize(line));
        }
    }

    ifstream rf(recordsFile);
    while (getline(rf, line)) {
        if (!line.empty()) {
            records.push_back(IssueRecord::deserialize(line));
        }
    }

    ifstream meta(metaFile);
    if (meta) {
        meta >> nextId;
    }

    library.setBooks(books);
    library.setMembers(members);
    library.setRecords(records);
    library.setNextMemberId(nextId);
    return true;
}

bool FileManager::save(const Library& library) const {
    ofstream bf(booksFile);
    if (!bf) {
        return false;
    }
    for (const auto& b : library.getBooks()) {
        bf << b.serialize() << "\n";
    }

    ofstream mf(membersFile);
    if (!mf) {
        return false;
    }
    for (const auto& m : library.getMembers()) {
        mf << m.serialize() << "\n";
    }

    ofstream rf(recordsFile);
    if (!rf) {
        return false;
    }
    for (const auto& r : library.getRecords()) {
        rf << r.serialize() << "\n";
    }

    ofstream meta(metaFile);
    if (!meta) {
        return false;
    }
    meta << library.getNextMemberId() << "\n";

    return true;
}