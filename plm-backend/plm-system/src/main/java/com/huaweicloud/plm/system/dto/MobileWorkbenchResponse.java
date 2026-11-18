package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.OaMobileConfig;
import java.util.List;
import lombok.Data;

/**
 * 移动端工作台响应。
 */
@Data
public class MobileWorkbenchResponse {

    private List<OaMobileConfig> menus;

    private List<OaMobileConfig> policies;

    private Long pendingTaskCount;

    private Long unreadNotificationCount;

    private Long unreadMailCount;
}
