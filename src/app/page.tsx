const endpoints: [string, string][] = [
  ["GET /health", "App and database status"],
  ["POST /auth/dev-login", "Token for a seeded user (development only)"],
  ["GET /tickets", "List with filters: status, team, assignee, customer, q, page, pageSize"],
  ["POST /tickets", "Create a ticket with its first message"],
  ["GET /tickets/{id}", "One ticket by number or id, with customer and SLA state"],
  ["PATCH /tickets/{id}", "Change status, team or assignee"],
  ["GET /tickets/{id}/messages", "The thread (internal notes included for staff)"],
  ["POST /tickets/{id}/messages", "Reply or internal note"],
  ["GET /customers/{id}", "Customer by id or code, with recent tickets"],
  ["GET /kb/articles", "List and keyword search"],
  ["GET /kb/articles/{id}", "One article by id or slug"],
  ["GET /reports/sla", "Breaches and response times per team (leads and admins)"],
];

export default function Home() {
  return (
    <main style={{ maxWidth: 760 }}>
      <h1 style={{ marginBottom: 4 }}>Helpdesk HQ</h1>
      <p style={{ marginTop: 0, color: "#555" }}>The course project for AI Agent Engineer. This app is a JSON API.</p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {endpoints.map(([route, what]) => (
            <tr key={route} style={{ borderTop: "1px solid #ddd" }}>
              <td style={{ padding: "6px 12px 6px 0", fontFamily: "monospace", whiteSpace: "nowrap" }}>{route}</td>
              <td style={{ padding: "6px 0" }}>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
