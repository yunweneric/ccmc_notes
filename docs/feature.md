# Feature Implementation Guide

This document outlines the standard approach for implementing features in the ABCScout application. The architecture follows a clean, layered structure that separates concerns and promotes maintainability.

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Nomenclature Conventions](#nomenclature-conventions)
4. [Implementation Layers](#implementation-layers)
5. [Step-by-Step Guide](#step-by-step-guide)
6. [Best Practices](#best-practices)
7. [Reusable UI Components](#reusable-ui-components)
8. [Example: Clubs Feature](#example-clubs-feature)

## Overview

Features are organized using a **feature-based architecture** with three main layers:

- **Data Layer**: Interfaces, types, and services for data operations
- **Hooks Layer**: React hooks that encapsulate business logic and state management
- **Presentation Layer**: UI components and pages that render the feature

All features are located in `lib/features/{feature-name}/` and follow a consistent structure.

## Folder Structure

```
lib/features/{feature-name}/
├── data/
│   ├── interfaces/
│   │   ├── {feature}.ts            # Main entity interface (e.g., Club)
│   │   └── index.ts                 # Re-exports all interfaces
│   ├── schemas/
│   │   └── {feature}_schema.ts     # Zod validation schemas
│   └── services/
│       ├── {feature}_service.ts    # Service class (or mock service)
│       └── index.ts                # Re-exports service
├── hooks/
│   ├── use_create_{feature}.ts     # Hook for creating
│   ├── use_get_{feature}.ts        # Hook for fetching single item
│   ├── use_get_{features}.ts       # Hook for fetching list
│   ├── use_update_{feature}.ts     # Hook for updating
│   ├── use_delete_{feature}.ts    # Hook for deleting
│   └── index.ts                    # Re-exports all hooks
├── presentation/
│   ├── components/
│   │   ├── {feature}_form.tsx       # Form component with validation
│   │   ├── {feature}_table.tsx     # Table component using DataTable
│   │   └── {feature}_detail.tsx    # Detail view component (optional)
│   └── pages/
│       └── (pages are in app routes, not here)
└── index.ts                        # Main feature exports
```

## Nomenclature Conventions

### File Naming

- **Interfaces**: Use PascalCase with descriptive names
  - `club.ts` → `Club`, `CreateClub`, `UpdateClub` interfaces
  - All interfaces typically in one file: `{feature}.ts`

- **Services**: Use PascalCase class name, file matches class
  - `location_service.ts` → `LocationService` class

- **Schemas**: Use camelCase with `_schema` suffix
  - `club_schema.ts` → `createClubSchema`, `CreateClubFormData` type

- **Hooks**: Use camelCase with `use_` prefix
  - `use_create_club.ts` → `useCreateClub` hook
  - `use_get_clubs.ts` → `useGetClubs` hook

- **Components**: Use PascalCase, file matches component name
  - `club_form.tsx` → `ClubForm` component
  - `club_table.tsx` → `ClubTable` component

- **Pages**: Pages are in Next.js app routes, not in feature folder
  - `app/[lang]/manager/clubs/page.tsx` → Clubs list page
  - `app/[lang]/manager/clubs/add/page.tsx` → Add club page

### Variable Naming

- **Interfaces**: PascalCase
  ```typescript
  interface Club { ... }
  interface CreateClub { ... }
  interface UpdateClub extends Partial<CreateClub> { id: string }
  ```

- **Services**: PascalCase, singleton instance in camelCase
  ```typescript
  export class LocationService { ... }
  export const locationService = new LocationService();
  ```

- **Hooks**: camelCase with `use` prefix
  ```typescript
  export function useCreateLocation() { ... }
  export function useGetLocations() { ... }
  ```

- **Components**: PascalCase
  ```typescript
  export function ClubForm() { ... }
  export function ClubTable() { ... }
  ```

## Implementation Layers

### 1. Data Layer

#### Interfaces (`data/interfaces/`)

Define TypeScript interfaces for your feature's data structures.

**Example: `club.ts`**
```typescript
export interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country: string;
  city?: string;
  league?: string;
  foundedYear?: number;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  ownerUserId?: string;
}

export interface CreateClub {
  name: string;
  description?: string;
  country: string;
  city?: string;
  league?: string;
  foundedYear?: number;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateClub extends Partial<CreateClub> {
  id: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Example: `index.ts`**
```typescript
export type { Club, CreateClub, UpdateClub, PaginationParams, PaginatedResponse } from "./club";
```

#### Schemas (`data/schemas/`)

Define Zod validation schemas for form validation using React Hook Form.

**Example: `club_schema.ts`**
```typescript
import { z } from "zod";

export const createClubSchema = z.object({
  name: z
    .string()
    .min(1, "Club name is required")
    .min(2, "Club name must be at least 2 characters")
    .max(100, "Club name must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .min(1, "Country is required")
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be less than 100 characters"),
  // ... other fields
});

export type CreateClubFormData = z.infer<typeof createClubSchema>;
```

#### Services (`data/services/`)

Services handle all data operations. Can be a mock service for development or a real service connecting to an API.

**Example: `mock_club_service.ts`**
```typescript
import { CreateClub, Club, UpdateClub, PaginationParams, PaginatedResponse } from "../interfaces";

export class MockClubService {
  private clubs: Club[] = [];

  async list(
    pagination?: PaginationParams
  ): Promise<{ data: Club[] | PaginatedResponse<Club>; error: Error | null }> {
    if (!pagination) {
      return { data: [...this.clubs], error: null };
    }

    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = [...this.clubs].slice(start, end);
    const total = this.clubs.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      },
      error: null,
    };
  }

  async get(id: string): Promise<{ data: Club | null; error: Error | null }> {
    const club = this.clubs.find((c) => c.id === id) || null;
    if (!club) return { data: null, error: new Error("Club not found") };
    return { data: club, error: null };
  }

  async create(input: CreateClub): Promise<{ data: Club | null; error: Error | null }> {
    // Implementation...
  }

  async update(input: UpdateClub): Promise<{ data: Club | null; error: Error | null }> {
    // Implementation...
  }

  async delete(id: string): Promise<{ error: Error | null }> {
    // Implementation...
  }
}

// Export singleton instance
export const mockClubService = new MockClubService();
```

**Example: `index.ts`**
```typescript
export { MockClubService, mockClubService } from "./mock_club_service";
```

### 2. Hooks Layer

Hooks encapsulate business logic and provide a clean API for components.

**Example: `use_create_club.ts`**
```typescript
"use client";

import { useState, useCallback } from "react";
import { mockClubService } from "../data/services";
import { CreateClub, Club } from "../data/interfaces";

export function useCreateClub() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClub = useCallback(
    async (input: CreateClub): Promise<Club | null> => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await mockClubService.create(input);
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return null;
      }
      setIsLoading(false);
      return data;
    },
    []
  );

  return { createClub, isLoading, error };
}
```

**Example: `use_get_clubs.ts`**
```typescript
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { mockClubService } from "../data/services";
import { Club, PaginationParams, PaginatedResponse } from "../data/interfaces";

export function useGetClubs(pagination?: PaginationParams) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [paginationData, setPaginationData] = useState<PaginatedResponse<Club> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const stablePagination = useMemo(() => {
    if (!pagination) return undefined;
    return { page: pagination.page, limit: pagination.limit };
  }, [pagination?.page, pagination?.limit]);

  const fetchClubs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await mockClubService.list(stablePagination);
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }
    if (stablePagination && "total" in data) {
      setPaginationData(data);
      setClubs(data.data);
    } else if (Array.isArray(data)) {
      setClubs(data);
      setPaginationData(null);
    }
    setIsLoading(false);
  }, [stablePagination]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  return {
    clubs,
    pagination: paginationData,
    isLoading,
    error,
    refetch: fetchClubs,
  };
}
```

**Example: `index.ts`**
```typescript
export { useCreateClub } from "./use_create_club";
export { useGetClubs } from "./use_get_clubs";
export { useGetClub } from "./use_get_club";
export { useUpdateClub } from "./use_update_club";
export { useDeleteClub } from "./use_delete_club";
```

### 3. Presentation Layer

#### Components (`presentation/components/`)

Reusable UI components for the feature.

**Example: `club_form.tsx`**
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClub, Club } from "../../data/interfaces";
import { createClubSchema, CreateClubFormData } from "../../data/schemas/club_schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ProfileHeader } from "@/components/ui/profile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClubFormProps = {
  initialData?: Partial<Club>;
  onSubmit: (data: CreateClub | (CreateClub & { id?: string })) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function ClubForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
}: ClubFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateClubFormData>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      country: initialData?.country ?? "",
      // ... other fields
    },
  });

  const coverImageUrl = watch("coverImageUrl");
  const logoUrl = watch("logoUrl");

  const onSubmitForm = async (data: CreateClubFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Card>
        <CardHeader>
          <CardTitle>Club Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileHeader
            coverImageUrl={coverImageUrl || null}
            avatarUrl={logoUrl || null}
            onCoverImageChange={(value) => setValue("coverImageUrl", value ?? "")}
            onAvatarChange={(value) => setValue("logoUrl", value ?? "")}
          />
        </CardContent>
      </Card>
      {/* Form fields with validation */}
    </form>
  );
}
```

