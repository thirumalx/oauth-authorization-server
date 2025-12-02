/**
 * 
 */
package io.github.thirumalx.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * @author Thirumal
 *
 */
@RestControllerAdvice
public class ErrorHandler {

    @ExceptionHandler(OAuth2AuthorizationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleOAuth2AuthorizationException(OAuth2AuthorizationException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getError().getErrorCode());
        error.put("description", ex.getError().getDescription());
        error.put("uri", ex.getError().getUri());
        return error;
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleGenericException(Exception ex) {
        ex.printStackTrace(); // log for debugging
        Map<String, Object> error = new HashMap<>();
        error.put("error", "server_error");
        error.put("description", ex.getMessage());
        return error;
    }
    
	@ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BadRequestException handleBadRequestException(BadRequestException badRequestException) {
        return badRequestException;
    }
		
	@ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResourceNotFoundException handleResourceNotFoundException(ResourceNotFoundException resourceNotFoundException) {
        return resourceNotFoundException;
    }
	
	@ExceptionHandler(UnAuthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public UnAuthorizedException handleResourceUnAuthorizedException(UnAuthorizedException unAuthorizedException) {
        return unAuthorizedException;
    }
	
	@ExceptionHandler(NotImplementedException.class)
    @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
    public NotImplementedException handleResourceNotImplementedException(NotImplementedException notImplementedException) {
        return notImplementedException;
    }
	
}
