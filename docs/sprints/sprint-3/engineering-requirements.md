# OneAtlas — Sprint 3 Engineering Requirements Document
## Model Details, Model Comparison, and Comparison Management

**Document Type:** Engineering Requirement Document (ERD)  
**Sprint:** 3 of 5  
**Working Project Name:** OneAtlas  
**Primary Scope:** Model Details and Model Comparison  
**Status:** Implementation Specification  

---

# 1. Sprint Overview

## 1.1 Objective
Sprint 3 extends the model discovery functionality implemented in Sprint 2.
The objective is to allow users to:
1. Open an individual model from discovery results.
2. View complete model information on a dedicated details page (`/models/[id]`).
3. Select multiple models for comparison from the catalogue or details page.
4. Compare selected models side-by-side on `/compare` across architectures, context capacities, inference pricing, capabilities, and benchmarks.
5. Add and remove models from the comparison drawer with real-time feedback.
6. Share or restore a comparison session through a persistent URL (`/compare?models=id1,id2,id3`).
7. Gracefully handle incomplete, missing, or unavailable model attributes without breaking the layout.

## 1.2 Comparison Rules
- **Maximum limit:** Exactly 3 models maximum (`MAX_COMPARISON_MODELS = 3`).
- **Enforcement:** Adding a 4th model is rejected with a dismissible feedback message; it never overwrites existing selections.
- **Deduplication:** Adding an already-selected model is ignored.
- **Persistence:** Saved in browser `localStorage` and synchronized with URL search params.
- **Difference Highlighting:** Visual indication on rows where values differ across selected models, toggleable by user.
- **Data Integrity:** Missing pricing or context windows render "Pricing Unavailable" or "Context Unavailable" (never `$0.00` or `0`).
