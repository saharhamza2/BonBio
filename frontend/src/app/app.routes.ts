import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
	{ path: '', component: AppComponent }, { path: 'clients', component: AppComponent },
	{ path: 'produits', component: AppComponent }, { path: 'categories', component: AppComponent },
	{ path: 'commandes', component: AppComponent },
	{ path: '**', redirectTo: '' }
];
