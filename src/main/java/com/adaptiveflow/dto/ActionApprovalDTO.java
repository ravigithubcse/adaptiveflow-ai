package com.adaptiveflow.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionApprovalDTO {
    private String actionId;
    private String approvedBy;
    private boolean approved;
    private String reason;
}
