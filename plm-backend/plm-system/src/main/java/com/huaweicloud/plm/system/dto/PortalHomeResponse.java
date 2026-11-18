package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * OA 门户首页聚合数据：登录用户信息、可见应用与代理授权概览。
 */
@Data
public class PortalHomeResponse {

    private Long userId;

    private String username;

    private String displayName;

    private List<String> roles;

    private Long orgId;

    private String organization;

    /** 我已授权他人的生效中代理记录数。 */
    private long myDelegationCount;

    /** 他人授权由我代理的生效中代理记录数。 */
    private long delegatedToMeCount;

    private List<PortalApplicationItem> applications;
}
