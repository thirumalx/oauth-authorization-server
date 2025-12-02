/**
 * 
 */
package io.github.thirumalx.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

/**
 * @author Thirumal
 *
 */
public class PhoneNumberUtility {
	
	static Logger logger = LoggerFactory.getLogger(PhoneNumberUtility.class);
	
	static PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
	
	private PhoneNumberUtility() {
	    throw new IllegalStateException("Utility class");
	}
	
	public static PhoneNumber getPhoneDetail(String phoneNumber) {
		if (phoneNumber == null || phoneNumber.isBlank()) {
			return null;
		}
		try {			
			return phoneUtil.parse(phoneNumber, "IN");
		} catch (NumberParseException e) {
			logger.error("The given number {} is not a phone number", phoneNumber);
			e.printStackTrace();
		}
		return null;
	}
	
}
