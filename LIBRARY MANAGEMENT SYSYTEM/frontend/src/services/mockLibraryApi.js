import { seedBooks, seedLoans, seedMembers } from '../data/seed.js'

let books = structuredClone(seedBooks)
let members = structuredClone(seedMembers)
let loans = structuredClone(seedLoans)

const wait = (ms = 180) => new Promise((resolve) => window.setTimeout(resolve, ms))
const nextId = (prefix, records) => {
  const max = records.reduce((highest, item) => Math.max(highest, Number(item.id.split('-')[1]) || 0), 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}
const today = () => new Date().toISOString().slice(0, 10)

export const mockLibraryApi = {
  async getSnapshot() {
    await wait(220)
    return structuredClone({ books, members, loans })
  },

  async addBook(input) {
    await wait()
    const isbn = String(input.isbn || '').trim()
    if (isbn && books.some((book) => book.isbn === isbn)) throw new Error('A book with this ISBN is already in the catalog.')
    const book = {
      id: nextId('BK', books),
      title: String(input.title).trim(),
      author: String(input.author).trim(),
      isbn,
      category: String(input.category).trim(),
      shelf: String(input.shelf).trim(),
      year: Number(input.year) || new Date().getFullYear(),
      status: 'Available',
      addedAt: today(),
    }
    books = [book, ...books]
    return structuredClone(book)
  },

  async deleteBook(id) {
    await wait()
    if (loans.some((loan) => loan.bookId === id && !loan.returnedAt)) throw new Error('This copy is on loan. Process its return before removing it.')
    const exists = books.some((book) => book.id === id)
    if (!exists) throw new Error('That book could not be found.')
    books = books.filter((book) => book.id !== id)
  },

  async addMember(input) {
    await wait()
    const email = String(input.email).trim().toLowerCase()
    if (members.some((member) => member.email.toLowerCase() === email)) throw new Error('A member with this email address is already registered.')
    const member = {
      id: nextId('MB', members),
      name: String(input.name).trim(),
      email,
      department: String(input.department).trim(),
      joinedAt: today(),
      status: 'Active',
    }
    members = [member, ...members]
    return structuredClone(member)
  },

  async deleteMember(id) {
    await wait()
    if (loans.some((loan) => loan.memberId === id && !loan.returnedAt)) throw new Error('This member has an active loan. Process the return before removing the member.')
    const exists = members.some((member) => member.id === id)
    if (!exists) throw new Error('That member could not be found.')
    members = members.filter((member) => member.id !== id)
  },

  async issueBook({ bookId, memberId }) {
    await wait()
    const book = books.find((item) => item.id === bookId)
    const member = members.find((item) => item.id === memberId)
    if (!book) throw new Error('Select a book from the current catalog.')
    if (!member) throw new Error('Select a registered member.')
    if ((member.status || 'Active') !== 'Active') throw new Error('This member is inactive and cannot borrow books.')
    if (book.status !== 'Available') throw new Error('That book is no longer available.')
    const issuedAt = today()
    const due = new Date(`${issuedAt}T12:00:00`)
    due.setDate(due.getDate() + 14)
    const loan = {
      id: nextId('LN', loans),
      bookId,
      memberId,
      issuedAt,
      dueAt: due.toISOString().slice(0, 10),
      returnedAt: null,
    }
    book.status = 'Issued'
    loans = [loan, ...loans]
    return structuredClone(loan)
  },

  async returnBook(loanId) {
    await wait()
    const loan = loans.find((item) => item.id === loanId)
    if (!loan) throw new Error('That loan could not be found.')
    if (loan.returnedAt) throw new Error('This book has already been returned.')
    loan.returnedAt = today()
    const book = books.find((item) => item.id === loan.bookId)
    if (book) book.status = 'Available'
    return structuredClone(loan)
  },
}
