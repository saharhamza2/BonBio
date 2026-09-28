# BonBio V0

Application privée de gestion pour une petite pâtisserie : Angular 18 + Angular Material, Spring Boot 3.3, Spring Data JPA et PostgreSQL.

## Architecture

- `backend/` : API REST Spring Boot, entités JPA, services, repositories et DTOs.
- `frontend/` : application Angular standalone avec routing, services HttpClient et interface Material responsive.

## Prérequis

- Java 17+
- Maven 3.9+ (ou Maven Wrapper si ajouté localement)
- Node.js 20 recommandé pour Angular 18 et npm
- PostgreSQL avec la base existante `bonbio`

## Configuration PostgreSQL

Le backend utilise `spring.jpa.hibernate.ddl-auto=validate` et ne crée ni ne modifie les tables. Par défaut :

```powershell
$env:DB_USERNAME='postgres'
$env:DB_PASSWORD='votre_mot_de_passe'
```

L’URL par défaut est `jdbc:postgresql://localhost:5432/bonbio`. Elle peut être remplacée par `DB_URL`.

## Lancer

Backend :

```powershell
cd backend
mvn spring-boot:run
```

Frontend :

```powershell
cd frontend
npm install
ng serve
```

- Frontend : http://localhost:4200
- Backend : http://localhost:8084

## Endpoints principaux

`/api/clients`, `/api/categories`, `/api/produits`, `/api/commandes` exposent GET, POST, PUT et DELETE. Les recettes utilisent `/api/produits/{produitId}/recette` en GET, POST et PUT.

Le backend calcule toujours le total d’une commande à partir des prix courants des produits, puis enregistre ces prix dans `commande_produit.prix_unitaire`.
