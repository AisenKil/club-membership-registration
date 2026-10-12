# Instructor Demo Outline (5–7 minutes)

1. **Introduction (30–45 sec):** Explain that Clubhouse is a membership registration form connected to an Express REST API and MySQL.
2. **Frontend form (1 min):** Show the controlled inputs, change handler, checkbox, custom hook, loading/error state, and field validation.
3. **Create a member (1 min):** Submit a valid registration. Show the success notice and new directory row.
4. **Search and filter (45 sec):** Search by a name/email/club and select a specific club. Explain query-string filtering.
5. **Edit and delete (1 min):** Update a member, then demonstrate the delete action with a sample record.
6. **Backend / database (1–1.5 min):** Show `server/src/routes/members.js`, named route handlers, validation, `?` parameter placeholders, and the connection pool in `db.js`.
7. **Persistence and closing (30–45 sec):** Restart the API and reload the page; show the same records are still stored in MySQL. Mention the Docker volume and schema seed data.

## Questions to prepare for

- Why validate data on both client and server?
- Why use parameterized SQL statements?
- What does CORS allow the browser to do?
- How do `useEffect`, the custom hook, and `useReducer` work together?
- How does the Docker volume preserve records?
