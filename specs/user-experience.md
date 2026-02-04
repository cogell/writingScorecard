# User Experience

[Back to Index](./index.md)

---

## User Flow

```
1. Land on app  -->  2. Sign in (magic link)  -->  3. Enter text  -->  4. Submit  -->  5. View scorecard  -->  6. Reset or sign out
```

There is one page with three views: the **email login**, the **input form**, and the **scorecard results**. The app shows the login screen if no session exists, then toggles between input form and scorecard based on state.

---

## Screen 0: Email Login

Shown when no authenticated session exists.

### Layout

```
+-----------------------------------------------+
|  FAST Writing Scorecard                        |
|  Enter your email to receive a secure          |
|  sign-in link.                                 |
+-----------------------------------------------+
|  Email address                                 |
|  [________________________________]            |
+-----------------------------------------------+
|  [ Send sign-in link ]                         |
+-----------------------------------------------+
|  (success/error message area)                  |
+-----------------------------------------------+
```

### Elements

**Email input**
- Required, type `email`, autocomplete enabled
- Placeholder: "you@company.com"
- Client-side validation: basic email format (`\S+@\S+\.\S+`)

**Submit button**
- Label: "Send sign-in link"
- Disabled when email is invalid or while sending
- Uses primary (forest green) styling, full width

**Success message**
- Green bordered box: "Check your inbox for a sign-in link. It expires in about 5 minutes."
- Shown after successful magic link request

**Error message**
- Red bordered box: "We couldn't send your sign-in link. Please try again."
- Shown if magic link request fails

### States

| State | Button | Input | Other |
|-------|--------|-------|-------|
| Idle (invalid email) | Disabled | Enabled | -- |
| Idle (valid email) | Enabled | Enabled | -- |
| Sending | Disabled, text "Sending link..." | Disabled | -- |
| Sent | Hidden (form still visible) | Enabled | Green success message |
| Error | Enabled (to retry) | Enabled | Red error message |

### Session checking

On initial load, the app shows a minimal loading state ("Checking session...") while BetterAuth verifies whether a valid session cookie exists. This prevents a flash of the login screen for already-authenticated users.

---

## Screen 1: Text Input Form

Shown after successful authentication and after reset.

### Layout

```
+-----------------------------------------------+
|  FAST Writing Scorecard          user@email.com|
|  Framework for Assessing             [Sign out]|
|  Systematic Thinking                           |
+-----------------------------------------------+
|  Title (optional)                              |
|  [________________________________]            |
+-----------------------------------------------+
|  Your text                                     |
|  [                                            ]|
|  [          large textarea                    ]|
|  [          (64rem height)                    ]|
|  [                                            ]|
+-----------------------------------------------+
|  1,234 words                                   |
|  12,345 / 50,000 characters    [progress bar]  |
+-----------------------------------------------+
|  [ Evaluate Writing ]                          |
+-----------------------------------------------+
```

### Elements

**Title field (optional)**
- Text input, max 200 characters
- If left empty, the LLM infers a title from the text content
- Placeholder: "Title (optional - will be inferred from text)"

**Text area**
- Required, the main content to evaluate
- Minimum: 100 characters
- Maximum: 50,000 characters
- Large textarea with generous height (64rem)

**Character/word counter**
- Updates in real time as user types or pastes
- Word count: split on whitespace
- Character count shown as `current / 50,000`
- Color coding:
  - Under 100 chars: amber warning text
  - 100-50,000 chars: normal display
  - Over 50,000 chars: red error text

**Submit button**
- Label: "Evaluate Writing"
- Disabled when text is invalid (< 100 chars, > 50,000 chars)
- Uses primary (forest green) styling

### States

| State | Button | Inputs | Other |
|-------|--------|--------|-------|
| Empty / invalid | Disabled | Enabled | Counter shows warning color |
| Valid | Enabled (green) | Enabled | Counter in normal color |
| Loading | Disabled, text "Evaluating..." | Disabled | Spinner or loading indicator |
| Error | Enabled (to retry) | Enabled | Red error box above form |

---

## Screen 2: Scorecard Results

