/**
 * 
 */
package io.github.thirumalx.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import feign.FeignException;
import jakarta.servlet.http.HttpServletResponse;

/**
 * @author Thirumal
 *
 */
@RestControllerAdvice
public class FeignExceptionHandler {
	
	private final Logger logger = LoggerFactory.getLogger(this.getClass());	

	@ExceptionHandler(FeignException.BadRequest.class)  
    public Map<String, Object> handleFeignStatusException(FeignException e, HttpServletResponse response) {
		response.setStatus(e.status());
        logger.error("Feign Exception: {}", e.getMessage());
        throw e;
    }
		
}
