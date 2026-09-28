package com.bonbio.repository;
import com.bonbio.entity.Recette;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RecetteRepository extends JpaRepository<Recette, Long> { Optional<Recette> findByProduitId(Long produitId); }
