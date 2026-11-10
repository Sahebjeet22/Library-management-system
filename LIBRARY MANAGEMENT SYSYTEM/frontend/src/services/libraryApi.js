import { mockLibraryApi } from './mockLibraryApi.js'

/** Set VITE_LIBRARY_API_URL to the origin serving the C++ REST adapter. */
export const API_BASE_URL = (import.meta.env.VITE_LIBRARY_API_URL || '').replace(/\/+$/, '')
export const isPreviewMode = !API_BASE_URL

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const raw = await response.text()
  let payload = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      throw new Error(`The library service returned an unreadable response (${response.status}).`)
    }
  }
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Library service request failed (${response.status}).`)
  }
  return payload
}

/**
 * Expected payload shapes: { books: Book[], members: Member[], loans: Loan[] }.
 * See API_INTEGRATION.md for the REST contract and field definitions.
 */
export const libraryApi = {
  async getSnapshot() {
    if (isPreviewMode) return mockLibraryApi.getSnapshot()
    const [books, members, loans] = await Promise.all([
      request('/api/books'),
      request('/api/members'),
      request('/api/loans'),
    ])
    return {
      books: Array.isArray(books) ? books : books.items || [],
      members: Array.isArray(members) ? members : members.items || [],
      loans: Array.isArray(loans) ? loans : loans.items || [],
    }
  },

  addBook: (payload) => isPreviewMode ? mockLibraryApi.addBook(payload) : request('/api/books', { method: 'POST', body: payload }),
  deleteBook: (id) => isPreviewMode ? mockLibraryApi.deleteBook(id) : request(`/api/books/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  addMember: (payload) => isPreviewMode ? mockLibraryApi.addMember(payload) : request('/api/members', { method: 'POST', body: payload }),
  deleteMember: (id) => isPreviewMode ? mockLibraryApi.deleteMember(id) : request(`/api/members/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  issueBook: (payload) => isPreviewMode ? mockLibraryApi.issueBook(payload) : request('/api/loans', { method: 'POST', body: payload }),
  returnBook: (loanId) => isPreviewMode ? mockLibraryApi.returnBook(loanId) : request(`/api/loans/${encodeURIComponent(loanId)}/return`, { method: 'POST', body: {} }),
}
