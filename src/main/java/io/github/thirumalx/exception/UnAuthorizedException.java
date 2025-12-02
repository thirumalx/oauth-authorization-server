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
@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
public class UnAuthorizedException extends RuntimeException {

	private static final long serialVersionUID = 4040637714110231361L;

	public UnAuthorizedException() {
        super();
    }

    public UnAuthorizedException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public UnAuthorizedException(final String message) {
        super(message);
    }

    public UnAuthorizedException(final Throwable cause) {
        super(cause);
    }
    
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    
}
