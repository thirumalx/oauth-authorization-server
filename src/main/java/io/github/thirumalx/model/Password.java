/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.function.Predicate;
import java.util.regex.Pattern;

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
@ToString@Builder
public class Password implements Serializable {

	private static final long serialVersionUID = 2897050433726245292L;
	
	public static final Predicate<String> passwordComplexity = p -> Pattern.matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$", p);
	
	private Long passwordId;
	private Long loginUserId;
	private String secretKey;	
	private boolean forcePasswordChange;
	private OffsetDateTime rowCreatedOn;

}
