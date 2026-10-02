import { Component } from '@angular/core';
import { ManagementPageComponent } from './management-page.component';

@Component({ standalone: true, imports: [ManagementPageComponent], template: '<app-management-page view="dashboard"></app-management-page>' })
export class DashboardPageComponent {}

@Component({ standalone: true, imports: [ManagementPageComponent], template: '<app-management-page view="clients"></app-management-page>' })
export class ClientsPageComponent {}

@Component({ standalone: true, imports: [ManagementPageComponent], template: '<app-management-page view="produits"></app-management-page>' })
export class ProductsPageComponent {}

@Component({ standalone: true, imports: [ManagementPageComponent], template: '<app-management-page view="categories"></app-management-page>' })
export class CategoriesPageComponent {}

@Component({ standalone: true, imports: [ManagementPageComponent], template: '<app-management-page view="commandes"></app-management-page>' })
export class OrdersPageComponent {}
