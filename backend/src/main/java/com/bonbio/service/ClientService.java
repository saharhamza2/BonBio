package com.bonbio.service;
import com.bonbio.dto.Dtos.*;
import com.bonbio.entity.Client;
import com.bonbio.repository.ClientRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class ClientService {
 private final ClientRepository repo; public ClientService(ClientRepository repo){this.repo=repo;}
 public List<ClientResponse> all(){return repo.findAll().stream().map(this::out).toList();}
 public ClientResponse one(Long id){return out(repo.findById(id).orElseThrow(()->new RuntimeException("Client introuvable.")));}
 public ClientResponse save(Long id, ClientRequest r){Client c=id==null?new Client():repo.findById(id).orElseThrow(()->new RuntimeException("Client introuvable.")); c.setNom(r.nom()); c.setTelephone(r.telephone()); c.setAdresse(r.adresse()); return out(repo.save(c));}
 public void delete(Long id){repo.delete(repo.findById(id).orElseThrow(()->new RuntimeException("Client introuvable.")));}
 private ClientResponse out(Client c){return new ClientResponse(c.getId(),c.getNom(),c.getTelephone(),c.getAdresse());}
}
