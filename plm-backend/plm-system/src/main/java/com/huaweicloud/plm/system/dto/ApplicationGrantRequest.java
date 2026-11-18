package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 应用授权：以全量覆盖方式更新应用可见的角色集合。
 */
@Data
public class ApplicationGrantRequest {

    private List<Long> roleIds;
}
