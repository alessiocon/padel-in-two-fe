---
agent: agent
description: Create a new React component following project standards
---

# Objective

Create a new React component that is production ready and fully aligned with the project architecture.

Before generating code, inspect the codebase and respect all existing conventions.

---

# Analysis Phase

Before writing code:

1. Search for similar components.
2. Search for reusable hooks.
3. Search for reusable types.
4. Search for reusable services.
5. Search for reusable utility functions.

If a reusable implementation exists:

- reuse it
- extend it
- compose it

Do not duplicate existing logic.

---

# Architecture Rules

Follow these principles:

- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Composition over inheritance
- Separation of concerns
- Feature driven design

Avoid:

- business logic inside UI components
- duplicated code
- deeply nested components
- oversized files

---

# TypeScript Rules

Mandatory:

- TypeScript strict mode
- Never use any
- Prefer type over interface
- Explicitly type props
- Explicitly type exported functions

Do not use:

```ts
any
unknown as SomeType