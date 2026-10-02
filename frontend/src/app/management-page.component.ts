import { Component, OnInit, Input, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { Client, ClientService, Category, CategorieService, Product, ProduitService, Order, CommandeService, RecetteService } from './api.service';

interface DraftLine { produitId?: number; quantite: number; }
@Component({
  selector: 'app-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule, MatTableModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule],
  templateUrl: './management-page.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ManagementPageComponent implements OnInit {
  private snack = inject(MatSnackBar);
  private clientsApi = inject(ClientService); private categoriesApi = inject(CategorieService); private productsApi = inject(ProduitService); private ordersApi = inject(CommandeService); private recipesApi = inject(RecetteService);
  @Input() view = 'dashboard'; clients: Client[] = []; categories: Category[] = []; products: Product[] = []; orders: Order[] = [];
  editing?: number; form: any = {}; loading = false; categoriesLoading = false; saving = false;
  selectedPhotoName = ''; selectedPhoto: File | null = null; photoPreviewUrl = '';
  orderLines: DraftLine[] = []; quickClient = false; clientForm: Partial<Client> = {};
  selectedCategory?: Category; categoryProducts: Product[] = []; selectedOrder?: Order;
  selectedProduct?: Product; recipeContent = ''; recipeEditing = false;
  readonly orderStatuses = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE'];

  constructor() {}
  ngOnInit() { this.load(); }
  onProductImageError(event: Event) {
    const image = event.currentTarget as HTMLImageElement;
    image.hidden = true;
    image.classList.add('image-failed');
    image.removeAttribute('src');
    image.parentElement?.querySelector('.image-placeholder')?.classList.add('visible');
  }
  load() {
    if (this.view === 'clients') this.clientsApi.list().subscribe({ next: v => this.clients = v, error: e => this.error(e) });
    if (this.view === 'categories') {
      this.categoriesApi.list().subscribe({ next: v => this.categories = v, error: e => this.error(e) });
      this.productsApi.list().subscribe({ next: v => this.products = v, error: e => this.error(e) });
    }
    if (this.view === 'produits') {
      this.categoriesLoading = true;
      this.categoriesApi.list().subscribe({ next: v => { this.categories = v; this.categoriesLoading = false; }, error: e => { this.categories = []; this.categoriesLoading = false; this.error(e); } });
      this.productsApi.list().subscribe({ next: v => this.products = v, error: e => this.error(e) });
    }
    if (['commandes', 'dashboard'].includes(this.view)) this.ordersApi.list().subscribe({ next: v => this.orders = v, error: e => this.error(e) });
  }
  start(type: string, item?: any) {
    this.editing = item?.id; this.quickClient = false; this.selectedPhoto = null; this.selectedPhotoName = '';
    this.photoPreviewUrl = item?.photoUrl ? this.imageUrl(item.photoUrl) : '';
    if (type === 'commande') {
      this.clientsApi.list().subscribe({ next: v => this.clients = v, error: e => this.error(e) });
      this.productsApi.list().subscribe({ next: v => this.products = v, error: e => this.error(e) });
      this.orderLines = item ? item.lignes.map((l: any) => ({ produitId: l.produitId, quantite: l.quantite })) : [{ quantite: 1 }];
      this.form = item ? { clientId: item.client.id, dateLivraison: item.dateLivraison ? new Date(item.dateLivraison) : null, statut: item.statut } : { clientId: null, dateLivraison: null, statut: 'EN_ATTENTE' };
      return;
    }
    this.orderLines = [];
    this.form = item ? { ...item, categorieId: item.categorie?.id } : type === 'client' ? { nom: '', telephone: '', adresse: '' } : type === 'categorie' ? { nom: '' } : type === 'produit' ? { nom: '', prix: '', categorieId: null } : {};
  }
  cancel() { this.editing = undefined; this.form = {}; this.orderLines = []; this.selectedPhotoName = ''; this.selectedPhoto = null; this.photoPreviewUrl = ''; this.quickClient = false; }
  addOrderLine() { this.orderLines = [...this.orderLines, { quantite: 1 }]; }
  removeOrderLine(index: number) { this.orderLines.splice(index, 1); if (!this.orderLines.length) this.addOrderLine(); }
  setQuantity(line: DraftLine, delta: number) { line.quantite = Math.max(1, (Number(line.quantite) || 1) + delta); }
  productFor(line: DraftLine) { return this.products.find(p => p.id === Number(line.produitId)); }
  lineTotal(line: DraftLine) { return (this.productFor(line)?.prix || 0) * (Number(line.quantite) || 0); }
  get orderTotal() { return this.orderLines.reduce((sum, line) => sum + this.lineTotal(line), 0); }
  addQuickClient() {
    if (!this.clientForm.nom?.trim() || !this.clientForm.telephone?.trim()) { this.snack.open('Le nom et le tÃ©lÃ©phone du client sont obligatoires.', 'Fermer', { duration: 3000 }); return; }
    this.clientsApi.save(this.clientForm).subscribe({ next: client => { this.clients = [...this.clients, client]; this.form.clientId = client.id; this.quickClient = false; this.clientForm = {}; this.snack.open('Client ajoutÃ© avec succÃ¨s', 'OK', { duration: 2500 }); }, error: (e: any) => this.error(e) });
  }
  save() {
    if (this.saving) return;
    let call: any;
    if (this.view === 'commandes') {
      const lines = this.orderLines.filter(l => l.produitId && this.productFor(l));
      if (!this.form.clientId || !lines.length) { this.snack.open('Choisissez un client et au moins un produit.', 'Fermer', { duration: 3000 }); return; }
      const payload = { clientId: Number(this.form.clientId), statut: this.form.statut || 'EN_ATTENTE', dateLivraison: this.dateTimeValue(this.form.dateLivraison), lignes: lines.map(l => ({ produitId: l.produitId, quantite: l.quantite })) };
      call = this.ordersApi.save(payload, this.editing);
    } else if (this.view === 'produits') {
      if (!this.form.nom?.trim() || !Number.isFinite(Number(this.form.prix)) || Number(this.form.prix) < 0 || !this.form.categorieId) { this.snack.open('VÃ©rifiez le nom, le prix et la catÃ©gorie du produit.', 'Fermer', { duration: 3000 }); return; }
      call = this.productsApi.save({ ...this.form, prix: Number(this.form.prix), categorieId: Number(this.form.categorieId) }, this.editing, this.selectedPhoto);
    } else if (this.view === 'categories') call = this.categoriesApi.save(this.form, this.editing);
    else if (this.view === 'clients') call = this.clientsApi.save(this.form, this.editing);
    if (!call) return;
    this.saving = true;
    call.subscribe({ next: () => { this.saving = false; const message = this.view === 'commandes' ? (this.editing ? 'Commande modifiÃ©e avec succÃ¨s' : 'Commande ajoutÃ©e avec succÃ¨s') : 'Enregistrement effectuÃ© avec succÃ¨s'; this.snack.open(message, 'OK', { duration: 2500 }); this.load(); this.cancel(); }, error: (e: any) => { this.saving = false; this.error(e); } });
  }
  private dateTimeValue(value: Date | string | null) {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T12:00:00`;
  }
  remove(type: string, id?: number) {
    if (id === undefined) return;
    if (type === 'categories' && this.products.some(p => p.categorie?.id === id)) { this.snack.open('Cette catÃ©gorie contient encore des produits. Veuillez dÃ©placer ou supprimer ces produits avant de la supprimer.', 'Fermer', { duration: 4000 }); return; }
    if (!window.confirm('Confirmer la suppression ?')) return;
    const call = type === 'categories' ? this.categoriesApi.delete(id) : type === 'produits' ? this.productsApi.delete(id) : type === 'commandes' ? this.ordersApi.delete(id) : this.clientsApi.delete(id);
    call.subscribe({ next: () => { this.snack.open('Suppression effectuÃ©e', 'OK', { duration: 2500 }); this.load(); }, error: (e: any) => this.error(e) });
  }
  openCategory(category: Category) {
    this.selectedCategory = category;
    this.categoriesApi.products(category.id!).subscribe({ next: p => this.categoryProducts = p, error: e => this.error(e) });
  }
  showOrder(order: Order) { this.selectedOrder = order; }
  openProduct(product: Product) {
    this.selectedProduct = product; this.recipeEditing = false;
    this.recipesApi.get(product.id!).subscribe({ next: r => this.recipeContent = r.contenu || '', error: e => { this.recipeContent = ''; if (e.status !== 404) this.error(e); } });
  }
  saveRecipe() {
    if (!this.selectedProduct) return;
    const request = this.recipesApi.get(this.selectedProduct.id!);
    request.subscribe({ next: () => this.persistRecipe(true), error: () => this.persistRecipe(false) });
  }
  private persistRecipe(exists: boolean) {
    const id = this.selectedProduct!.id!;
    const call = exists ? this.recipesApi.update(id, this.recipeContent) : this.recipesApi.save(id, this.recipeContent);
    call.subscribe({ next: () => { this.recipeEditing = false; this.snack.open('Recette enregistrÃ©e.', 'OK', { duration: 2500 }); }, error: e => this.error(e) });
  }
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { this.snack.open('Formats acceptÃ©s : JPG, JPEG, PNG ou WEBP.', 'Fermer', { duration: 3500 }); input.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { this.snack.open('Image trop volumineuse (5 Mo maximum).', 'Fermer', { duration: 3500 }); input.value = ''; return; }
    this.selectedPhoto = file; this.selectedPhotoName = file.name; this.photoPreviewUrl = URL.createObjectURL(file);
  }
  imageUrl(path?: string) { return path?.startsWith('http') ? path : path || ''; }
  error(e: any) {
    this.loading = false;
    const parseFailure = e?.status === 200 && (
      e?.error instanceof SyntaxError ||
      e?.error?.error instanceof SyntaxError ||
      typeof e?.error?.text === 'string'
    );
    const message = parseFailure
      ? "RÃ©ponse illisible du serveur. VÃ©rifiez le proxy /api et le format JSON renvoyÃ©."
      : e?.error?.message || e?.error?.detail || e?.error?.title || (e?.status === 0
      ? "Le backend est injoignable. VÃ©rifiez qu'il est dÃ©marrÃ©."
      : e?.status === 404
        ? "La ressource demandÃ©e est introuvable (404). VÃ©rifiez la version du backend."
        : `Erreur du serveur (${e?.status || 'inconnue'}).`);
    this.snack.open(message, 'Fermer', { duration: 5000 });
  }
  get pending() { return this.orders.filter(o => o.statut === 'EN_ATTENTE').length; }
  get total() { return this.orders.length; }
  categoryProductCount(categoryId?: number) { return this.products.filter(p => p.categorie?.id === categoryId).length; }
  getStatusLabel(status: string) { return ({ EN_ATTENTE: 'En attente', CONFIRMEE: 'ConfirmÃ©e', EN_PREPARATION: 'En prÃ©paration', PRETE: 'PrÃªte', LIVREE: 'LivrÃ©e', ANNULEE: 'AnnulÃ©e' } as any)[status]; }
}
