package com.bonbio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "commande_produit")
public class CommandeProduit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "commande_id", nullable = false) private Commande commande;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "produit_id", nullable = false) private Produit produit;
    @Column(nullable = false) private Integer quantite;
    @Column(name = "prix_unitaire", nullable = false, precision = 10, scale = 2) private BigDecimal prixUnitaire;
    public Long getId() { return id; } public Long getProduitId() { return produit.getId(); }
    public Commande getCommande() { return commande; } public void setCommande(Commande commande) { this.commande = commande; }
    public Produit getProduit() { return produit; } public void setProduit(Produit produit) { this.produit = produit; }
    public Integer getQuantite() { return quantite; } public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public BigDecimal getPrixUnitaire() { return prixUnitaire; } public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }
}
