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
@Getter@Setter@NoArgsConstructor@AllArgsConstructor
@Builder@ToString
public class ContactVerify implements Serializable {

	private static final long serialVersionUID = -3943640555314447846L;
	
	private String contact;
	private String otp;
	
}
