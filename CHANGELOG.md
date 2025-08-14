# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-08-14

### Added
- Initial release of the Team Standup Report application
- Google Workspace authentication (restricted to @hospital-os.com domain)
- Standup form for submitting daily standup reports with fields for:
  - Yesterday's work
  - Today's plans
  - Blockers
- Standup list for viewing recent entries with:
  - Grid view (traditional card-based layout)
  - Kanban view (board-based layout)
  - Date navigation
  - Real-time updates
- Edit functionality for existing standup entries
- Markdown support in all standup fields
- Responsive design that works on mobile, tablet, and desktop devices
- Docker support for easier deployment
- Scrollable components for better UX:
  - Grid view with scrollable content area
  - Kanban view with separate scrollbars for each board column
- View mode persistence (saves selected view mode in localStorage)
- Modal functionality for viewing full content when text is truncated
- Footer visibility without requiring page scrolling
- Enhanced error handling and user feedback

### Changed
- Improved responsive layout with full-height viewport fitting
- Removed unused code and dependencies for better maintainability
- Updated documentation with recent improvements and code cleanup

### Fixed
- Build issues