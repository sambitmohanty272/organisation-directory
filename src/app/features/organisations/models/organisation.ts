
/**
 * Represents the raw data received from the API.
 * Values are unknown because external data may be invalid.
 */
export interface RawOrganisation {
  id: unknown;
  name?: unknown;
  status?: unknown;
  memberCount?: unknown;
  owner?: unknown;
  createdAt?: unknown;
}

/**
 * Allowed organisation statuses in our application.
 */
export type OrganisationStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'unknown';

/**
 * Represents clean and predictable organisation data.
 */
export interface Organisation {
  rowKey: string;
  id: number | null;
  name: string | null;
  status: OrganisationStatus;
  memberCount: number | null;
  ownerEmail: string | null;
  createdAt: Date | null;
}