Shown after successful evaluation.

### Layout

```
+-----------------------------------------------+
|  FAST Writing Scorecard                        |
+-----------------------------------------------+
|  [Title of Text]              [ 7.2 / 10 ]    |
|  1,234 words  *  evaluated in 2.4s             |
+-----------------------------------------------+
|  Summary                                       |
|  This text demonstrates strong conceptual      |
|  clarity with well-defined terms and...        |
+-----------------------------------------------+
|                                                |
|  Clarity                              7.2      |
|  Precise language and explicit scope     (8.7) |
|                                                |
|  Simplexity                           6.1      |
|  Good balance of compression...          (7.6) |
|                                                |
|  Error Correction                     5.8      |
|  Acknowledges some limitations...        (7.3) |
|                                                |
|  Unity/Scope                          4.5      |
|  Scope is somewhat narrow...             (6.0) |
|                                                |
|  Pragmatic Return                     6.3      |
|  Offers actionable implications...       (7.8) |
|                                                |
+-----------------------------------------------+
|  [ Evaluate another text ]                     |
+-----------------------------------------------+
|  claude-haiku-4-5  *  2.4s  *  $0.0045        |
|  4,521 input tokens  *  342 output tokens      |
+-----------------------------------------------+
```

### Elements

**Header section**
- Title (from LLM response or user input)
- Overall score in a color-coded box (see [Scoring Framework](./scoring-framework.md#color-coding))
- Word count and processing time

**Summary section**
- 2-3 sentence assessment from the LLM
- Provides high-level takeaway before detailed scores

**Score rows (5 total)**

Each criterion row shows:
- Criterion name (bold)
- Criterion description (from constants)
- Calibrated score (large, color-coded)
- Provisional score (small, parenthetical, for reference)
- 1-sentence note explaining the score for this specific text

**Reset button**
- Label: "Evaluate another text"
- Clears state and returns to the input form

**Metadata footer**
- Model identifier (e.g., `claude-haiku-4-5`)
- Processing time in seconds
- Cost in USD
- Input and output token counts
- This metadata serves the transparency goal: users see exactly what went into their evaluation

---

## Error Handling

### Client-side validation

| Condition | Behavior |
|-----------|----------|
| Text < 100 characters | Submit button disabled, amber warning text under counter |
| Text > 50,000 characters | Submit button disabled, red error text under counter |
| Title > 200 characters | Input prevents further typing |

### API errors

Errors appear as a red box above the input form. The form remains usable so the user can correct and retry.

| Error Code | User-Facing Message | Cause |
|------------|---------------------|-------|
| `TEXT_TOO_SHORT` | "Text must be at least 100 characters" | Server-side validation catch |
| `TEXT_TOO_LONG` | "Text must not exceed 50,000 characters" | Server-side validation catch |
| `VALIDATION_ERROR` | "Invalid request format" | Malformed JSON body |
| `RATE_LIMITED` | "Too many requests, please try again later" | Rate limit exceeded |
| `AI_SERVICE_ERROR` | "Evaluation service temporarily unavailable" | Claude API failure |
| `AI_TIMEOUT` | "Evaluation timed out, please try again" | Claude API timeout |
| `INTERNAL_ERROR` | "Something went wrong" | Unexpected server error |

### Network errors

If the fetch call itself fails (no response from server), the UI shows: "Network error - could not connect to server."

---

## Interaction Details

### Paste behavior
- Text area accepts paste of any length; validation happens on character count
- Large pastes (50k+ chars) display the error state immediately

### Loading state
- Both inputs are disabled during evaluation
- Button text changes to "Evaluating..."
- No progress indicator (evaluation is non-streaming in Phase 1)
- Typical processing time: 2-5 seconds

### Reset behavior
- Clicking "Evaluate another text" clears all state
- Returns to blank input form (no text preserved from previous evaluation)
- Error state is also cleared

### Sign out behavior
- Header displays the user's email and a "Sign out" link
- Clicking "Sign out" calls `authClient.signOut()` which clears the session cookie
- On success, the app returns to the Email Login screen
- Sign out errors are logged to console but do not show a user-facing error
