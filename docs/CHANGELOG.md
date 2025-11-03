# Changelog

## Recent Updates

### Documentation Consolidation

- ✅ Organized all documentation files into `docs/` directory structure
  - `docs/development/` - Development guides and audits
  - `docs/guides/` - User and setup guides
  - `docs/features/` - Feature-specific documentation
- ✅ Created documentation index files for easier navigation

### Media Library Improvements

- ✅ Added list view mode (replaces confusing grouped view)
- ✅ List view shows compact rows with poster thumbnails, metadata, status badges
- ✅ Fixed syntax error in MediaLibrary component

### Reminders Board Enhancements

- ✅ Made analytics badges clickable (inbox, overdue, scheduled, recurring)
- ✅ Added "Overdue" and "Recurring" filter tabs
- ✅ Extended keyboard shortcuts to work in all filter views
- ✅ Improved empty state messages

### Scrollbar & Layout Fixes

- ✅ Fixed right-side padding issue caused by scrollbar gutter
- ✅ Added scrollbar-gutter-stable only to main content area (not sidebar)
- ✅ Simplified scrollbar CSS to prevent layout shifts

### Edit Feedback System

- ✅ **Already Complete** - Edit feedback dialog is fully implemented
  - Triggers after transcript, summary, and category edits
  - Dismissible with "Skip" button
  - Saves feedback to database for future AI learning

---

## Next Priority Tasks

### High Priority

1. **Mobile/Desktop QA Pass** - Comprehensive testing and fixes for mobile experience
2. **Power Inbox** - Draft IA and implement sections with ordering rules, badges, quick actions

### Medium Priority

3. **Custom Categories** - Define schema for custom categories & icons storage
4. **Prompt Management UI** - Add UI for editing prompts with versioning + rollback

### Low Priority

5. **Metrics Dashboard** - Ship queue depth, job latency, enrichment completion rate tracking

---

## Known Issues Fixed

- ✅ Media Library grouped view confusion → Replaced with clear list view
- ✅ Reminders analytics not clickable → Now filter the view
- ✅ Right-side padding on content area → Fixed with targeted scrollbar-gutter
- ✅ Missing documentation structure → Consolidated into docs/ directory
