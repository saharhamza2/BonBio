package com.bonbio.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "client")
public class Client {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String nom;
    @Column(nullable = false, length = 20) private String telephone;
    @Column(columnDefinition = "TEXT") private String adresse;
    @OneToMany(mappedBy = "client") private List<Commande> commandes = new ArrayList<>();
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; } public void setNom(String nom) { this.nom = nom; }
    public String getTelephone() { return telephone; } public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getAdresse() { return adresse; } public void setAdresse(String adresse) { this.adresse = adresse; }
}
