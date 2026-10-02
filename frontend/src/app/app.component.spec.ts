import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { filter, of, take } from 'rxjs';
import { AppComponent } from './app.component';
import { ManagementPageComponent } from './management-page.component';
import { routes } from './app.routes';
import { ClientService, CategorieService, ProduitService, CommandeService, RecetteService } from './api.service';

describe('AppComponent sidebar navigation', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;

  beforeEach(async () => {
    const listApi = { list: () => of([]), save: () => of({}), delete: () => of({}) };
    const clientsApi = { ...listApi, list: () => of([{ id: 12, nom: 'Client test', telephone: '123', adresse: '' }]) };
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        provideNoopAnimations(),
        { provide: ClientService, useValue: clientsApi },
        { provide: CategorieService, useValue: { ...listApi, products: () => of([]) } },
        { provide: ProduitService, useValue: listApi },
        { provide: CommandeService, useValue: listApi },
        { provide: RecetteService, useValue: { get: () => of({ contenu: '' }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/clients');
    fixture.detectChanges();
  });

  function page() {
    return fixture.debugElement.query(By.directive(ManagementPageComponent)).componentInstance as ManagementPageComponent;
  }

  async function clickSidebarLink(path: string) {
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector(`nav a[routerLink="${path}"]`) as HTMLAnchorElement;
    expect(anchor).withContext(`sidebar link ${path} exists`).toBeTruthy();
    if (component.isMobile) {
      (fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.mobileNavOpen).toBeTrue();
    }
    const navigation = router.events.pipe(filter(event => event instanceof NavigationEnd), take(1)).toPromise();
    anchor.click();
    await navigation;
    fixture.detectChanges();
  }

  it('routes to distinct page components and keeps forms closed until Add is clicked', async () => {
    const addButton = fixture.nativeElement.querySelector('.page-head button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.inline-form')).toBeTruthy();

    component.isMobile = true;
    for (const [path, selector] of [
      ['/produits', '.product-form'],
      ['/categories', '.category-form'],
      ['/commandes', '.order-form'],
      ['/clients', '.inline-form']
    ] as const) {
      await clickSidebarLink(path);
      expect(router.url).toBe(path);
      expect(fixture.nativeElement.querySelector(selector)).toBeNull();
      expect(component.mobileNavOpen).toBeFalse();
    }

    const clientPage = page();
    (fixture.nativeElement.querySelector('.page-head button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.inline-form')).toBeTruthy();
    expect(clientPage.form.nom).toBe('');
    (fixture.nativeElement.querySelector('.inline-form button:last-child') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.inline-form')).toBeNull();

    component.isMobile = false;
    for (const path of ['/produits', '/categories', '/commandes', '/clients']) {
      await clickSidebarLink(path);
      expect(router.url).toBe(path);
      expect(fixture.nativeElement.querySelector('.page-head button')).toBeTruthy();
    }
    await clickSidebarLink('/dashboard');
    expect(router.url).toBe('/dashboard');
    expect(fixture.nativeElement.querySelector('.dashboard')).toBeTruthy();
  });

  it('shows the drawer control at mobile breakpoints and hides it on desktop', () => {
    let width = 375;
    spyOn(window, 'matchMedia').and.callFake((media: string) => ({
      matches: width <= 700,
      media,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    }) as MediaQueryList);
    for (width of [375, 390, 412]) {
      component.onWindowResize();
      fixture.detectChanges();
      expect(component.isMobile).withContext(`${width}px`).toBeTrue();
      expect(fixture.nativeElement.querySelector('.menu-toggle')).withContext(`${width}px menu button`).toBeTruthy();
    }
    width = 1280;
    component.mobileNavOpen = true;
    component.onWindowResize();
    fixture.detectChanges();
    expect(component.isMobile).toBeFalse();
    expect(component.mobileNavOpen).toBeFalse();
    expect(fixture.nativeElement.querySelector('.menu-toggle')).toBeNull();
  });
});
