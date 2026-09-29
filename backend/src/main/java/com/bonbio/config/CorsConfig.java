package com.bonbio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:4200",
                    "https://spectacular-rebirth-production-5f2c.up.railway.app"
                )
                .allowedMethods(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
                .allowedHeaders("*");
    }
}