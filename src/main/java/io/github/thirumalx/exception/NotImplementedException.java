/**
 * 
 */
package io.github.thirumalx.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @author Thirumal
 *
 */
@ResponseStatus(value = HttpStatus.NOT_IMPLEMENTED)
public class NotImplementedException extends RuntimeException {

	private static final long serialVersionUID = -7212013792580107196L;

	public NotImplementedException() {
        super();
    }

    public NotImplementedException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public NotImplementedException(final String message) {
        super(message);
    }

    public NotImplementedException(final Throwable cause) {
        super(cause);
    }
    
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
}
