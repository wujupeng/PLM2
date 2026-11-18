package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 移动场景保存请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class MobileSceneSaveRequest {

    /** 场景编号（为空时自动生成）。 */
    private String sceneNo;

    /** 场景编码（唯一）。 */
    @NotBlank(message = "场景编码不能为空")
    private String sceneCode;

    /** 场景名称。 */
    @NotBlank(message = "场景名称不能为空")
    private String sceneName;

    /** 扫码类型：RECEIVE/SHELVE/STOCKTAKE/PICK/REPORT/LABEL_CHECK，为空默认 RECEIVE。 */
    private String scanType;

    /** 所属业务模块。 */
    private String bizModule;

    /** 是否支持离线：1 支持 / 0 不支持，为空默认 0。 */
    private Integer requireOffline;

    /** 排序号，为空默认 1。 */
    private Integer sortNo;

    /** 场景状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String sceneStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
