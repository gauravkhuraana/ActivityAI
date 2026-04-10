# BDD Testing Skill

Domain knowledge for writing Cucumber/Gherkin tests for the Employee Manager application.

## Application Context

| Item | Value |
|------|-------|
| Frontend URL | `http://localhost:5173` |
| Backend URL | `http://localhost:4000` |
| BDD Framework | `@cucumber/cucumber` + Playwright (Chromium) |
| Config file | `tests/bdd/cucumber.js` |
| Run command | `npm run test:bdd` |

## Step Catalogue

### Given Steps

| Step | Description |
|------|-------------|
| `the application is running` | Health-checks `GET /employees` |
| `I am on the login page` | Navigates to `/login` |
| `I am logged in as {string} with password {string}` | Full login flow + `waitForURL('**/list')` |
| `the employee list is empty` | Deletes all employees via API + `page.reload()` |
| `an employee exists with name {string}, email {string}, position {string}` | Seeds one employee via `POST /employees` + reload |
| `the following employees exist:` | Seeds multiple employees from DataTable + reload |
| `I am not logged in` | Clears `localStorage.loggedIn` and `localStorage.username` |
| `I am on the {string} page` | Navigates to `BASE_URL + path` |

### When Steps

| Step | Description |
|------|-------------|
| `I enter username {string} and password {string}` | Fills Username + Password fields |
| `I click the Login button` | Clicks Login button |
| `I click the Login button without entering credentials` | Clicks Login with empty fields |
| `I click the Logoff button` | Clicks Logoff button |
| `I click the {string} button` | Generic button click by text |
| `I click the {string} button for {string}` | Scoped to `tr` containing employee name |
| `I fill in {string} with {string}` | `page.getByLabel(label).fill(value)` |
| `I change {string} to {string}` | Clears then fills a field |
| `I submit the employee form` | Clicks "Add Employee" |
| `I submit the update form` | Clicks "Update Employee" |
| `I confirm the deletion` | Clicks "Delete" inside MUI dialog |
| `I cancel the deletion` | Clicks "Cancel" inside MUI dialog |
| `I type {string} in the search field` | Fills `Search employees` label |
| `I clear the search field` | Clears `Search employees` label |
| `I click {string} in the navigation bar` | `page.getByRole('link', { name })` |
| `I try to access {string}` | Direct navigation to path |
| `I navigate to the employee list page` | Navigates to `/list` |

### Then Steps

| Step | Description |
|------|-------------|
| `I should be redirected to the employee list page` | `waitForURL('**/list')` + assert |
| `I should be redirected to the login page` | `waitForURL('**/login')` + assert |
| `I should see {string} on the page` | `getByText(text).waitFor({ state: 'visible' })` |
| `I should see the error message {string}` | Same as above |
| `I should remain on the login page` | Assert URL matches `/login` |
| `my session should be cleared` | Assert `localStorage.loggedIn === null` |
| `I should see a success message {string}` | Waits for snackbar text (5 s timeout) |
| `I should see {string} in the employee table` | Waits for text visible |
| `I should not see {string} in the employee table` | Waits for text hidden |
| `I should see the employee details dialog` | Waits for MUI dialog |
| `the dialog should show name/email/position {string}` | Waits for text in dialog |
| `I should see {int} employees in the table` | Counts `tbody tr` excluding empty-state row |
| `I should be on the {string} page` | `waitForURL(**path)` + assert |

## Tag Conventions

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical path — run in every CI stage |
| `@auth` | Authentication and route guard tests |
| `@crud` | Employee CRUD operations |
| `@search` | Search and filter scenarios |
| `@navigation` | Navigation bar and route transitions |
| `@regression` | Full regression (slow, browser-heavy) |

## Feature File Conventions

- Use `Background:` for shared login + empty-state setup
- One `Scenario:` per business behaviour
- Use `Scenario Outline:` only for data-driven tests with 3+ examples
- Prefer named employees (`"John Doe"`) over generic ones (`"Employee 1"`)
- Keep steps declarative: *what*, not *how* (avoid "click the button with id='submit'")

## Empty State Pitfall

The MUI table **always** renders a `<TableRow>` when no data is present — the row contains the text "No employees found.". Never use `I should see 0 employees in the table`. Instead:

```gherkin
Then I should see "No employees found."
```

## Known Step Limitations

| Limitation | Workaround |
|-----------|------------|
| `I should not see "X" in the employee table` waits for *hidden* — fails if text never rendered | Only use after confirming text was previously visible or after performing a delete |
| `I should see {int} employees` filters out the empty-state row | Row count step is safe as long as employees exist |
| Theme toggle steps removed — flaky due to CSS computed value differences | Avoid asserting pixel colors; use feature flags or data attributes instead |
