#include "Library.h"
#include "FileManager.h"
#include <iostream>
#include <limits>
#include <string>
using namespace std;

void clearInput()
{
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

int readInt(const string &prompt)
{
    int value;
    cout << prompt;
    while (!(cin >> value))
    {
        cout << "Invalid number. Try again: ";
        clearInput();
    }
    clearInput();
    return value;
}

string readLine(const string &prompt)
{
    string value;
    cout << prompt;
    getline(cin, value);
    return value;
}

void bookMenu(Library &library)
{
    while (true)
    {
        cout << "\n--- Book Management ---\n"
             << "1. Add book\n"
             << "2. Remove book\n"
             << "3. Update book\n"
             << "4. Search books\n"
             << "5. Show all books\n"
             << "0. Back\n";
        int choice = readInt("Choose: ");

        if (choice == 0)
        {
            return;
        }
        else if (choice == 1)
        {
            string isbn = readLine("ISBN: ");
            if (library.getBook(isbn) != nullptr)
            {
                cout << "A book with this ISBN already exists.\n";
                continue;
            }
            string title = readLine("Title: ");
            string author = readLine("Author: ");
            int copies = readInt("Total copies: ");
            if (copies <= 0)
            {
                cout << "Copies must be at least 1.\n";
                continue;
            }
            library.addBook(Book(isbn, title, author, copies));
            cout << "Book added.\n";
        }
        else if (choice == 2)
        {
            string isbn = readLine("ISBN to remove: ");
            if (library.removeBook(isbn))
            {
                cout << "Book removed.\n";
            }
            else
            {
                cout << "Cannot remove. Book not found or copies are currently issued.\n";
            }
        }
        else if (choice == 3)
        {
            string isbn = readLine("ISBN to update: ");
            Book *b = library.getBook(isbn);
            if (b == nullptr)
            {
                cout << "Book not found.\n";
                continue;
            }
            string title = readLine("New title: ");
            string author = readLine("New author: ");
            int copies = readInt("New total copies: ");
            if (copies <= 0)
            {
                cout << "Copies must be at least 1.\n";
                continue;
            }
            library.updateBook(isbn, title, author, copies);
            cout << "Book updated.\n";
        }
        else if (choice == 4)
        {
            string keyword = readLine("Search by title, author, or ISBN: ");
            auto results = library.searchBooks(keyword);
            if (results.empty())
            {
                cout << "No matches found.\n";
            }
            for (Book *b : results)
            {
                b->display();
            }
        }
        else if (choice == 5)
        {
            library.showAllBooks();
        }
        else
        {
            cout << "Invalid choice.\n";
        }
    }
}

void memberMenu(Library &library)
{
    while (true)
    {
        cout << "\n--- Member Management ---\n"
             << "1. Register member\n"
             << "2. Remove member\n"
             << "3. Update member\n"
             << "4. Show all members\n"
             << "0. Back\n";
        int choice = readInt("Choose: ");

        if (choice == 0)
        {
            return;
        }
        else if (choice == 1)
        {
            string name = readLine("Name: ");
            string contact = readLine("Contact: ");
            int id = library.addMember(name, contact);
            cout << "Member registered with ID " << id << ".\n";
        }
        else if (choice == 2)
        {
            int id = readInt("Member ID to remove: ");
            if (library.removeMember(id))
            {
                cout << "Member removed.\n";
            }
            else
            {
                cout << "Cannot remove. Member not found or still has books issued.\n";
            }
        }
        else if (choice == 3)
        {
            int id = readInt("Member ID to update: ");
            if (library.getMember(id) == nullptr)
            {
                cout << "Member not found.\n";
                continue;
            }
            string name = readLine("New name: ");
            string contact = readLine("New contact: ");
            library.updateMember(id, name, contact);
            cout << "Member updated.\n";
        }
        else if (choice == 4)
        {
            library.showAllMembers();
        }
        else
        {
            cout << "Invalid choice.\n";
        }
    }
}

void issueMenu(Library &library)
{
    while (true)
    {
        cout << "\n--- Issue & Return ---\n"
             << "1. Issue book\n"
             << "2. Return book\n"
             << "3. Check availability\n"
             << "4. Show currently issued books\n"
             << "5. Show full issue history\n"
             << "0. Back\n";
        int choice = readInt("Choose: ");

        if (choice == 0)
        {
            return;
        }
        else if (choice == 1)
        {
            string isbn = readLine("ISBN: ");
            int id = readInt("Member ID: ");
            string message;
            library.issueBook(isbn, id, message);
            cout << message << "\n";
        }
        else if (choice == 2)
        {
            string isbn = readLine("ISBN: ");
            int id = readInt("Member ID: ");
            string message;
            library.returnBook(isbn, id, message);
            cout << message << "\n";
        }
        else if (choice == 3)
        {
            string isbn = readLine("ISBN: ");
            Book *b = library.getBook(isbn);
            if (b == nullptr)
            {
                cout << "Book not found.\n";
            }
            else if (b->isAvailable())
            {
                cout << "Available (" << b->getAvailableCopies() << " of " << b->getTotalCopies() << " copies).\n";
            }
            else
            {
                cout << "Not available. All " << b->getTotalCopies() << " copies are issued.\n";
            }
        }
        else if (choice == 4)
        {
            library.showActiveIssues();
        }
        else if (choice == 5)
        {
            library.showIssueRecords();
        }
        else
        {
            cout << "Invalid choice.\n";
        }
    }
}

int main()
{
    Library library;
    FileManager fileManager;
    fileManager.load(library);

    while (true)
    {
        cout << "\n===== Library Management System =====\n"
             << "1. Books\n"
             << "2. Members\n"
             << "3. Issue / Return\n"
             << "0. Save and exit\n";
        int choice = readInt("Choose: ");

        if (choice == 0)
        {
            if (fileManager.save(library))
            {
                cout << "Data saved. Goodbye.\n";
            }
            else
            {
                cout << "Warning: could not save data.\n";
            }
            break;
        }
        else if (choice == 1)
        {
            bookMenu(library);
        }
        else if (choice == 2)
        {
            memberMenu(library);
        }
        else if (choice == 3)
        {
            issueMenu(library);
        }
        else
        {
            cout << "Invalid choice.\n";
        }
    }
    return 0;
}