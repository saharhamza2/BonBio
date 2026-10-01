package com.bonbio.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductImageService {

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");

    private static final long MAX_SIZE = 5 * 1024 * 1024;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public String store(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            return null;
        }

        validateImage(image);

        String extension = extensionOf(
                image.getOriginalFilename() == null
                        ? ""
                        : image.getOriginalFilename()
        );

        String fileName = UUID.randomUUID() + "." + extension;

        String uploadUrl = supabaseUrl
                + "/storage/v1/object/products/"
                + fileName;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header(
                            "Content-Type",
                            image.getContentType() != null
                                    ? image.getContentType()
                                    : "application/octet-stream"
                    )
                    .header("x-upsert", "false")
                    .POST(
                            HttpRequest.BodyPublishers.ofByteArray(
                                    image.getBytes()
                            )
                    )
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "Erreur lors de l'upload Supabase : "
                                + response.statusCode()
                                + " - "
                                + response.body()
                );
            }

            return supabaseUrl
                    + "/storage/v1/object/public/products/"
                    + fileName;

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Impossible d'envoyer l'image vers Supabase.",
                    e
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Upload Supabase interrompu.",
                    e
            );
        }
    }

    private void validateImage(MultipartFile image) {

        if (image.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException(
                    "L'image ne doit pas dépasser 5 Mo."
            );
        }

        String originalName =
                image.getOriginalFilename() == null
                        ? ""
                        : image.getOriginalFilename();

        String extension = extensionOf(originalName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Format d'image non autorisé. Utilisez JPG, JPEG, PNG ou WEBP."
            );
        }
    }

    private String extensionOf(String filename) {

        int dot = filename.lastIndexOf('.');

        return dot < 0
                ? ""
                : filename.substring(dot + 1)
                        .toLowerCase(Locale.ROOT);
    }
}