**Example: `club_table.tsx`**
```typescript
"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Club, PaginatedResponse } from "../../data/interfaces";
import { DataTable } from "@/components/ui/data-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export function ClubTable({
  clubs,
  pagination,
  onPageChange,
  onPageSizeChange,
  onDelete,
  deleteDisabled,
}: ClubTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const columns: ColumnDef<Club>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    // ... other columns
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/manager/clubs/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setPendingDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [onDelete]);

  const clubNameFilterFn = (row: Club, columnId: string, filterValue: string) => {
    if (!filterValue) return true;
    return row.name?.toLowerCase().includes(filterValue.toLowerCase()) ?? false;
  };

  return (
    <>
      <DataTable
        data={clubs}
        columns={columns}
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        enableSearch={true}
        searchPlaceholder="Search by club name..."
        globalFilterFn={clubNameFilterFn}
      />
      <AlertDialog open={Boolean(pendingDeleteId)} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete club</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDeleteId && onDelete?.(pendingDeleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

#### Pages (Next.js App Routes)

Pages are implemented directly in Next.js app routes, not in the feature folder.

**Example: `app/[lang]/manager/clubs/page.tsx`**
```typescript
"use client";

import { useState, useMemo } from "react";
import { ClubTable } from "@/lib/features/clubs/presentation/components/club_table";
import { useGetClubs } from "@/lib/features/clubs/hooks/use_get_clubs";
import { useDeleteClub } from "@/lib/features/clubs/hooks/use_delete_club";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export default function ManagerClubsPage() {
  const [page, setPage] = useState(1);
  const paginationParams = useMemo(() => ({ page, limit: ITEMS_PER_PAGE }), [page]);
  const { clubs, pagination, isLoading, refetch } = useGetClubs(paginationParams);
  const { deleteClub, isLoading: isDeleting } = useDeleteClub();

  const handleDelete = async (id: string) => {
    await deleteClub(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clubs</h1>
        <Button asChild>
          <Link href="/manager/clubs/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Club
          </Link>
        </Button>
      </div>
      <ClubTable
        clubs={clubs}
        pagination={pagination}
        onPageChange={setPage}
        onDelete={handleDelete}
        deleteDisabled={isDeleting}
      />
    </div>
  );
}
```

**Example: `app/[lang]/manager/clubs/add/page.tsx`**
```typescript
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClubForm } from "@/lib/features/clubs/presentation/components/club_form";
import { useCreateClub } from "@/lib/features/clubs/hooks/use_create_club";
import { Button } from "@/components/ui/button";

