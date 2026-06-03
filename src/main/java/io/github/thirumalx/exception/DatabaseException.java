package io.github.thirumalx.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Thirumal
 */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class DatabaseException extends RuntimeException {

    private static final long serialVersionUID = -8142013673686659031L;

    public DatabaseException() {
        super();
    }

    public DatabaseException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public DatabaseException(final String message) {
        super(message);
    }

    public DatabaseException(final Throwable cause) {
        super(cause);
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}
