package io.github.thirumalx.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.model.Contact;
import io.github.thirumalx.model.ContactRequest;
import io.github.thirumalx.model.ContactResource;
import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.PersonalInformationService;

/**
 * @author Thirumal
 */
@RequestMapping("/profile")
@RestController
public class PersonalInformationController {

    private final PersonalInformationService personalInformationService;

    public PersonalInformationController(PersonalInformationService personalInformationService) {
        this.personalInformationService = personalInformationService;
    }

    @GetMapping("/personal-info")
    public ResponseEntity<UserResource> getPersonalInfo() {
        return ResponseEntity.ok(personalInformationService.getPersonalInfo());
    }

    @GetMapping("/email")
    public ResponseEntity<List<ContactResource>> getEmail() {
        return ResponseEntity.ok(personalInformationService.getContactResources(Contact.EMAIL));
    }

    @PostMapping("/email")
    public ResponseEntity<Void> addEmail(@RequestBody ContactRequest contactRequest) {
        personalInformationService.addEmail(contactRequest.getEmail());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/email/{contactId}")
    public ResponseEntity<Void> deleteEmail(@PathVariable Long contactId) {
        personalInformationService.deleteContact(contactId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/email/{contactId}")
    public ResponseEntity<Void> updateEmail(@PathVariable Long contactId, @RequestBody ContactRequest contactRequest) {
        personalInformationService.updateEmail(contactId, contactRequest.getEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/phone-number")
    public ResponseEntity<List<String>> getPhoneNumber() {
        return ResponseEntity.ok(personalInformationService.getContact(Contact.PHONE_NUMBER));
    }

    /**
     * Step 1 of password change: request OTP.
     * The user is already authenticated — no loginId needed from the client.
     * Body: { "password": "<new-password>" }
     */
    @PatchMapping("/change-password/request-otp")
    public ResponseEntity<Map<String, Object>> requestPasswordChangeOtp(@RequestBody Map<String, String> body) {
        boolean sent = personalInformationService.requestPasswordChangeOtp(body.get("password"));
        return ResponseEntity.ok(Map.of("sent", sent));
    }

    /**
     * Step 2 of password change: verify OTP and apply new password.
     * Body: { "otp": "123456", "password": "<new-password>" }
     */
    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        boolean changed = personalInformationService.changePassword(body.get("otp"), body.get("password"));
        return ResponseEntity.ok(Map.of("changed", changed));
    }

}
