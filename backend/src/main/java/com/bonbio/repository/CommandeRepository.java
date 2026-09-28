package com.bonbio.repository;
import com.bonbio.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CommandeRepository extends JpaRepository<Commande, Long> { List<Commande> findTop5ByOrderByDateCommandeDesc(); }
