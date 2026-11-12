# Connected classroom journeys

Teachers create classes and share replaceable invite codes. Signed-in learners preview the invitation and choose a class display name before joining. Teachers assign any selection from the existing curriculum, a deadline and one of three simulator missions: risk plan, asset comparison or reflection on a newly saved practice trade. Existing Starter/Pro access remains unchanged.

Today prioritizes actionable assignments, then personal learning. Each assignment connects lessons, a five-question knowledge check, targeted review, a simulator mission and teacher feedback. Incorrect concepts require review before a retake. A passing check requires 80%; completion additionally requires every assigned lesson and an approved mission. Submitted evidence can be returned for revision. Closed assignments and archived classes stop new work. Completed assignment records remain stable when personal progress resets.

Mastery uses server-graded checks: the most recent incorrect response flags review, and two recent successful checks establish secure understanding. Unseen concepts are never labeled mastered. Personal practice is tracked separately and cannot inflate classroom grades.

## Access and privacy

The Node route verifies the bearer session with Supabase Auth. Actor IDs, answer keys and scores are never accepted from the browser. Private-schema tables have RLS enabled with no browser policies or grants. Only the server service role can call the RPCs, which independently scope every action to the verified teacher or enrolled learner. Assessment answers remain private until the learner submits the corresponding response. Checks are bounded, resumable and idempotent.

Teachers see only their class roster aliases, assigned lesson progress, checks, concept needs and submitted mission evidence. They can download an assignment CSV; spreadsheet formula prefixes are escaped. Full portfolios, account emails and complete trading histories are not included. Trade reflections validate ownership server-side and share only the selected eligible trade. Mission drafts use session storage and are cleared on account change. Leaving a class cascades its classroom records while retaining personal account progress; deleting an account cascades its classroom records. Teacher exports are separate local copies.

The legacy domain proxies classroom requests to the canonical server using a fixed upstream. Both APIs return no-store responses. Same-origin mutations, bounded payloads, server validation, code generation, assignment locks and versioned feedback protect the workflow. No institutional SSO, LMS synchronization, organization billing or compliance certification is implied.

## Verification

126 unit/API/database checks and 22 browser scenarios passed. The classroom browser scenario uses three independent authenticated fixtures against the real SQL workflow in PGlite: teacher assignment, learner lesson completion, failed check, review, passing retake, simulator draft continuity, submission, revision, approval, reporting and mobile layouts. It does not automate a real production sign-in.

The migration was applied to hosted Supabase. A rollback-only service-role transaction verified access denial, hidden answers, five-question grading and teacher approval without leaving demo records. Browser-role RPC access was confirmed denied; private-table deny-all RLS advisory messages are intentional. Existing unrelated database advisories were left unchanged.
