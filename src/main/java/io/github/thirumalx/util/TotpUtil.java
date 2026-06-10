package io.github.thirumalx.util;

import com.google.common.io.BaseEncoding;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;

/**
 * Utility class for actual Time-based One-Time Password (TOTP) generation and verification.
 * Adheres to RFC 6238 standard using HMAC-SHA1.
 *
 * @author Thirumal
 */
public class TotpUtil {

    private static final int TIME_STEP = 30; // seconds

    /**
     * Generates a secure, random 16-character Base32 secret key.
     * @return 16-character Base32 encoded secret key
     */
    public static String generateSecret() {
        byte[] buffer = new byte[10]; // 80 bits of entropy
        new SecureRandom().nextBytes(buffer);
        return BaseEncoding.base32().omitPadding().encode(buffer);
    }

    /**
     * Generates standard provisioning URI format for QR codes.
     */
    public static String getQrUri(String secret, String issuer, String accountName) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                issuer, accountName, secret, issuer);
    }

    /**
     * Verifies the 6-digit TOTP code against the secret key.
     * Supports a ±1 step (30 seconds) time window drift.
     */
    public static boolean verifyCode(String secret, String codeStr) {
        if (secret == null || codeStr == null) {
            return false;
        }
        try {
            int code = Integer.parseInt(codeStr.trim());
            byte[] decodedKey = BaseEncoding.base32().decode(secret.toUpperCase().replace(" ", ""));
            long currentInterval = System.currentTimeMillis() / 1000 / TIME_STEP;
            
            // Try current, past, and future interval to handle minor clock discrepancies
            for (int i = -1; i <= 1; i++) {
                if (calculateCode(decodedKey, currentInterval + i) == code) {
                    return true;
                }
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    private static int calculateCode(byte[] key, long interval) {
        try {
            byte[] data = ByteBuffer.allocate(8).putLong(interval).array();
            SecretKeySpec signKey = new SecretKeySpec(key, "HmacSHA1");
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(signKey);
            byte[] hash = mac.doFinal(data);
            
            int offset = hash[hash.length - 1] & 0xF;
            int truncatedHash = 0;
            for (int i = 0; i < 4; ++i) {
                truncatedHash <<= 8;
                truncatedHash |= (hash[offset + i] & 0xFF);
            }
            truncatedHash &= 0x7FFFFFFF;
            return truncatedHash % 1000000;
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Error calculating TOTP", e);
        }
    }
}
