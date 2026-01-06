---
name: Firebase Integration and Base CRUD Service Setup
overview: ""
todos: []
---

# Firebase Integration and Base CRUD Service Setup

## Overview

Set up Firebase Firestore integration and create a base CRUD service that all feature services can extend. All interfaces will extend a base interface with `id`, `createdAt`, and `updatedAt` fields, with all dates stored as DateString format.

## Implementation Steps

### 1. Create Base Interface and Date Utilities

- **File**: `lib/shared/interfaces/base.ts`
- Create `BaseEntity` interface with `id: string`, `createdAt: string`, `updatedAt: string`
- All dates will be stored as ISO date strings (DateString format)
- **File**: `lib/shared/utils/date.ts`
- Create utility functions:
    - `toDateString(date: Date): string` - Convert Date to ISO string
    - `fromDateString(dateString: string): Date` - Convert ISO string to Date
    - `getCurrentDateString(): string` - Get current date as ISO string

### 2. Create Base CRUD Service

- **File**: `lib/shared/services/base_service.ts`
- Create abstract `BaseService<T extends BaseEntity>` class with:
    - Generic type parameter for entity type
    - Constructor that takes collection name
    - `create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: T | null; error: Error | null }>`
    - Auto-generate `id` using Firestore document ID
    - Auto-set `createdAt` and `updatedAt` to current DateString
    - `getById(id: string): Promise<{ data: T | null; error: Error | null }>`
    - `list(): Promise<{ data: T[]; error: Error | null }>`
    - `update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<{ data: T | null; error: Error | null }>`
    - Auto-update `updatedAt` to current DateString
    - Preserve `createdAt` and `id`
    - `delete(id: string): Promise<{ error: Error | null }>`
- Use Firestore collection reference from `lib/shared/firebase/config.ts`
- Handle Firestore Timestamp conversion to/from DateString

### 3. Update Existing Interfaces

- **File**: `lib/features/courses/data/interfaces/course.ts`
- Update `CourseGroup` to extend `BaseEntity`
- Ensure all date fields use DateString format
- **File**: `lib/features/notes/data/interfaces/note.ts`
- Update `Note` to extend `BaseEntity` (already has `id`)
- Change `added_date` to `createdAt` or keep both for backward compatibility
- Ensure `updated_date` maps to `updatedAt`
- **File**: `lib/features/calendar/data/interfaces/calendar.ts`
- Update `ClassSchedule` to extend `BaseEntity` (already has `id`)
- Add `createdAt` and `updatedAt` fields
- **File**: `lib/features/auth/data/interfaces/auth.ts`
- Update `AuthUser` to extend `BaseEntity` (using `uid` as `id` or add separate `id`)

### 4. Export Base Types

- **File**: `lib/shared/index.ts`
- Export `BaseEntity` from `lib/shared/interfaces/base.ts`
- Export date utilities from `lib/shared/utils/date.ts`
- Export `BaseService` from `lib/shared/services/base_service.ts`

### 5. Update Firebase Config (if needed)

- **File**: `lib/shared/firebase/config.ts`
- Verify Firestore is properly initialized
- May need to add helper functions for date conversion if needed

## Architecture

```javascript
lib/shared/
├── interfaces/
│   └── base.ts              # BaseEntity interface
├── services/
│   └── base_service.ts      # BaseService abstract class
├── utils/
│   └── date.ts              # Date conversion utilities
└── firebase/
    └── config.ts            # Firebase initialization (existing)
```



## Key Design Decisions

1. **Date Format**: All dates stored as ISO 8601 strings (DateString) in Firestore
2. **Base Interface**: All entities extend `BaseEntity` for consistency
3. **Service Pattern**: Abstract base class that concrete services extend
4. **Error Handling**: Consistent `{ data, error }` return pattern matching existing services
5. **Auto-timestamps**: `createdAt` and `updatedAt` are automatically managed by the base service

## Notes

- The base service will handle Firestore document ID generation automatically
- Date conversions will be handled transparently in the base service