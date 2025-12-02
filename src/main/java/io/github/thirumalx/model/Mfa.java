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
public class Mfa implements Serializable {
	
	private static final long serialVersionUID = -4711396330473057724L;
	
	private Long mfaId;
	private Long loginUserId;
	private Long contactId;
	private Long mfaCd;
	private String secret;
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;
	private OffsetDateTime rowCreatedOn;
	private OffsetDateTime rowUpdatedOn;
	private String rowUpdateInfo;
}
