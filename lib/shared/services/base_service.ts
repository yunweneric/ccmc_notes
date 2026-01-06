import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { BaseEntity } from '../interfaces/base';
import { toDateString, fromDateString } from '../utils/date';

/**
 * Abstract base service class for CRUD operations on Firestore collections.
 * All feature services should extend this class to get consistent CRUD functionality.
 *
 * @template T - The entity type that extends BaseEntity
 */
export abstract class BaseService<T extends BaseEntity> {
  protected collectionName: string;

  /**
   * @param collectionName - The name of the Firestore collection
   */
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get the Firestore collection reference.
   */
  protected getCollection() {
    return collection(db, this.collectionName);
  }

  /**
   * Convert Firestore document data to entity, handling Timestamp/DateString to Date conversion.
   */
  protected convertDocumentToEntity(docData: DocumentData, docId: string): T {
    const data = { ...docData };
    
    // Convert Firestore Timestamps and DateStrings to Date objects
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value && typeof value === 'object' && 'toDate' in value) {
        // It's a Firestore Timestamp - convert to Date
        const timestamp = value as Timestamp;
        data[key] = timestamp.toDate();
      } else if (typeof value === 'string' && (key === 'createdAt' || key === 'updatedAt')) {
        // It's a DateString for createdAt/updatedAt - convert to Date
        data[key] = fromDateString(value);
      }
    });

    return {
      ...data,
      id: docId,
    } as T;
  }

  /**
   * Convert entity data to Firestore document data, converting Date objects to DateString.
   */
  protected convertEntityToDocument(entityData: Partial<T>): DocumentData {
    const data: DocumentData = { ...entityData };
    
    // Convert Date objects to DateString for Firestore
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof Date) {
        data[key] = toDateString(value);
      }
    });

    return data;
  }

  /**
   * Create a new entity in Firestore.
   * Automatically sets id (from Firestore document ID), createdAt, and updatedAt.
   * Converts Date objects to DateString when saving to Firestore.
   *
   * @param data - Entity data without id, createdAt, and updatedAt
   * @returns Promise with created entity or error
   */
  async create(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const now = new Date();
      const docRef = doc(this.getCollection());
      
      const entityData: Partial<T> = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as Partial<T>;

      // Convert to Firestore format (Date -> DateString)
      const firestoreData = this.convertEntityToDocument(entityData);
      await setDoc(docRef, firestoreData);

      // Return entity with Date objects
      const createdEntity: T = {
        ...entityData,
        id: docRef.id,
      } as T;

      return { data: createdEntity, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Get an entity by its ID.
   *
   * @param id - The entity ID
   * @returns Promise with entity or error
   */
  async getById(id: string): Promise<{ data: T | null; error: Error | null }> {
    try {
      const docRef = doc(this.getCollection(), id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { data: null, error: new Error('Entity not found') };
      }

      const entity = this.convertDocumentToEntity(docSnap.data(), docSnap.id);
      return { data: entity, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Get all entities from the collection.
   *
   * @returns Promise with array of entities or error
   */
  async list(): Promise<{ data: T[]; error: Error | null }> {
    try {
      const querySnapshot = await getDocs(this.getCollection());
      const entities: T[] = [];

      querySnapshot.forEach((docSnap) => {
        const entity = this.convertDocumentToEntity(docSnap.data(), docSnap.id);
        entities.push(entity);
      });

      return { data: entities, error: null };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Update an entity by its ID.
   * Automatically updates updatedAt timestamp.
   * Preserves createdAt and id.
   * Converts Date objects to DateString when saving to Firestore.
   *
   * @param id - The entity ID
   * @param data - Partial entity data to update (excluding id and createdAt)
   * @returns Promise with updated entity or error
   */
  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const docRef = doc(this.getCollection(), id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { data: null, error: new Error('Entity not found') };
      }

      const updateData: Partial<T> = {
        ...data,
        updatedAt: new Date(),
      } as Partial<T>;

      // Convert to Firestore format (Date -> DateString)
      const firestoreData = this.convertEntityToDocument(updateData);
      await updateDoc(docRef, firestoreData);

      // Get the updated document and convert back to entity with Date objects
      const updatedDocSnap = await getDoc(docRef);
      if (!updatedDocSnap.exists()) {
        return { data: null, error: new Error('Failed to retrieve updated entity') };
      }
      
      const updatedEntity = this.convertDocumentToEntity(
        updatedDocSnap.data(),
        updatedDocSnap.id
      );

      return { data: updatedEntity, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Delete an entity by its ID.
   *
   * @param id - The entity ID
   * @returns Promise with error if deletion fails
   */
  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const docRef = doc(this.getCollection(), id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { error: new Error('Entity not found') };
      }

      await deleteDoc(docRef);
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }
}

