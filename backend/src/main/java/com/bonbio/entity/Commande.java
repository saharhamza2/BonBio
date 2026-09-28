package com.bonbio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "commande")
public class Commande {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "client_id", nullable = false) private Client client;
    @Column(name = "date_commande", nullable = false) private LocalDateTime dateCommande;
    @Column(name = "date_livraison") private LocalDateTime dateLivraison;
    @Column(nullable = false, length = 30) private String statut = "EN_ATTENTE";
    @Column(name = "montant_total", nullable = false, precision = 10, scale = 2) private BigDecimal montantTotal = BigDecimal.ZERO;
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true) private List<CommandeProduit> lignes = new ArrayList<>();
    @PrePersist void beforeInsert() { if (dateCommande == null) dateCommande = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Client getClient() { return client; } public void setClient(Client client) { this.client = client; }
    public LocalDateTime getDateCommande() { return dateCommande; } public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }
    public LocalDateTime getDateLivraison() { return dateLivraison; } public void setDateLivraison(LocalDateTime dateLivraison) { this.dateLivraison = dateLivraison; }
    public String getStatut() { return statut; } public void setStatut(String statut) { this.statut = statut; }
    public BigDecimal getMontantTotal() { return montantTotal; } public void setMontantTotal(BigDecimal montantTotal) { this.montantTotal = montantTotal; }
    public List<CommandeProduit> getLignes() { return lignes; }
    public void addLigne(CommandeProduit ligne) { lignes.add(ligne); ligne.setCommande(this); }
}
