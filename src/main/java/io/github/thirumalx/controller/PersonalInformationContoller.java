package io.github.thirumalx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.thirumalx.model.UserResource;
import io.github.thirumalx.service.PersonalInformationService;
/**
 * @author Thirumal
 */
@RequestMapping("/profile/personal-info")
@RestController
public class PersonalInformationContoller {

    private final PersonalInformationService personalInformationService;

    public PersonalInformationContoller(PersonalInformationService personalInformationService) {
        this.personalInformationService = personalInformationService;
    }

    @GetMapping("/")
    public ResponseEntity<UserResource> getPersonalInfo() {
        return ResponseEntity.ok(personalInformationService.getPersonalInfo());
    }

    
}
