package com.tutorias.exceptions;

/** Conflicto con el estado actual (p. ej. duplicado) -> HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
