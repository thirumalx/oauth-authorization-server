/**
 * 
 */
package io.github.thirumalx.model;

import java.io.Serializable;
import java.util.Date;

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
public class GenericCd implements Serializable {

	private static final long serialVersionUID = 1683183278504192415L;

	public static final Long DEFAULT_LOCALE_CD = 1L;
	public static final String CONTACT_LOCALE = "contact_locale";
	
	//Declarating fields
	private Long codeCd;
	private Long localeCd;
	private String code;
	private String regex;
	private String description;	
	private Date startTime;	
	private Date endTime;	
	private Date rowCreatedOn;	
	private String rowCreatedBy;
	private Date rowUpdatedOn;	
	private String rowUpdatedBy;
	private String updateInfo;
	
	private String tableName;
	
}
