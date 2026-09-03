# CoRL 2024 Artifact Availability Triage

**Date:** 2026-09-03
**Status:** Draft for user review
**Scope:** A first-pass, research-only screening of all papers in CoRL 2024. The screening measures two observable artifact signals and does not assess scientific validity or full reproducibility.

## 1. Purpose and boundaries

This pilot is designed to quickly identify a small set of high-confidence cases for later study. It focuses on two observable situations:

1. an official artifact is explicitly presented as forthcoming or is an empty placeholder;
2. an official repository contains a substantive reproduction-related issue that remains without a maintainer response for a fixed period while the repository continues to show activity.

The pilot does not:

- infer author intent, research integrity, or paper validity;
- judge code quality, documentation quality, or benchmark performance;
- run code, install dependencies, download datasets, or reproduce reported numbers;
- treat the absence of an artifact as a signal when no public release was promised;
- contact authors, maintainers, reviewers, or institutions;
- publish paper-level labels or a public institution ranking.

The working dataset and evidence are internal research materials. Any later public summary must use neutral terminology and aggregate statistics only unless a separate review approves a different disclosure policy.

## 2. Corpus and canonical sources

The corpus is the complete set of papers listed in the official PMLR volume for CoRL 2024:

```text
N = 264 papers
Source: https://proceedings.mlr.press/v270/
```

For each paper, the PMLR entry is the canonical source for the title, author list, paper URL, PDF URL, and OpenReview URL. Artifact candidates may be collected from:

- the PMLR entry;
- the paper PDF or supplementary material;
- the linked project page;
- an official author or laboratory page when it clearly identifies the same work.

A repository is considered official only when it is linked from one of those sources or its ownership is unambiguously established by the paper/project page. Search engines may help discover candidates, but a search result alone is not evidence of official status.

The audit date is recorded for every row. A link that is unavailable on that date is recorded as observed unavailable; historical availability is not inferred unless supported by a dated commit, release, archive, or page snapshot.

## 3. Screening labels

The paper-level label is deliberately small:

| Label | Meaning |
| --- | --- |
| `A` | High-confidence placeholder/forthcoming-artifact signal |
| `B` | High-confidence unanswered reproduction-issue signal |
| `AB` | Both `A` and `B` are present |
| `U` | Evidence is ambiguous or the official status cannot be established |
| `N` | Neither signal was observed in this pass |

`N` means “not observed under this protocol,” not “reproducible.” `U` is preferred whenever a reviewer would need to guess.

## 4. Signal A: placeholder or forthcoming artifact

Set `placeholder_flag = true` when at least one of the following is directly observable in an official source at the audit date:

### A1. Explicit forthcoming language

The paper, project page, or official repository states that code, data, models, or another core artifact will be released later. Equivalent wording includes, for example, “coming soon,” “will be released,” “to be updated,” or “release forthcoming.” The statement must refer to a core artifact and there must be no corresponding usable download at audit time.

### A2. Empty official placeholder

The official artifact link resolves to a repository or page whose relevant contents are limited to placeholder material, such as a short README, license, or configuration stub, with no substantive artifact corresponding to the paper’s central contribution.

A repository with partial code, a release with missing optional files, a request-access workflow, or an external hardware dependency is not automatically `A`. Those cases are recorded as observations outside this pilot.

The evidence record must identify the exact source URL and a short factual note, for example: “Project page states that code will be released; repository contains README only as of audit date.”

## 5. Signal B: unanswered reproduction-related issue

Set `issue_flag = true` only when all conditions below hold:

1. The issue is in an official public repository.
2. The issue is directly about reproducing or using the paper’s artifact, such as installation, execution, data access, checkpoint access, evaluation, or a reported result.
3. The issue has been open for at least 60 calendar days at the audit date, or was closed without a maintainer response or documented resolution.
4. No author, repository maintainer, or clearly identified institutional maintainer has provided a substantive response.
5. The repository shows activity after the issue was opened, such as a commit, release, pull request action, or maintainer comment.

A substantive response answers the question, provides a fix or relevant link, requests information needed to investigate, or explicitly acknowledges and tracks the problem. Bot messages, automatic templates, unrelated comments, and a reporter’s own follow-up do not count as maintainer responses.

