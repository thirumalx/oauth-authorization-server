/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Thirumal
 *
 */
@Getter@Setter@NoArgsConstructor@AllArgsConstructor
@ToString
public class ResetPassword implements Serializable {

	private static final long serialVersionUID = -3901776674929110609L;

	private String loginId;
	private String password;
	private String otp;
}
