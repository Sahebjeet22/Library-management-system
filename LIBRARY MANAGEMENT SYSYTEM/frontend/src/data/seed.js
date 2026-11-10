export const seedBooks = [
  { id: 'BK-1084', title: 'The Creative Act', author: 'Rick Rubin', isbn: '978-0-593-53930-5', category: 'Design & Arts', shelf: 'A-03-12', year: 2023, status: 'Available', addedAt: '2026-10-28' },
  { id: 'BK-1083', title: 'The Architecture of Happiness', author: 'Alain de Botton', isbn: '978-0-375-42405-2', category: 'Architecture', shelf: 'C-01-08', year: 2006, status: 'Issued', addedAt: '2026-10-26' },
  { id: 'BK-1082', title: 'A Little History of the World', author: 'E. H. Gombrich', isbn: '978-0-300-10863-7', category: 'History', shelf: 'B-02-04', year: 2005, status: 'Available', addedAt: '2026-10-21' },
  { id: 'BK-1081', title: 'Ways of Seeing', author: 'John Berger', isbn: '978-0-14-013515-2', category: 'Design & Arts', shelf: 'A-01-03', year: 1972, status: 'Issued', addedAt: '2026-10-18' },
  { id: 'BK-1080', title: 'The Design of Everyday Things', author: 'Don Norman', isbn: '978-0-465-05065-9', category: 'Design & Arts', shelf: 'A-03-04', year: 2013, status: 'Available', addedAt: '2026-10-16' },
  { id: 'BK-1079', title: 'The Anthropocene Reviewed', author: 'John Green', isbn: '978-0-525-51135-9', category: 'Literature', shelf: 'D-04-06', year: 2021, status: 'Available', addedAt: '2026-10-14' },
  { id: 'BK-1078', title: 'The Information', author: 'James Gleick', isbn: '978-1-4000-9623-7', category: 'Technology', shelf: 'E-02-10', year: 2011, status: 'Issued', addedAt: '2026-10-11' },
  { id: 'BK-1077', title: 'The Story of Art', author: 'E. H. Gombrich', isbn: '978-0-7148-3247-0', category: 'Design & Arts', shelf: 'A-02-01', year: 1995, status: 'Available', addedAt: '2026-10-09' },
  { id: 'BK-1076', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0-374-27563-1', category: 'Psychology', shelf: 'F-01-07', year: 2011, status: 'Available', addedAt: '2026-10-06' },
  { id: 'BK-1075', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '978-0-441-47812-5', category: 'Literature', shelf: 'D-02-11', year: 1969, status: 'Available', addedAt: '2026-10-03' },
  { id: 'BK-1074', title: 'The Design of Cities', author: 'Edmund N. Bacon', isbn: '978-0-14-004236-8', category: 'Architecture', shelf: 'C-02-09', year: 1974, status: 'Issued', addedAt: '2026-09-29' },
  { id: 'BK-1073', title: 'The Republic', author: 'Plato', isbn: '978-0-14-045511-3', category: 'Philosophy', shelf: 'G-01-02', year: 2007, status: 'Available', addedAt: '2026-09-24' },
]

export const seedMembers = [
  { id: 'MB-2048', name: 'Maya Chen', email: 'maya.chen@example.edu', department: 'Architecture', joinedAt: '2026-08-12', status: 'Active' },
  { id: 'MB-2047', name: 'Oliver James', email: 'oliver.james@example.edu', department: 'Design', joinedAt: '2026-08-09', status: 'Active' },
  { id: 'MB-2046', name: 'Amina Rahman', email: 'amina.rahman@example.edu', department: 'History', joinedAt: '2026-08-06', status: 'Active' },
  { id: 'MB-2045', name: 'Leo Martins', email: 'leo.martins@example.edu', department: 'Computer Science', joinedAt: '2026-07-28', status: 'Active' },
  { id: 'MB-2044', name: 'Sofia Patel', email: 'sofia.patel@example.edu', department: 'Literature', joinedAt: '2026-07-22', status: 'Active' },
  { id: 'MB-2043', name: 'Noah Williams', email: 'noah.williams@example.edu', department: 'Philosophy', joinedAt: '2026-07-18', status: 'Active' },
  { id: 'MB-2042', name: 'Elena Rossi', email: 'elena.rossi@example.edu', department: 'Fine Arts', joinedAt: '2026-07-11', status: 'Active' },
  { id: 'MB-2041', name: 'Samir Haddad', email: 'samir.haddad@example.edu', department: 'Psychology', joinedAt: '2026-06-30', status: 'Active' },
]

export const seedLoans = [
  { id: 'LN-2405', bookId: 'BK-1074', memberId: 'MB-2045', issuedAt: '2026-11-03', dueAt: '2026-11-17', returnedAt: null },
  { id: 'LN-2404', bookId: 'BK-1078', memberId: 'MB-2047', issuedAt: '2026-10-20', dueAt: '2026-11-03', returnedAt: null },
  { id: 'LN-2403', bookId: 'BK-1081', memberId: 'MB-2044', issuedAt: '2026-10-29', dueAt: '2026-11-12', returnedAt: null },
  { id: 'LN-2402', bookId: 'BK-1083', memberId: 'MB-2048', issuedAt: '2026-10-22', dueAt: '2026-11-05', returnedAt: null },
]
