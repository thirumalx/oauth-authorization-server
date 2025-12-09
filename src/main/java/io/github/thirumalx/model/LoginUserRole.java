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
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class LoginUserRole implements Serializable {

	private static final long serialVersionUID = 454177013599136156L;

	public static final Long USER = 1L;
	public static final Long SUPPORT = 2L;
	public static final Long ADMIN = 3L;

	private Long loginUserRoleId;
	private Long loginUserId;
	private Long roleCd;
	private String role;
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;
	private String remarks;
}
