#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include "Library.h"
#include <string>
using namespace std;


class FileManager {
private:
    string booksFile;
    string membersFile;
    string recordsFile;
    string metaFile;

public:
    FileManager(const string& booksFile = "books.txt",
                const string& membersFile = "members.txt",
                const string& recordsFile = "records.txt",
                const string& metaFile = "meta.txt");

    bool load(Library& library);
    bool save(const Library& library) const;
};

#endif