package com.bonbio.exception;

import org.springframework.http.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<Map<String,String>> handleRuntime(RuntimeException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage())); }
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<Map<String,String>> handleConflict(IllegalStateException ex) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage())); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String,String>> handleValidation(MethodArgumentNotValidException ex) { String message=ex.getBindingResult().getFieldErrors().stream().findFirst().map(error -> switch(error.getField()){case "nom" -> "Nom obligatoire."; case "prix" -> "Prix obligatoire et supérieur ou égal à 0."; case "categorieId" -> "Catégorie obligatoire."; default -> "Les données envoyées sont invalides.";}).orElse("Les données envoyées sont invalides."); return ResponseEntity.badRequest().body(Map.of("message",message)); }
    @ExceptionHandler({IllegalArgumentException.class, MissingServletRequestPartException.class, MaxUploadSizeExceededException.class})
    ResponseEntity<Map<String,String>> handleBadRequest(Exception ex) { return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage() == null ? "Les données envoyées sont invalides." : ex.getMessage())); }
}
