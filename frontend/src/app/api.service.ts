import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client { id?: number; nom: string; telephone: string; adresse?: string; }
export interface Category { id?: number; nom: string; }
export interface Product { id?: number; nom: string; prix: number; photoUrl?: string; description?: string; categorie: Category; }
export interface OrderLine { produitId: number; produitNom: string; quantite: number; prixUnitaire: number; }
export interface Order { id?: number; client: Client; dateCommande: string; dateLivraison?: string; statut: string; montantTotal: number; lignes: OrderLine[]; }

const API = 'https://bonbio-production.up.railway.app';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Client[]>(`${API}/api/clients`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Client>(`${API}/api/clients/${id}`, value)
      : this.http.post<Client>(`${API}/api/clients`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/api/clients/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Category[]>(`${API}/api/categories`);
  }

  products(id: number) {
    return this.http.get<Product[]>(`${API}/api/categories/${id}/produits`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Category>(`${API}/api/categories/${id}`, value)
      : this.http.post<Category>(`${API}/api/categories`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/api/categories/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Product[]>(`${API}/api/produits`);
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
      ? this.http.put<Product>(`${API}/api/produits/${id}`, data)
      : this.http.post<Product>(`${API}/api/produits`, data);
  }

  delete(id: number) {
    return this.http.delete(`${API}/api/produits/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Order[]>(`${API}/api/commandes`);
  }

  save(value: unknown, id?: number) {
    return id
      ? this.http.put<Order>(`${API}/api/commandes/${id}`, value)
      : this.http.post<Order>(`${API}/api/commandes`, value);
  }

  delete(id: number) {
    return this.http.delete(`${API}/api/commandes/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class RecetteService {
  private http = inject(HttpClient);

  get(productId: number) {
    return this.http.get<{ contenu: string }>(
      `${API}/api/produits/${productId}/recette`
    );
  }

  save(productId: number, contenu: string) {
    return this.http.post(
      `${API}/api/produits/${productId}/recette`,
      { contenu }
    );
  }

  update(productId: number, contenu: string) {
    return this.http.put(
      `${API}/api/produits/${productId}/recette`,
      { contenu }
    );
  }
}