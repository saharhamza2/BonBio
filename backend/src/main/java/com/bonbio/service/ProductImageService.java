package com.bonbio.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.io.InputStream;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductImageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private final Path uploadDirectory = Path.of("uploads", "products");

    public String store(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;
        if (image.getSize() > MAX_SIZE) throw new IllegalArgumentException("L'image ne doit pas dépasser 5 Mo.");
        String originalName = image.getOriginalFilename() == null ? "" : image.getOriginalFilename();
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Format d'image non autorisé. Utilisez JPG, JPEG, PNG ou WEBP.");
        }
        try {
            Path absoluteUploadDirectory = uploadDirectory.toAbsolutePath().normalize();
            Files.createDirectories(absoluteUploadDirectory);
            String fileName = UUID.randomUUID() + "." + extension;
            Path destination = absoluteUploadDirectory.resolve(fileName).normalize();
            if (!destination.getParent().equals(absoluteUploadDirectory)) {
                throw new IllegalArgumentException("Nom de fichier invalide.");
            }
            try (InputStream input = image.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/products/" + fileName;
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de sauvegarder l'image.", exception);
        }
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
