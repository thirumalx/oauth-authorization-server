/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
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
public class LoginUser implements Serializable {

	private static final long serialVersionUID = 8998709262269738118L;
	
	private Long loginUserId;
	@NotNull
	private UUID loginUuid;
	private OffsetDateTime dateOfBirth;
	private boolean individual;
	private OffsetDateTime rowCreatedOn;
	
	public LoginUser(LoginUser loginUser) {
		this(loginUser.loginUserId, loginUser.getLoginUuid(), loginUser.getDateOfBirth(), loginUser.individual, loginUser.getRowCreatedOn());
	}

	@Override
	public int hashCode() {
		return Objects.hash(dateOfBirth, individual);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof LoginUser)) {
			return false;
		}
		LoginUser other = (LoginUser) obj;
		return Objects.equals(dateOfBirth, other.dateOfBirth) && individual == other.individual;
	}


}
