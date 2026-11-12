
import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Subject,
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

import { OrganisationService } from '../../services/organisation.service';
import { Organisation } from '../../models/organisation';

interface Labels {
  [key: string]: string;
}

@Component({
  selector: 'app-organisation-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './organisation-list.html',
  styleUrl: './organisation-list.css'
})
export class OrganisationList {

  // Services
  private readonly organisationService = inject(OrganisationService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  organisations = signal<Organisation[]>([]);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  labels = signal<Labels>({});

  searchTerm = signal<string>('');
  statusFilter = signal<string>('all');

  sortBy = signal<'name' | 'newest' | 'oldest'>('name');

  // Search debounce
  private readonly searchInput$ = new Subject<string>();

  // Filter and sort organisations
  visibleOrganisations = computed(() => {

    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    const sort = this.sortBy();

    let result = this.organisations().filter((org) => {

      const matchesSearch =
        (org.name ?? '').toLowerCase().includes(search) ||
        (org.ownerEmail ?? '').toLowerCase().includes(search);

      const matchesStatus =
        status === 'all' || org.status === status;

      return matchesSearch && matchesStatus;
    });

    result = [...result];

    // Sorting
    result.sort((a, b) => {

      if (sort === 'name') {
        return (a.name ?? '').localeCompare(b.name ?? '');
      }

      const dateA = a.createdAt?.getTime() ?? 0;
      const dateB = b.createdAt?.getTime() ?? 0;

      return sort === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  });

  constructor() {

    this.loadLabels();
    this.loadOrganisations();

    // Read filters from URL
    this.route.queryParamMap.subscribe((params) => {

      this.searchTerm.set(params.get('q') ?? '');

      this.statusFilter.set(params.get('status') ?? 'all');

      const sort = params.get('sort');

      if (
        sort === 'name' ||
        sort === 'newest' ||
        sort === 'oldest'
      ) {
        this.sortBy.set(sort);
      }

    });

    // Debounce search input
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.updateUrl();
      });

  }

  // Load translations
  loadLabels(): void {

    this.http.get<Labels>('/assets/translations/en.json').subscribe({

      next: (data) => {
        this.labels.set(data);
      },

      error: (err) => {
        console.error('Translation loading failed:', err);
      }

    });

  }

  // Load organisation records
  loadOrganisations(): void {

    this.loading.set(true);
    this.error.set(false);

    this.organisationService.getOrganisations().subscribe({

      next: (data) => {
        this.organisations.set(data);
        this.loading.set(false);
      },

      error: (err) => {
        console.error('Organisation loading failed:', err);
        this.error.set(true);
        this.loading.set(false);
      }

    });

  }

  // Search input handler
  onSearchInput(event: Event): void {

    const value = (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
    this.searchInput$.next(value);

  }

  // Status filter handler
  onStatusChange(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    this.statusFilter.set(value);

    this.updateUrl();

  }

  // Sorting handler
  onSortChange(event: Event): void {

    const value = (event.target as HTMLSelectElement).value;

    if (
      value === 'name' ||
      value === 'newest' ||
      value === 'oldest'
    ) {
      this.sortBy.set(value);
      this.updateUrl();
    }

  }

  // Update browser URL
  private updateUrl(): void {

    this.router.navigate([], {

      relativeTo: this.route,

      queryParams: {
        q: this.searchTerm() || null,

        status: this.statusFilter() === 'all'
          ? null
          : this.statusFilter(),

        sort: this.sortBy() === 'name'
          ? null
          : this.sortBy()
      },

      queryParamsHandling: 'merge'

    });

  }

}
