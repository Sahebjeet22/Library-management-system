# Connecting the React frontend to the C++ Library Management System

The frontend and the existing C++ program remain separate projects. The browser communicates with an HTTP API that you add around your current C++ classes and file-handling methods; those existing methods continue to be the only persistence layer. This frontend does not create a database. Its initial preview adapter stores sample records in browser memory only, so preview changes reset when the page reloads.

## 1. Expose a small REST API from the C++ application

Keep your book, member, issue, return, and file I/O classes as they are. Add an HTTP/controller layer that parses JSON, calls those existing class methods, and serializes the result. Use whatever HTTP library fits your project (for example, a lightweight C++ HTTP server); this repository intentionally does not include or modify the C++ source.

At a high level, an issue handler should parse `bookId` and `memberId`, look up those objects through your existing library/class composition, verify the member is active and the copy is available, reject invalid requests, call your existing issue operation, and persist through your existing file-writing code. Return the resulting loan record as JSON. Use your actual class and method names; the following is schematic rather than compilable code:

```text
POST /api/loans:
  request = parse_json(body)
  book = library.find_book(request.bookId)
  member = library.find_member(request.memberId)
  if member is missing or inactive: return 409 { "message": "This member is inactive and cannot borrow books." }
  if book is unavailable: return 409 { "message": "That book is no longer available." }
  loan = library.issue(book, member)
  existing_file_handler.save(library)
  return 201 serialize(loan)
```

| Method | Endpoint | Request / response |
| --- | --- | --- |
| `GET` | `/api/books` | Return a JSON array of books, or `{ "items": [...] }`. |
| `POST` | `/api/books` | Accept `{ "title", "author", "isbn", "category", "shelf", "year" }`; return the created book object. |
| `DELETE` | `/api/books/{id}` | Remove a book only if it is not currently on loan. Return `204` or a JSON success result. |
| `GET` | `/api/members` | Return a JSON array of members, or `{ "items": [...] }`. |
| `POST` | `/api/members` | Accept `{ "name", "email", "department" }`; return the created member object. |
| `DELETE` | `/api/members/{id}` | Remove a member only if there are no active loans. Return `204` or a JSON success result. |
| `GET` | `/api/loans` | Return a JSON array of issue/return records, or `{ "items": [...] }`. |
| `POST` | `/api/loans` | Accept `{ "bookId", "memberId" }`; verify the member is active and the book is available, persist the issue through the existing C++ logic, and return the loan object. |
| `POST` | `/api/loans/{id}/return` | Process the return in the existing C++ logic, make the copy available, and return the updated loan (or `204`). |

Recommended response fields are documented below. Keep your existing file format and class ownership rules; translate to and from these JSON fields only at the API boundary. Return a non-2xx status and a useful message when validation fails, for example `{ "message": "That book is no longer available." }`.

### JSON response fields

```json
{
  "book": {
    "id": "BK-1084",
    "title": "The Creative Act",
    "author": "Rick Rubin",
    "isbn": "978-0-593-53930-5",
    "category": "Design & Arts",
    "shelf": "A-03-12",
    "year": 2023,
    "status": "Available",
    "addedAt": "2026-10-28"
  },
  "member": {
    "id": "MB-2048",
    "name": "Maya Chen",
    "email": "maya.chen@example.edu",
    "department": "Architecture",
    "joinedAt": "2026-08-12",
    "status": "Active"
  },
  "loan": {
    "id": "LN-2405",
    "bookId": "BK-1074",
    "memberId": "MB-2045",
    "issuedAt": "2026-11-03",
    "dueAt": "2026-11-17",
    "returnedAt": null
  }
}
```

Use ISO dates (`YYYY-MM-DD`) and stable string IDs. Loan records with `returnedAt: null` are active. The UI derives `Overdue` when an active loan's `dueAt` is before today; the underlying API should still enforce the actual issue/return rules, including rejecting inactive members. Preserve `status` values as `Available`/`Issued` for books and `Active` for members, or normalize your own C++ terminology to these values at the adapter boundary.

## 2. Set the API URL for the frontend

Create a frontend environment file named `.env.local` in this project (it is git-ignored by Vite when named conventionally) and set the API origin:

```sh
VITE_LIBRARY_API_URL=http://localhost:8080
```

Use the actual address and port of your C++ HTTP service. For deployment, set `VITE_LIBRARY_API_URL` to the reachable HTTPS API origin in the frontend build environment; `VITE_` values are public browser configuration, not secrets. Rebuild the frontend after changing it. Leave this value unset to use the in-memory sample preview.

From this frontend project's directory, install the pinned dependencies, copy `.env.example` to `.env.local`, set the API origin, then start the Vite preview server:

```sh
npm ci
cp .env.example .env.local
# Edit .env.local so VITE_LIBRARY_API_URL points to your C++ HTTP API.
npm run dev
```

The production static bundle is created with `npm run build` in `dist/`.

The API service is isolated in `src/services/libraryApi.js`. It centralizes the base URL, HTTP parsing, errors and endpoint paths. `src/services/mockLibraryApi.js` is the preview implementation. Pages call the same service interface in either mode, so ordinary UI code does not need to know whether it is using mock records or C++.

## 3. Allow browser requests

If the frontend and C++ API use different origins, configure CORS in the C++ HTTP layer for the frontend's exact origin, allow `GET`, `POST`, `DELETE`, and the `Content-Type` header, and answer browser `OPTIONS` preflight requests. Do not use `Access-Control-Allow-Origin: *` if you later add authenticated credentials. If frontend/API are served from one origin, a reverse proxy can route `/api/*` to C++ and static page paths to the React build, avoiding cross-origin setup.

For a school/local demo, start the C++ API and Vite dev server separately. A browser page cannot call a C++ console program directly; the HTTP listener is the bridge. Do not write browser-originated data to a new database: the C++ endpoint should invoke your current file-backed methods.

## Project map

- `src/pages/` contains the dashboard, book catalog, member register, and issue/return screens.
- `src/components/` contains shared navigation, dialogs, status, pagination, and notification UI.
- `src/data/seed.js` contains preview-only sample records.
- `src/services/mockLibraryApi.js` implements the in-memory preview operations.
- `src/services/libraryApi.js` defines the REST API boundary and selects the configured C++ service.
- `API_INTEGRATION.md` is this backend connection guide.
