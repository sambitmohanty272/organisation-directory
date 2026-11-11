
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, mergeMap, throwError } from 'rxjs';

import {
  RawOrganisation,
  Organisation,
  OrganisationStatus
} from '../models/organisation';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private http = inject(HttpClient);

  private readonly dataUrl = '/assets/data/organisations.json';

  getOrganisations(): Observable<Organisation[]> {
    return this.http
      .get<RawOrganisation[]>(this.dataUrl)
      .pipe(
        mergeMap((records) => {
          // Simulate an API response delay between 400 and 900 ms.
          const delay = Math.floor(Math.random() * 501) + 400;

          return timer(delay).pipe(
            mergeMap(() => {
              // Simulate a 15% API failure rate.
              if (Math.random() < 0.15) {
                return throwError(
                  () => new Error('Unable to load organisations.')
                );
              }

              return [this.normaliseRecords(records)];
            })
          );
        })
      );
  }

  private normaliseRecords(
    records: RawOrganisation[]
  ): Organisation[] {
    return records.map((record, index) => ({
      rowKey: `record-${index}-${record.id ?? 'unknown'}`,
      id: this.normaliseId(record.id),
      name: this.normaliseName(record.name),
      status: this.normaliseStatus(record.status),
      memberCount: this.normaliseMemberCount(record.memberCount),
      ownerEmail: this.normaliseOwner(record.owner),
      createdAt: this.normaliseDate(record.createdAt)
    }));
  }

  private normaliseId(value: unknown): number | null {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private normaliseName(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const name = value.trim();

    return name.length > 0 ? name : null;
  }

  private normaliseStatus(value: unknown): OrganisationStatus {
    if (typeof value !== 'string') {
      return 'unknown';
    }

    const status = value.trim().toLowerCase();

    if (
      status === 'active' ||
      status === 'inactive' ||
      status === 'suspended'
    ) {
      return status;
    }

    return 'unknown';
  }

  private normaliseMemberCount(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const count = Number(value);

    return Number.isInteger(count) && count >= 0 ? count : null;
  }

  private normaliseOwner(value: unknown): string | null {
    if (
      typeof value !== 'object' ||
      value === null ||
      !('email' in value)
    ) {
      return null;
    }

    const email = (value as { email: unknown }).email;

    return typeof email === 'string' && email.trim().length > 0
      ? email.trim()
      : null;
  }

  private normaliseDate(value: unknown): Date | null {
    if (value === null || value === undefined) {
      return null;
    }

    const date = new Date(
      typeof value === 'number' || typeof value === 'string'
        ? value
        : NaN
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }
}
