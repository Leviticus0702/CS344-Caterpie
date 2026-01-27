/**
 * Application Entry Point
 */
package com.caterpie.BarWebsite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main application class for the BarWebsite application.
 * <p>
 * This is the entry point of the Spring Boot application. It starts the application by invoking
 * the {@link SpringApplication#run(Class, String...)} method.
 * </p>
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.caterpie.BarWebsite")
public class BarWebsiteApplication {

    /**
     * Main method to start the Spring Boot application.
     *
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(BarWebsiteApplication.class, args);
    }
}
