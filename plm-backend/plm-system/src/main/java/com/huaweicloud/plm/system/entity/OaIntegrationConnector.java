package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 集成连接器（OA-DEV-089 ~ OA-DEV-093，PLM/ERP/MES/QMS/EDI）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_integration_connector")
public class OaIntegrationConnector extends BaseEntity {

    /** 连接器编号。 */
    private String connectorNo;

    /** 连接器名称。 */
    private String connectorName;

    /** 系统编码：PLM/ERP/MES/QMS/EDI。 */
    private String systemCode;

    /** 系统类型。 */
    private String systemType;

    /** 基础地址。 */
    private String baseUrl;

    /** 认证方式：JWT/OAUTH2/APPKEY/SIGN。 */
    private String authType;

    /** 权威系统。 */
    private String authoritySystem;

    /** 同步方向：INBOUND/OUTBOUND/BIDIRECTIONAL。 */
    private String syncDirection;

    /** 是否启用统一登录：0/1。 */
    private Integer ssoFlag;

    /** 是否同步待办：0/1。 */
    private Integer todoSyncFlag;

    /** 主数据范围（对象类型逗号分隔）。 */
    private String masterDataScope;

    /** 关联凭证ID。 */
    private Long credentialId;

    /** 凭证到期日。 */
    private LocalDate credentialExpireDate;

    /** 最近同步时间。 */
    private LocalDateTime lastSyncTime;

    /** 状态：0 停用 / 1 启用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
