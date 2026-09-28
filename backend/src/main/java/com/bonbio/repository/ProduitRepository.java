package com.bonbio.repository;
import com.bonbio.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByCategorieId(Long categorieId);
    long countByCategorieId(Long categorieId);
}