If the repository has no observable activity after the issue was opened, record `inactive_repository = true` but do not set `issue_flag` in this high-confidence pass. This keeps “unanswered while maintained” separate from general inactivity.

For each `B` case, record the issue URL, issue creation date, issue state, last relevant repository activity date, and the reason the issue is reproduction-related.

## 6. Minimal record schema

One row represents one paper. The initial CSV can use the following fields:

```text
paper_id
title
authors
affiliations_raw
paper_url
project_url
official_artifact_url
artifact_source
placeholder_flag
placeholder_subtype
issue_flag
issue_url
issue_created_at
issue_state
repo_activity_after_issue
inactive_repository
evidence_url
evidence_note
audit_date
screen_label
reviewer
second_review_status
```

`placeholder_subtype` is one of `explicit_forthcoming`, `empty_placeholder`, or blank. A paper may have more than one artifact URL, but only official links are in scope.

The evidence note should state facts, not judgments. It should be short enough to audit quickly and should not copy long passages from external pages.

## 7. First-pass procedure

The procedure is intentionally time-boxed to approximately 3–5 minutes per paper:

1. Open the paper’s PMLR entry and note the official project or artifact links.
2. Check the paper/project page for explicit forthcoming language.
3. Open the official repository, if present, and inspect its top-level contents and README.
4. If an issue tracker is available, inspect issues related to installation, execution, data, checkpoints, evaluation, or results.
5. Check issue age and whether there was repository activity after issue creation.
6. Record one evidence URL and a factual note for every positive signal.
7. Assign `A`, `B`, `AB`, `U`, or `N`.

Reviewers stop after the time box unless a positive label needs evidence verification. No attempt is made to turn an uncertain case into a positive case through deeper investigation.

## 8. Quality control

- Every `A`, `B`, and `AB` row receives a second review.
- Randomly select at least 10 `N` rows for second review to check for systematic over-screening.
- Disagreements are resolved by preserving the more conservative label (`U` rather than `A` or `B`) unless the evidence is clarified.
- The dataset stores the original audit date and reviewer names or internal IDs so labels can be revisited without rewriting history.
- A positive label requires an evidence URL; a missing or broken URL makes the row `U` until independently verified.

## 9. Aggregate statistics

The first report uses counts and simple rates:

```text
placeholder_rate = count(A or AB) / 264
unanswered_issue_rate_all = count(B or AB) / 264
unanswered_issue_rate_conditional = count(B or AB) / count(papers with inspectable official issue tracker)
combined_signal_rate = count(AB) / 264
```

Both issue rates are reported because the all-paper denominator describes corpus prevalence while the conditional denominator describes the rate among papers with an inspectable issue tracker. The conditional denominator is never hidden.

Country and institution summaries use the affiliations printed in the paper, not inferred author nationality. For a paper with `k` distinct countries or institutions, each receives a weight of `1/k`. Report, for each group:

```text
total_fractional_papers
placeholder_fractional_papers
unanswered_issue_fractional_papers
combined_signal_fractional_papers
```

Only groups with at least five fractional papers are shown individually; smaller groups are combined into `other` to avoid unstable comparisons. The first pass presents these as descriptive distributions, not as a league table or causal comparison.

## 10. Deliverables for the pilot

The pilot produces internal files only:

```text
corl2024_screening.csv
corl2024_evidence.md
corl2024_codebook.md
```

The first analysis view contains:

- the number and rate of `A`, `B`, and `AB` labels;
- the number of `U` cases and the main ambiguity reasons;
- the share of papers with official artifact links;
- country and institution descriptive summaries;
- second-review disagreement counts.

There is no paper-level public table and no public ranking in this pilot. A later benchmark may add more signals only after this codebook has been tested on CoRL 2024.

## 11. Acceptance criteria

The design is ready for implementation when:

- the corpus contains exactly 264 PMLR papers;
- every paper has an audit date, canonical paper URL, and one screening label;
- every positive signal has a source URL and factual evidence note;
- no positive label is based only on a missing repository or a failed reproduction attempt;
- all positive rows and at least 10 random negative rows have completed second review;
- the report states both issue denominators and clearly defines `N` as “not observed,” not “reproduced.”
