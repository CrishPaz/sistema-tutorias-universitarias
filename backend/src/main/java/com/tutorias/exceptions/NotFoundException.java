package com.tutorias.exceptions;

/** Recurso inexistente -> HTTP 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
