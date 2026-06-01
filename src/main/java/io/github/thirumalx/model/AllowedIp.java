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
 * Model mapping the public.allowed_ip table.
 * Restricted dynamically to designated clients and CIDR ranges.
 *
 * @author Thirumal
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AllowedIp implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long allowedIpId;
    private Long loginUserId;
    private String id; // oauth2 registered client id
    private String ipRange;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private OffsetDateTime createdAt;

    // Transient client metadata populated via SQL joins
    private String clientName;
    private String clientId;
}
