#include "httplib.h"
#include "Library.h"
#include "FileManager.h"
#include <cctype>
#include <cstdlib>
#include <iostream>
#include <mutex>
#include <sstream>
#include <string>
using namespace std;

static mutex dataMutex;

static string jsonQuote(const string& s)
{
    string out = "\"";
    for (char c : s)
    {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out + "\"";
}

static bool valueStart(const string& body, const string& key, size_t& pos)
{
    string needle = "\"" + key + "\"";
    size_t k = body.find(needle);
    if (k == string::npos) return false;
    size_t colon = body.find(':', k + needle.size());
    if (colon == string::npos) return false;
    pos = colon + 1;
    while (pos < body.size() && isspace((unsigned char)body[pos])) pos++;
    return pos < body.size();
}

static string getString(const string& body, const string& key)
{
    size_t p;
    if (!valueStart(body, key, p) || body[p] != '"') return "";
    string out;
    for (size_t i = p + 1; i < body.size(); i++)
    {
        if (body[i] == '\\' && i + 1 < body.size()) { i++; out += body[i]; }
        else if (body[i] == '"') break;
        else out += body[i];
    }
    return out;
}

static int getInt(const string& body, const string& key, int fallback)
{
    size_t p;
    if (!valueStart(body, key, p)) return fallback;
    if (body[p] == '"') return atoi(getString(body, key).c_str());
    return atoi(body.c_str() + p);
}

static void sendError(httplib::Response& res, int status, const string& message)
{
    res.status = status;
    res.set_content(string("{\"message\":") + jsonQuote(message) + "}", "application/json");
}

static string bookJson(const Book& b)
{
    ostringstream o;
    o << "{\"id\":" << jsonQuote(b.getIsbn())
      << ",\"isbn\":" << jsonQuote(b.getIsbn())
      << ",\"title\":" << jsonQuote(b.getTitle())
      << ",\"author\":" << jsonQuote(b.getAuthor())
      << ",\"totalCopies\":" << b.getTotalCopies()
      << ",\"availableCopies\":" << b.getAvailableCopies() << "}";
    return o.str();
}

static string memberJson(const Member& m)
{
    ostringstream o;
    o << "{\"id\":" << m.getId()
      << ",\"name\":" << jsonQuote(m.getName())
      << ",\"contact\":" << jsonQuote(m.getContact())
      << ",\"activeLoans\":" << m.getIssuedIsbns().size() << "}";
    return o.str();
}

static string loanJson(int index, const IssueRecord& r, Library& library)
{
    Book* b = library.getBook(r.getIsbn());
    Member* m = library.getMember(r.getMemberId());
    ostringstream o;
    o << "{\"id\":" << index
      << ",\"isbn\":" << jsonQuote(r.getIsbn())
      << ",\"memberId\":" << r.getMemberId()
      << ",\"bookTitle\":" << jsonQuote(b ? b->getTitle() : "")
      << ",\"memberName\":" << jsonQuote(m ? m->getName() : "")
      << ",\"issuedAt\":" << jsonQuote(r.getIssueDate())
      << ",\"dueAt\":" << jsonQuote(r.getDueDate())
      << ",\"returnedAt\":" << (r.isReturned() ? jsonQuote(r.getReturnDate()) : string("null"))
      << "}";
    return o.str();
}

int main()
{
    Library library;
    FileManager fileManager;
    fileManager.load(library);

    httplib::Server server;

    server.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Accept");
        if (req.method == "OPTIONS")
        {
            res.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    // Books
    server.Get("/api/books", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        ostringstream o;
        o << "[";
        bool first = true;
        for (const Book& b : library.getBooks())
        {
            if (!first) o << ",";
            first = false;
            o << bookJson(b);
        }
        o << "]";
        res.set_content(o.str(), "application/json");
    });

    server.Post("/api/books", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string isbn = getString(req.body, "isbn");
        string title = getString(req.body, "title");
        string author = getString(req.body, "author");
        int copies = getInt(req.body, "totalCopies", getInt(req.body, "copies", 1));
        if (isbn.empty()) return sendError(res, 400, "ISBN is required.");
        if (copies <= 0) return sendError(res, 400, "Copies must be at least 1.");
        if (library.getBook(isbn) != nullptr) return sendError(res, 409, "A book with this ISBN already exists.");
        library.addBook(Book(isbn, title, author, copies));
        fileManager.save(library);
        res.status = 201;
        res.set_content(bookJson(*library.getBook(isbn)), "application/json");
    });

    server.Delete(R"(/api/books/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string isbn = req.matches[1].str();
        if (library.getBook(isbn) == nullptr) return sendError(res, 404, "Book not found.");
        if (!library.removeBook(isbn)) return sendError(res, 409, "Cannot delete this book while copies are on loan.");
        fileManager.save(library);
        res.set_content("{}", "application/json");
    });

    // Members
    server.Get("/api/members", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        ostringstream o;
        o << "[";
        bool first = true;
        for (const Member& m : library.getMembers())
        {
            if (!first) o << ",";
            first = false;
            o << memberJson(m);
        }
        o << "]";
        res.set_content(o.str(), "application/json");
    });

    server.Post("/api/members", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string name = getString(req.body, "name");
        string contact = getString(req.body, "contact");
        if (name.empty()) return sendError(res, 400, "Name is required.");
        int id = library.addMember(name, contact);
        fileManager.save(library);
        res.status = 201;
        res.set_content(memberJson(*library.getMember(id)), "application/json");
    });

    server.Delete(R"(/api/members/([0-9]+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int id = atoi(req.matches[1].str().c_str());
        if (library.getMember(id) == nullptr) return sendError(res, 404, "Member not found.");
        if (!library.removeMember(id)) return sendError(res, 409, "Cannot remove a member who still has books issued.");
        fileManager.save(library);
        res.set_content("{}", "application/json");
    });

    // Loans (a loan's id is its position in the records list)
    server.Get("/api/loans", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        const vector<IssueRecord>& records = library.getRecords();
        ostringstream o;
        o << "[";
        for (size_t i = 0; i < records.size(); i++)
        {
            if (i > 0) o << ",";
            o << loanJson((int)i, records[i], library);
        }
        o << "]";
        res.set_content(o.str(), "application/json");
    });

    server.Post("/api/loans", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string isbn = getString(req.body, "isbn");
        int memberId = getInt(req.body, "memberId", 0);
        string message;
        if (!library.issueBook(isbn, memberId, message)) return sendError(res, 400, message);
        fileManager.save(library);
        res.status = 201;
        res.set_content(string("{\"message\":") + jsonQuote(message) + "}", "application/json");
    });

    server.Post(R"(/api/loans/([0-9]+)/return)", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int index = atoi(req.matches[1].str().c_str());
        const vector<IssueRecord>& records = library.getRecords();
        if (index < 0 || index >= (int)records.size()) return sendError(res, 404, "Loan not found.");
        string isbn = records[index].getIsbn();
        int memberId = records[index].getMemberId();
        string message;
        if (!library.returnBook(isbn, memberId, message)) return sendError(res, 400, message);
        fileManager.save(library);
        res.set_content(string("{\"message\":") + jsonQuote(message) + "}", "application/json");
    });

    cout << "Library API running on http://localhost:8080 (Ctrl+C to stop)\n";
    server.listen("0.0.0.0", 8080);
    return 0;
}