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
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ContactResource implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long contactId;
    private String loginId;
    private Long contactCd;
    private OffsetDateTime verifiedOn;
    private boolean verified;
    private boolean primary;

}
