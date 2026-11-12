import { Component, signal } from '@angular/core';

import { OrganisationList } from './features/organisations/pages/organisation-list/organisation-list';

@Component({
  selector: 'app-root',
  imports: [ OrganisationList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('organisation-directory');
}
