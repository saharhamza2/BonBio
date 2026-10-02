import { Routes } from '@angular/router';
import { CategoriesPageComponent, ClientsPageComponent, DashboardPageComponent, OrdersPageComponent, ProductsPageComponent } from './section-pages.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'clients', component: ClientsPageComponent },
  { path: 'produits', component: ProductsPageComponent },
  { path: 'categories', component: CategoriesPageComponent },
  { path: 'commandes', component: OrdersPageComponent },
  { path: '**', redirectTo: 'dashboard' }
];
