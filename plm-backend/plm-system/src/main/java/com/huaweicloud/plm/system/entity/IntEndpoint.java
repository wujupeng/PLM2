package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 接口配置（N9，DEV-095/096/097）：接口地址、协议、认证、超时、重试与幂等/补偿开关。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_endpoint")
public class IntEndpoint extends BaseEntity {

    /** 接口编码（唯一）。 */
    private String endpointCode;

    /** 接口名称。 */
    private String endpointName;

    /** 所属域：PLM/ERP/MES/QMS/EDI。 */
    private String domain;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 协议：REST/SOAP/FILE/MQ。 */
    private String protocol;

    /** 接口地址。 */
    private String endpointUrl;

    /** 认证方式。 */
    private String authType;

    /** 超时（毫秒）。 */
    private Integer timeoutMs;

    /** 最大重试次数。 */
    private Integer retryMax;

    /** 是否启用幂等：1 启用 / 0 关闭。 */
    private Integer idempotentEnabled;

    /** 是否启用补偿：1 启用 / 0 关闭。 */
    private Integer compensateEnabled;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
