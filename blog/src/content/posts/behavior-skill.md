---
title: "Behavior-Skill: A Fine-Grained Benchmark for Evaluating Vision-Language-Action Policies in Long-Horizon Tasks"
description: Notes on a benchmark that turns long-horizon VLA failures into skill-level measurements.
pubDate: 2026-08-29
type: paper-notes
tags:
  - paper-reading
  - robotics
  - embodied-ai
  - benchmarks
draft: false
paper:
  title: "Behavior-Skill: A Fine-Grained Benchmark for Evaluating Vision-Language-Action Policies in Long-Horizon Tasks"
  venue: arXiv preprint
  year: 2026
  url: https://arxiv.org/abs/2608.30536
links:
  paper: https://arxiv.org/abs/2608.30536
---

## The problem

Long-horizon robot tasks are hard to diagnose. On BEHAVIOR-1K, even the best reported policy reaches only about 31% overall task success. A task-level score tells us that a trajectory failed, but not where it failed.

That gap creates three practical problems:

- A failure may come from any one of the many atomic skills in the chain. Once an early skill fails, later skills are never executed, so their ability is not measured at all.
- Two policies with similar task scores can have very different capability profiles. One may be good at grasping and weak at placing; another may show the opposite pattern.
- When the bottleneck is invisible, improvement becomes guesswork: collect more data, change the architecture, and hope the score moves.

Behavior-Skill treats this as a mismatch between the unit of execution and the unit of evaluation. Long-horizon tasks are evaluated as single units, even though the robot actually performs a sequence of skills. The benchmark moves the evaluation unit down to the skill level.

## A three-part evaluation system

The benchmark combines three pieces: a skill dataset, a way to restore intermediate states, and metrics that summarize skill-level outcomes.

### 1. A dataset of skill instances

The authors automatically split 10,000 human teleoperation demonstrations from BEHAVIOR-1K into 235,492 skill instances. The data covers 50 household tasks and 34 semantic skill categories, including Move To, Pick Up From, Pour, and Open Lid.

Each instance contains:

- A skill instruction built from BEHAVIOR-1K's structured records: the action label, object ID, time interval, task description, and preceding skills needed to recover context.
- Multi-view observations from a head camera, a left-wrist camera, and a right-wrist camera. The sampler adapts to skill duration, using at most 64 timestamps per skill and combining the three views into one sequence.
- A natural-language summary of the motion. Frame-level 23-DoV action trajectories are condensed into descriptions such as “the left arm moves to position X and the gripper closes.” The summary gives a language model evidence for judging the execution.
- A semantic category label so results can be aggregated by skill type.

For quality control, the authors manually checked one reference demonstration per task. The remaining demonstrations were compared against the reference with ChatGPT-5, and inconsistencies were sent back for manual review. The resulting dataset can also be reused as skill-level training data.

### 2. Intermediate-state restoration

Independent skill evaluation requires more than cutting a video into segments. The simulator must be returned to the exact state at which the target skill began.

This is complicated by the active-object filter used in the HDF5 recordings. Objects that are inactive at a given moment may be missing from the file. Loading such a partial snapshot directly can make the physics engine fail.

Behavior-Skill restores a state in four steps:

1. Starting from the initial demonstration state, replay physical transition events—object movements, state changes, and related updates—until the target skill's timestamp.
2. Rebuild OmniGibson's auxiliary grasp constraints so the robot hand can interact with objects correctly.
3. Serialize the restored simulator state as a complete intermediate snapshot that can be loaded repeatedly.
4. Construct the target skill's BDDL symbolic goal and inject it into the evaluator.

The evaluation horizon is twice the duration of the corresponding demonstration skill. After every interaction step, the BDDL engine checks the current state against the goal predicates. Evaluation stops as soon as all predicates are satisfied; otherwise the skill is marked as failed when the horizon is exhausted.

This turns a skill from a segment in a recorded trajectory into an independently reproducible test case.

### 3. Two complementary metrics

The benchmark reports both trajectory-level completeness and category-level reliability:

