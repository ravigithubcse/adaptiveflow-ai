package com.adaptiveflow.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealTimeUpdateDTO {
    private String updateType;
    private Object payload;
    private long timestamp;
    private Map<String, Object> metadata;
}
