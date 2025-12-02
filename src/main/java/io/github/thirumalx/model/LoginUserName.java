/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;

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
public class LoginUserName implements Serializable {

	private static final long serialVersionUID = -8753030299971899838L;

	private Long loginUserNameId;
	private Long loginUserId;
	private String firstName;
	private String middleName;
	private String lastName;
	private OffsetDateTime rowCreatedOn;
	
	@Override
	public int hashCode() {
		return Objects.hash(firstName, lastName, loginUserId, middleName);
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof LoginUserName)) {
			return false;
		}
		LoginUserName other = (LoginUserName) obj;
		return Objects.equals(firstName, other.firstName) && Objects.equals(lastName, other.lastName)
				&& Objects.equals(loginUserId, other.loginUserId)&& Objects.equals(middleName, other.middleName);
	}
	
}
