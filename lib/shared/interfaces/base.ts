/**
 * Base entity interface that all entities must extend.
 * Ensures consistent id, createdAt, and updatedAt fields across all entities.
 * Dates are stored as Date objects in entities, but converted to DateString when saving to Firestore.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

