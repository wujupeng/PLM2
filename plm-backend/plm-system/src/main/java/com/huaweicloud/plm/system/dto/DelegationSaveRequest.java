package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DelegationSaveRequest {

    @NotNull(message = "授权人不能为空")
    private Long delegatorUserId;

    @NotNull(message = "代理人不能为空")
    private Long delegateUserId;

    private String applyScope;

    private String processCode;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String delegationStatus;

    private String reason;

    private String remark;
}
