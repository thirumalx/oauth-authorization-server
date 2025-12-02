/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Thirumal
 *
 */
@Getter@Setter
@NoArgsConstructor@AllArgsConstructor
@Builder@ToString
public class Token implements Serializable {

	private static final long serialVersionUID = 2867928104023783643L;
	
	public static final int EXPIRY_TIME_IN_MINUTES = 5;
	
	private Long tokenId;
	private Long contactId;
	private String otp;
	private OffsetDateTime expiresOn;
	private OffsetDateTime rowCreatedOn;

}
