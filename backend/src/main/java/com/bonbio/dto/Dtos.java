package com.bonbio.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Dtos {
    private Dtos() {}
    public record ClientRequest(@NotBlank @Size(max=100) String nom, @NotBlank @Size(max=20) String telephone, String adresse) {}
    public record ClientResponse(Long id, String nom, String telephone, String adresse) {}
    public record CategorieRequest(@NotBlank @Size(max=100) String nom) {}
    public record CategorieResponse(Long id, String nom) {}
    public record ProduitRequest(@NotBlank @Size(max=150) String nom, @NotNull @DecimalMin("0.0") BigDecimal prix, String photoUrl, String description, @NotNull Long categorieId) {}
    public record ProduitResponse(Long id, String nom, BigDecimal prix, String photoUrl, String description, CategorieResponse categorie) {}
    public record RecetteRequest(String contenu) {}
    public record RecetteResponse(Long id, Long produitId, String contenu) {}
    public record LigneRequest(@NotNull Long produitId, @NotNull @Positive Integer quantite) {}
    public record CommandeRequest(@NotNull Long clientId, LocalDateTime dateLivraison, @NotBlank String statut, @NotEmpty List<LigneRequest> lignes) {}
    public record LigneResponse(Long produitId, String produitNom, Integer quantite, BigDecimal prixUnitaire) {}
    public record CommandeResponse(Long id, ClientResponse client, LocalDateTime dateCommande, LocalDateTime dateLivraison, String statut, BigDecimal montantTotal, List<LigneResponse> lignes) {}
}
