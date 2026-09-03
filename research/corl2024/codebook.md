# CoRL 2024 screening codebook

## Labels

| Label | Definition |
| --- | --- |
| `A` | An official artifact is explicitly forthcoming or is an empty placeholder. |
| `B` | An official repository has a reproduction-related issue with no substantive maintainer response for the protocol period while the repository shows later activity. |
| `AB` | Both `A` and `B` are observed. |
| `U` | Evidence or official ownership is ambiguous. |
| `N` | Neither signal was observed in this pass. This does not mean reproducible. |

## Signal A

Use `placeholder_subtype=explicit_forthcoming` for language such as “coming soon,” “will be released,” or “to be updated” when it refers to a core artifact and no corresponding usable download is available at audit time. Use `placeholder_subtype=empty_placeholder` when the official repository contains only placeholder material such as a short README, license, or configuration stub.

Do not assign `A` merely because a paper has no repository, has partial code, requires access approval, or depends on unavailable hardware.

## Signal B

The issue must be in an official public repository and directly concern installation, execution, data, checkpoints, evaluation, or a reported result. An open issue must be at least 60 calendar days old at the audit date. It must have no substantive response from an author, owner, member, collaborator, or clearly identified institutional maintainer, and the repository must show activity after the issue was opened.

For a closed issue, the 60-day age rule is not required; there must be no documented resolution in the issue or comments, no substantive maintainer response, and post-issue repository activity. A human reviewer decides whether closure itself documents a resolution.

If there is no post-issue repository activity, set `inactive_repository=true` for the observation but do not set `issue_flag=true`.

## Evidence and scope

Every positive label needs an evidence URL and short factual evidence note. Use paper affiliations, not inferred author nationality, for country and institution summaries. Do not contact authors or maintainers. A missing repository without a public release promise is not a positive signal.
