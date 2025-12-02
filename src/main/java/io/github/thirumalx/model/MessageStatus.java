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
@NoArgsConstructor
@AllArgsConstructor
@Builder@ToString
public class MessageStatus implements Serializable {

	private static final long serialVersionUID = 3535363803999309815L;
	
	public static final int SEND = 1;
	public static final int RENDERING_FAILURE = 2;
	public static final int REJECT = 3;
	public static final int DELIVERY = 4;
	public static final int HARD_BOUNCE = 5;
	public static final int COMPLAINT = 6;
	public static final int DELIVERY_DELAY = 7;
	public static final int SUBSCRIPTION = 8;
	public static final int OPEN = 9;
	public static final int CLICK = 10;	
	
	private Long messageStatusId;
	private Long messageId;
	private int statusCd;
	private String statusLocale;
	private String serviceProviderMessageId;
	private OffsetDateTime rowCreatedOn;

}
