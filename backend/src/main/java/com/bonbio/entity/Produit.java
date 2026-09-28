package com.bonbio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "produit")
public class Produit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 150) private String nom;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal prix;
    @Column(name = "photo_url", columnDefinition = "TEXT") private String photoUrl;
    @Column(columnDefinition = "TEXT") private String description;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "categorie_id", nullable = false) private Categorie categorie;
    @OneToOne(mappedBy = "produit", fetch = FetchType.LAZY) private Recette recette;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; } public void setNom(String nom) { this.nom = nom; }
    public BigDecimal getPrix() { return prix; } public void setPrix(BigDecimal prix) { this.prix = prix; }
    public String getPhotoUrl() { return photoUrl; } public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public Categorie getCategorie() { return categorie; } public void setCategorie(Categorie categorie) { this.categorie = categorie; }
}
