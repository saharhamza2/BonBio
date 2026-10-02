import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client { id?: number; nom: string; telephone: string; adresse?: string | null; }
export interface Category { id?: number; nom: string; }
export interface Product { id?: number; nom: string; prix: number; photoUrl?: string | null; description?: string | null; categorie: Category; }
export interface OrderLine { produitId: number; produitNom: string; quantite: number; prixUnitaire: number; }
export interface Order { id?: number; client: Client; dateCommande: string; dateLivraison?: string | null; statut: string; montantTotal: number; lignes: OrderLine[]; }

const API = '/api';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Client[]>(`${API}/clients`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Client>(`${API}/clients/${id}`, value)
      : this.http.post<Client>(`${API}/clients`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/clients/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Category[]>(`${API}/categories`);
  }

  products(id: number) {
    return this.http.get<Product[]>(`${API}/categories/${id}/produits`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Category>(`${API}/categories/${id}`, value)
      : this.http.post<Category>(`${API}/categories`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/categories/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Product[]>(`${API}/produits`);
  }

  save(value: unknown, id?: number, image?: File | null) {
    const data = new FormData();

    data.append(
      'produit',
      new Blob([JSON.stringify(value)], { type: 'application/json' })
    );

    if (image) {
      data.append('image', image, image.name);
    }

    return id
      ? this.http.put<Product>(`${API}/produits/${id}`, data)
      : this.http.post<Product>(`${API}/produits`, data);
  }

  delete(id: number) {
    return this.http.delete(`${API}/produits/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Order[]>(`${API}/commandes`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Order>(`${API}/commandes/${id}`, value)
      : this.http.post<Order>(`${API}/commandes`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/commandes/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class RecetteService {
  private http = inject(HttpClient);

  get(productId: number) {
    return this.http.get<{ contenu: string }>(
      `${API}/produits/${productId}/recette`
    );
  }

  save(productId: number, contenu: string) {
    return this.http.post(
      `${API}/produits/${productId}/recette`,
      { contenu }
    );
  }

  update(productId: number, contenu: string) {
    return this.http.put(
      `${API}/produits/${productId}/recette`,
      { contenu }
    );
  }
}
