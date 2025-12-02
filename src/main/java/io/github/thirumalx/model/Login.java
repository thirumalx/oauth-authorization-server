/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;

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
public class Login implements Serializable {

	private static final long serialVersionUID = -778307071060901871L;

	private String loginId;
	private String password;
}
