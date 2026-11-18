package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 接口注册中心（G1-N1 集成平台 T009）：登记六大系统之间的 API 契约、协议、方向、超时与 SLA。
 * 接口治理以「接口注册中心 + 版本记录」为主干，版本变更留痕并标注兼容性，避免口头约定导致联调返工。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_api_registry")
public class SysApiRegistry extends BaseEntity {

    /** 接口编码。 */
    private String apiCode;

    /** 接口名称。 */
    private String apiName;

    /** 所属系统编码：PLM/ERP/SRM/MES/WMS/OA/EDI。 */
    private String systemCode;

    /** 交互方向：IN（接收）/OUT（发布）/BOTH（双向）。 */
    private String direction;

    /** 协议：HTTP/DUBBO/DB/MQ/FILE/EDI。 */
    private String protocol;

    /** HTTP 方法：GET/POST/PUT/DELETE。 */
    private String httpMethod;

    /** 接口路径。 */
    private String urlPath;

    /** 接口版本。 */
    private String apiVersion;

    /** 认证方式：JWT/API_KEY/OAUTH2/MTLS/NONE。 */
    private String authType;

    /** 超时时间（毫秒）。 */
    private Integer timeoutMs;

    /** SLA 时长（毫秒）。 */
    private Integer slaMs;

    /** 责任人。 */
    private String ownerName;

    /** 接口状态：DRAFT/ACTIVE/DEPRECATED/OFFLINE。 */
    private String apiStatus;

    /** 接口说明。 */
    private String description;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
