import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches;
  mobileNavOpen = false;

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.closeMobileNav());
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.isMobile = window.matchMedia('(max-width: 700px)').matches;
    if (!this.isMobile) this.mobileNavOpen = false;
  }

  toggleMobileNav() { this.mobileNavOpen = !this.mobileNavOpen; }
  closeMobileNav() { if (this.isMobile) this.mobileNavOpen = false; }
  onDrawerOpenedChange(open: boolean) { if (this.isMobile) this.mobileNavOpen = open; }
}
