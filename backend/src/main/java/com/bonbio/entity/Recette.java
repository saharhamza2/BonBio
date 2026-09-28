package com.bonbio.entity;

import jakarta.persistence.*;

@Entity @Table(name = "recette")
public class Recette {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "produit_id", nullable = false, unique = true) private Produit produit;
    @Column(columnDefinition = "TEXT") private String contenu;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Produit getProduit() { return produit; } public void setProduit(Produit produit) { this.produit = produit; }
    public String getContenu() { return contenu; } public void setContenu(String contenu) { this.contenu = contenu; }
}
