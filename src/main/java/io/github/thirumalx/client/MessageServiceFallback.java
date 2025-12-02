/**
 * 
 */
package io.github.thirumalx.client;

import org.springframework.stereotype.Component;

import io.github.thirumalx.model.Email;
import io.github.thirumalx.model.Message;

/**
 * @author Thirumal
 *
 */
@Component
public class MessageServiceFallback implements MessageServiceClient {

	@Override
	public Message send(Message message) {
		return null;
	}

	@Override
	public Email send(Email email) {
		return null;
	}

}