export default function ManagerClubAddPage() {
  const router = useRouter();
  const { createClub, isLoading } = useCreateClub();

  const handleCreate = async (data: any) => {
    const created = await createClub(data);
    if (created) {
      router.replace("/manager/clubs");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Club</h1>
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a new club</CardTitle>
        </CardHeader>
        <CardContent>
          <ClubForm onSubmit={handleCreate} isSubmitting={isLoading} submitLabel="Create" />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Feature Index (`index.ts`)

Central export point for the entire feature.

```typescript
// Feature Exports
export * from "./data/services";
export * from "./data/interfaces";
export * from "./hooks";
export { ClubForm } from "./presentation/components/club_form";
export { ClubTable } from "./presentation/components/club_table";
export { ClubDetail } from "./presentation/components/club_detail";
```

## Step-by-Step Guide

### Step 1: Create Feature Directory Structure

```bash
mkdir -p lib/features/{feature-name}/{data/{interfaces,services},hooks,presentation/{components,pages}}
```

### Step 2: Define Interfaces

1. Create `data/interfaces/{feature}.ts` - Main entity interfaces (Club, CreateClub, UpdateClub, etc.)
2. Create `data/interfaces/index.ts` - Re-exports all interfaces

### Step 3: Create Validation Schemas

1. Create `data/schemas/{feature}_schema.ts` - Zod schemas for form validation
2. Export schema and inferred TypeScript type

### Step 4: Implement Service

1. Create `data/services/{feature}_service.ts` (or `mock_{feature}_service.ts` for development)
2. Implement CRUD methods that return `{ data, error }` tuples
3. Export singleton instance
4. Create `data/services/index.ts` for exports

### Step 5: Create Hooks

1. Create hooks for each operation:
   - `use_create_{feature}.ts`
   - `use_get_{feature}.ts`
   - `use_get_{features}.ts` (with pagination support)
   - `use_update_{feature}.ts`
   - `use_delete_{feature}.ts`
2. Each hook should manage loading state and errors
3. Create `hooks/index.ts` for exports

### Step 6: Build Components

1. Create `{feature}_form.tsx` - Form component with React Hook Form + Zod validation
2. Create `{feature}_table.tsx` - Table component using DataTable with TanStack Table
3. Use hooks for data operations
4. Keep components focused and reusable

### Step 7: Create Feature Index

1. Export all interfaces, services, hooks, and components
2. This allows clean imports: `import { ... } from "@/lib/features/{feature}"`

### Step 8: Create Next.js Route Pages

Create Next.js route pages in `app/[lang]/manager/{feature}/` that use the feature's components:

```typescript
// app/[lang]/manager/clubs/page.tsx
"use client";
import { ClubTable } from "@/lib/features/clubs/presentation/components/club_table";
import { useGetClubs } from "@/lib/features/clubs/hooks/use_get_clubs";

export default function ManagerClubsPage() {
  const { clubs, pagination, isLoading } = useGetClubs({ page: 1, limit: 10 });
  // ... implementation
}
```

## Best Practices

### 1. Separation of Concerns

- **Data Layer**: Pure data operations, no UI logic
- **Hooks Layer**: Business logic, state management, side effects
- **Presentation Layer**: UI rendering, user interactions

### 2. Error Handling

- Services return `{ data, error }` tuples
- Hooks handle error display (toasts, error states)
- Components show error UI when needed

### 3. Type Safety

- Use TypeScript interfaces throughout
- Export types from feature index
- Avoid `any` types

### 4. Reusability

- Components should be reusable and configurable
- Hooks should be composable
- Services should be testable

### 5. Consistency

- Follow naming conventions strictly
- Use consistent file structure
- Export patterns should match across features

### 6. Loading States

- Hooks manage loading states
- Components receive loading props
- Show appropriate loading UI

### 7. Navigation

- Hooks handle navigation after operations
- Use Next.js `useRouter` for navigation
- Provide user feedback (toasts) before navigation

### 8. Form Validation

- Use Zod schemas for validation
- Use React Hook Form with `zodResolver`
- Display field errors using `FieldError` component

### 9. Table Implementation

- Use `DataTable` component from `@/components/ui/data-table`
- Define columns using TanStack Table's `ColumnDef`
- Enable search, sorting, and pagination
- Use `AlertDialog` for delete confirmations

### AlertDialog Component

Located at `components/ui/alert-dialog.tsx`, used for confirmation dialogs:

**Usage:**
```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete item</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### ProfileHeader Component

Located at `components/ui/profile-header.tsx`, for displaying cover image and avatar:

**Usage:**
```typescript
import { ProfileHeader } from "@/components/ui/profile-header";

<ProfileHeader
  coverImageUrl={coverImageUrl}
  avatarUrl={avatarUrl}
  onCoverImageChange={handleCoverChange}
  onAvatarChange={handleAvatarChange}
/>
```

### Image Pickers

- `components/ui/image-picker.tsx` - General image picker
- `components/ui/avatar-picker.tsx` - Avatar-specific picker
- `components/ui/cover-image-picker.tsx` - Cover image picker

## Example: Clubs Feature

The clubs feature serves as the reference implementation. Key files:

- **Interfaces**: `lib/features/clubs/data/interfaces/club.ts`
- **Schemas**: `lib/features/clubs/data/schemas/club_schema.ts`
- **Service**: `lib/features/clubs/data/services/mock_club_service.ts`
- **Hooks**: `lib/features/clubs/hooks/`
- **Components**: `lib/features/clubs/presentation/components/`
  - `club_form.tsx` - Form with React Hook Form + Zod validation
  - `club_table.tsx` - Table using DataTable with TanStack Table
- **Routes**: `app/[lang]/manager/clubs/`

### Usage Example

```typescript
// In a route page
import { ClubTable } from "@/lib/features/clubs/presentation/components/club_table";
import { useGetClubs } from "@/lib/features/clubs/hooks/use_get_clubs";

export default function ManagerClubsPage() {
  const { clubs, pagination, isLoading } = useGetClubs({ page: 1, limit: 10 });
  return <ClubTable clubs={clubs} pagination={pagination} />;
}

// In a component
import { useGetClubs, Club } from "@/lib/features/clubs";

function MyComponent() {
  const { clubs, isLoading } = useGetClubs();
  // Use clubs...
}
```

## Checklist

When implementing a new feature, ensure:

- [ ] Directory structure matches the standard
- [ ] Interfaces are defined and exported
- [ ] Zod schemas are created for form validation
- [ ] Service implements CRUD methods with `{ data, error }` pattern
- [ ] All CRUD hooks are implemented with loading states
- [ ] Form component uses React Hook Form with Zod validation
- [ ] Table component uses DataTable with TanStack Table
- [ ] Delete actions use AlertDialog for confirmation
- [ ] Search functionality is implemented (if needed)
- [ ] Pagination is properly handled
- [ ] Components use hooks for data operations
- [ ] Route pages compose hooks and components
- [ ] Feature index exports everything
- [ ] Naming follows conventions
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] TypeScript types are correct
- [ ] No linter errors

## Additional Resources

- See `lib/features/clubs/` for complete CRUD feature example
- See `lib/features/auth/` for authentication feature example
- See `components/ui/data-table.tsx` for TanStack Table implementation
- See `components/ui/alert-dialog.tsx` for confirmation dialogs
