package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 集成凭证（OA-DEV-086 / OA-DEV-094，用于凭证到期监控）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_api_credential")
public class OaApiCredential extends BaseEntity {

    /** 凭证编号。 */
    private String credentialNo;

    /** 凭证名称。 */
    private String credentialName;

    /** 应用 Key。 */
    private String appKey;

    /** 应用密钥。 */
    private String appSecret;

    /** 所属系统：PLM/ERP/MES/QMS/EDI。 */
    private String ownerSystem;

    /** 有效期至。 */
    private LocalDate expireDate;

    /** 状态：0 停用 / 1 启用。 */
    private Integer status;

    /** 是否触发到期提醒：0/1。 */
    private Integer alertFlag;

    /** 最近使用时间。 */
    private LocalDateTime lastUsedTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