| Metric | Meaning |
| --- | --- |
| **TSCR** — Task Skill Completion Rate | The fraction of skills completed within one demonstration. `TSCR(τᵢ) = (1 / Mᵢ) Σⱼ yᵢⱼ`. It measures how much of a trajectory a policy can carry through. |
| **STSR** — Skill-Type Success Rate | The average success rate for one semantic skill category across tasks. It describes the policy's capability profile. |

TSCR answers “how much of this particular chain was completed?” STSR answers “how reliable is this type of skill across different chains?”

## Experiments and findings

The paper evaluates π₀.₅ and GR00T N1.7. For each policy, the authors train two variants—one with task instructions and one with skill instructions—and test them on 500 demonstrations across 50 tasks.

### Even isolated skills remain difficult

Starting from a perfectly restored intermediate state and allowing twice the demonstration duration still does not produce reliable skill execution. With skill-instruction training, TSCR reaches 48.4% for π₀.₅ and 42.5% for GR00T N1.7. Training on skill instructions improves the result by only about six percentage points.

The conclusion is straightforward: a large part of the long-horizon bottleneck is already present at the skill-execution level. It is not only a planning or task-decomposition problem.

### Contact-heavy skills are the weak point

The 34 categories form a fairly stable three-level pattern across both policies:

- **High success:** simple spatial or state-maintenance skills such as Move To, Hold, Release, Sweep Surface, Spray, and Place Under.
- **Middle success:** ordinary placement skills such as Place On, Place In, and Place Next To.
- **Low success:** articulated-object interaction such as Open Lid, Close Door, and Close Lid; precise pickup with Pick Up From; and tool use such as Pour.

The two policies show similar capability profiles. That points to shared interaction bottlenecks rather than a failure unique to one architecture. Contact density is a plausible explanation, although the paper does not establish that causal claim through multi-engine or multi-embodiment experiments.

### Task-level scores can hide substantial competence

The gap between the original task metric and TSCR is large for several tasks:

| Task | Original QScore | TSCR |
| --- | ---: | ---: |
| Wash a Baseball Cap | 0% | 80.0% |
| Cook Hotdogs | 0% | 69.0% |
| Make Microwave Popcorn | 10.0% | 75.0% |

A zero task score does not mean that the policy did nothing. It may mean that one early skill broke the chain and prevented every later skill from being observed. Skill-level evaluation keeps those partial successes visible.

### The same skill can change difficulty with its context

Semantic labels alone do not determine difficulty. In a 12-task subset, the success rate for the same skill varied widely depending on the object geometry, target relation, and surrounding scene:

- **Open Door:** 9.0% in the microwave-popcorn task versus 78.0% in the hotdog-cooking task.
- **Place In:** 15.2% when putting shoes on a rack versus 88.0% in the hotdog-cooking task.

This matters for both evaluation and data collection. A category-level average is useful, but it should not be mistaken for a context-independent measure of skill difficulty.

## What the benchmark contributes

Behavior-Skill makes four concrete contributions:

1. It replaces a black-box task score with a reproducible skill-level evaluation unit.
2. It provides 235,492 annotated skill instances covering 50 tasks and 34 skill categories.
3. It restores intermediate simulator states and supplies BDDL goals for independently checking each skill.
4. It combines TSCR and STSR so a policy can be viewed both as a trajectory executor and as a collection of skill-specific capabilities.

The experiments suggest that current VLA policies have less than 50% skill completion even under favorable evaluation conditions. The main weaknesses are concentrated in contact-intensive interaction, and task-level metrics systematically understate what a policy can do before the first failure.

## Scope and limitations

The benchmark focuses on skill execution. It does not evaluate task planning, automatic task decomposition, dependencies between skills, or real-robot validation. Those remain separate problems.

The paper is best read as an evaluation infrastructure paper: before changing a policy, make sure the measurement can tell which part of the behavior is actually broken. Without that resolution, a single end-to-end success rate is too blunt to guide targeted training or to verify whether an intervention helped the intended skill.
