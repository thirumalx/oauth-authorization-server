/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
@ToString(callSuper = true)
public class Email extends Message implements Serializable {
	
	private static final long serialVersionUID = -7458838274460301305L;
	
	private Set<String> cC;
	private Set<String> bCC;
	//
	private String template;
	//
	private Map<String, Object> model;
	private List<byte[]> attachments;
	private InformationDetail informationDetail;
	
	public static final String SIGNUP_FTL_TEMPLATE = "signup";
	public static final String ACCOUNT_VERIFY_FTL_TEMPLATE = "accountVerify";
	public static final String RESET_PASSWORD_FTL_TEMPLATE = "resetPassword";
	public static final String RESET_PASSWORD_SUCCESS_FTL = "resetPasswordSuccess";
	
	public Email(Message m) {
		this.messageId = m.getMessageId();
		this.applicationId = m.getApplicationId();
		this.applicationName = m.getApplicationName();
		this.channelCd = m.getChannelCd();
		this.channelLocale = m.getChannelLocale();
		this.messageOf = m.getMessageOf();
		this.sender = m.getSender();
		this.receiver = m.getReceiver();
		this.onBehalf = m.getOnBehalf();
		this.information = m.getInformation();
		this.rowCreatedOn = m.getRowCreatedOn();
		this.messageStatusId = m.getMessageStatusId();
		this.statusCd = m.getStatusCd();
		this.statusLocale = m.getStatusLocale();
		this.statusRowCreatedOn = m.getStatusRowCreatedOn();
		setInformationDetail();
	}
	
	public Email(String sender, Set<String> receiver, String template, Map<String, Object> model, String information,
			Long messageOf) {
		this.sender = sender;
		this.receiver = receiver;
		this.template = template;
		this.model = model;
		this.information = information;
		this.messageOf = messageOf;
	}
	
	public Email(String sender, Set<String> receiver, Set<String> cc, String template, Map<String, Object> model, String information,
			Long messageOf) {
		this.sender = sender;
		this.receiver = receiver;
		this.cC = cc;
		this.template = template;
		this.model = model;
		this.information = information;
		this.messageOf = messageOf;
	}
	
	public void setInformationDetail() {
		ObjectMapper objectMapper = new ObjectMapper();
		try {
			this.setInformationDetail(objectMapper.readValue(this.information, new TypeReference<InformationDetail>() {}));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}

	}
	
	@Getter@Setter
	@NoArgsConstructor@AllArgsConstructor
	@Builder@ToString
	public
	static class InformationDetail implements Serializable {
		
		private static final long serialVersionUID = 5026163831882298277L;
		
		private String subject;
		private String body;
		
	}
	
}
