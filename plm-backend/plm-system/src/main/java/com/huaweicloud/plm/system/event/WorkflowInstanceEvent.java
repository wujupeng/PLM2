package com.huaweicloud.plm.system.event;

/**
 * 工作流实例终态事件：流程审批通过 / 驳回 / 撤回后发布。
 * 业务模块按 {@code businessKey} 定位并回写自己的业务单据状态，避免工作流引擎与业务模块相互耦合。
 */
public record WorkflowInstanceEvent(
        Long instanceId,
        String instanceNo,
        String processCode,
        String businessKey,
        String instanceStatus) {

    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    /**
     * 业务标识约定为 {@code BIZ_TYPE:BIZ_ID}，例如 {@code HR_LEAVE:1234567890}。
     * 未携带业务标识时返回 null，监听方应忽略该事件。
     */
    public String businessType() {
        int idx = businessKey == null ? -1 : businessKey.indexOf(':');
        return idx > 0 ? businessKey.substring(0, idx) : null;
    }

    public Long businessId() {
        int idx = businessKey == null ? -1 : businessKey.indexOf(':');
        if (idx <= 0 || idx == businessKey.length() - 1) {
            return null;
        }
        try {
            return Long.parseLong(businessKey.substring(idx + 1).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public boolean approved() {
        return STATUS_APPROVED.equals(instanceStatus);
    }
}
