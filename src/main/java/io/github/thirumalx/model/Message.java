/**
 * 
 */
package io.github.thirumalx.model;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

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
public class Message {
	
	public static final Long SMS = 1L;
	public static final Long EMAIL = 2L;
	
	protected Long messageId;
	protected Long applicationId;
	protected String applicationName;
	protected Long channelCd;
	protected String channelLocale;
	protected Long messageOf;
	@NotNull
	protected String sender;
	@NotNull
	protected Set<String> receiver; //TO
	protected Set<String> onBehalf;
	// Can be used as subject in email
	protected String information;
	protected OffsetDateTime rowCreatedOn;
	// Status
	protected Long messageStatusId;
	protected String serviceProviderMessageId;
	protected int statusCd;
	protected String statusLocale;
	protected OffsetDateTime statusRowCreatedOn;
	// Message status
	protected List<MessageStatus> messageStatus;
	
}
