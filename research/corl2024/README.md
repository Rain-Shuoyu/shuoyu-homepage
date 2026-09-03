# CoRL 2024 artifact triage

This is a local, first-pass screening workflow for all 264 papers in the CoRL 2024 PMLR volume. It records only two observable signals: an official artifact presented as forthcoming or left as a placeholder, and a reproduction-related issue with no substantive maintainer response while the repository remains active.

The workflow does not assess scientific validity, infer intent, run code, contact authors, or add public-site pages. `N` means “not observed under this pass”; it does not mean “reproducible.”

## Commands

```bash
npm run corl2024:bootstrap -- --audit-date 2026-09-03
# Complete project/artifact and affiliation fields in the generated template.
GITHUB_TOKEN=... npm run corl2024:inspect -- --audit-date 2026-09-03
# Copy screening.template.csv to screening.csv and fill observed facts.
npm run corl2024:validate -- --allow-pending
npm run corl2024:validate -- --strict
npm run corl2024:summary -- --audit-date 2026-09-03
```

Default local paths are under `research/corl2024/data/`, with HTTP response cache in `research/corl2024/cache/` and reports in `research/corl2024/reports/`. Generated files are ignored by Git.

`GITHUB_TOKEN` is optional but recommended for GitHub API rate limits. It is read from the environment only and is never written to the cache or reports. Use `--audit-date YYYY-MM-DD` for a reproducible age calculation. Bootstrap refuses to overwrite an existing screening file unless `--force` is provided.

The PMLR source is fixed to `https://proceedings.mlr.press/v270/` by default. A missing repository without a release promise remains `N` or `U`; it is not upgraded automatically. If a project page explicitly says that code will be released but the repository does not, enter `placeholder_subtype=explicit_forthcoming` and preserve the project-page URL as evidence.
