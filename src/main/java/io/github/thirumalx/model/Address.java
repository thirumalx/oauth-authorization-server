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
 * Model mapping the public.address table.
 * Supports different address types and usages with country/state lookups.
 *
 * @author Antigravity
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Address implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long addressId;
    private Long loginUserId;
    private Integer addressCd;
    private Integer addressUsageCd;
    private Integer countryCd;
    private Integer stateCd;
    private String addressLine1;
    private String addressLine2;
    private String cityTown;
    private String postalCode;
    private String district;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private OffsetDateTime rowCreatedOn;

    // Transient fields for displaying regional/usage descriptions
    private String countryDescription;
    private String stateDescription;
    private String addressTypeDescription;
    private String addressUsageDescription;
}
