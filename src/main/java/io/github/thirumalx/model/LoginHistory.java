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
public class LoginHistory implements Serializable {

	private static final long serialVersionUID = 3285470174806684833L;

	private Long loginHistoryId;
	private Long loginUserId;
	private boolean successLogin;
	private OffsetDateTime rowCreatedOn; //Login Time
	private OffsetDateTime logoutTime;
}
