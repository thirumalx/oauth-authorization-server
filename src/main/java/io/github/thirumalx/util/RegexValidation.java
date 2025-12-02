/**
 * 
 */
package io.github.thirumalx.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Thirumal
 *
 */
public class RegexValidation {

	/**
	 * 
	 */
	private RegexValidation() {
		super();
	}

	public static boolean isValidPhoneNumber(String phonenumber) {
        // Regex to check valid phonenumber
        String regex = "^[+]{1}(?:[0-9\\-\\(\\)\\/\\.]\\s?){6,15}[0-9]{1}$";
        // Compile the ReGex
        Pattern p = Pattern.compile(regex);
        // If the phonenumber
        // is empty return false
        if (phonenumber == null) {
            return false;
        }
        // Pattern class contains matcher()
        // method to find matching between
        // given phone number  using regex
        Matcher m = p.matcher(phonenumber);
        // Return if the phonenumber
        // matched the ReGex
        return m.matches();
    }
	
}
