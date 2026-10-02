package com.bonbio.service;

import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductImageService {

    private static final Logger log = LoggerFactory.getLogger(ProductImageService.class);

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp");

    private static final long MAX_SIZE = 5 * 1024 * 1024;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket:products}")
    private String bucket;

    public String store(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            return null;
        }

        if (supabaseUrl == null || supabaseUrl.isBlank()
                || supabaseKey == null || supabaseKey.isBlank()) {
            throw new IllegalStateException(
                    "Le stockage Supabase n'est pas configuré. Vérifiez SUPABASE_URL et SUPABASE_KEY."
            );
        }

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

        String fileName = UUID.randomUUID() + "." + extension;

        // Railway variables may contain accidental surrounding whitespace.
        // Normalize once so URI.create receives a valid authority.
        String storageBaseUrl = supabaseUrl.trim().replaceAll("/+$", "");
        String uploadUrl =
                storageBaseUrl
                        + "/storage/v1/object/"
                        + bucket
                        + "/"
                        + fileName;

        final byte[] imageBytes;
        try {
            imageBytes = image.getBytes();
        } catch (IOException e) {
            log.error("Could not read uploaded multipart image: bucket={}, file={}", bucket, fileName, e);
            throw new ImageReadException("Impossible de lire l'image reçue par le backend.", e);
        }

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
                    .POST(HttpRequest.BodyPublishers.ofByteArray(imageBytes))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                String safeBody = redactSecrets(response.body());
                log.error("Supabase Storage upload failed: method=POST, url={}, status={}, contentType={}, bucket={}, file={}, responseBody={}",
                        uploadUrl, response.statusCode(), request.headers().firstValue("Content-Type").orElse("unknown"),
                        bucket, fileName, safeBody);

                throw new IllegalStateException(
                        "Supabase Storage a refusé l'upload (HTTP "
                                + response.statusCode()
                                + ") : "
                                + (safeBody.isBlank() ? "réponse vide" : safeBody)
                );
            }

            return storageBaseUrl
                    + "/storage/v1/object/public/"
                    + bucket
                    + "/"
                    + fileName;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Impossible d'envoyer l'image vers Supabase Storage.",
                    e
            );
        } catch (IOException e) {
            log.error("Supabase Storage transport failed: method=POST, url={}, contentType={}, bucket={}, file={}",
                    uploadUrl, image.getContentType(), bucket, fileName, e);
            throw new StorageUploadException(
                    "Connexion à Supabase Storage impossible. Consultez les logs backend pour la cause technique.", e);
        }
    }

    private String extensionOf(String filename) {

        int dot = filename.lastIndexOf('.');

        return dot < 0
                ? ""
                : filename.substring(dot + 1)
                .toLowerCase(Locale.ROOT);
    }

    private String redactSecrets(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        String sanitized = body;
        if (supabaseKey != null && !supabaseKey.isBlank()) {
            sanitized = sanitized.replace(supabaseKey, "[REDACTED]");
        }
        return sanitized.replaceAll("(?i)(bearer\\s+)[^\\s\\\"']+", "$1[REDACTED]");
    }

    public static class StorageUploadException extends RuntimeException {
        public StorageUploadException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class ImageReadException extends RuntimeException {
        public ImageReadException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
