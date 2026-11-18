package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 幂等记录保存请求（G1-N1 集成平台，WBS T009）。
 */
@Data
public class SysIdempotentRecordSaveRequest {

    /** 幂等键（唯一）。 */
    @NotBlank(message = "幂等键不能为空")
    private String idempotentKey;

    /** 业务类型。 */
    private String bizType;

    /** 业务ID。 */
    private String bizId;

    /** 请求摘要哈希。 */
    private String requestHash;

    /** 处理结果码。 */
    private Integer resultCode;

    /** 过期时间（yyyy-MM-dd HH:mm:ss），为空时按配置有效期自动计算。 */
    private String expireAt;

    /** 记录状态：PROCESSING/SUCCESS/DUPLICATE/FAILED。 */
    private String recordStatus;

    /** 操作人。 */
    private String operatorName;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
