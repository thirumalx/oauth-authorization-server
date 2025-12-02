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
public class Contact implements Serializable {

	private static final long serialVersionUID = -418096072327096724L;
	
	public static final Long EMAIL = 1L;
	public static final Long PHONE_NUMBER = 2L;
	
	private Long contactId;
	private Long loginUserId;
	private Long contactCd;
	private String loginId;
	private OffsetDateTime verifiedOn;
	private OffsetDateTime endTime;
	private OffsetDateTime rowCreatedOn;
}
