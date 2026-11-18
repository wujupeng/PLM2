package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 扫码请求（G1-N6 WBS T106 移动端与PDA）：提交一次扫码动作，由服务端校验条码并记录日志。
 */
@Data
public class MobileScanRequest {

    /** 条码。 */
    @NotBlank(message = "条码不能为空")
    private String barcode;

    /** 场景编码。 */
    private String sceneCode;

    /** 扫码类型：RECEIVE/SHELVE/STOCKTAKE/PICK/REPORT/LABEL_CHECK。 */
    private String scanType;

    /** 业务键。 */
    private String bizKey;

    /** 关联单据号。 */
    private String docNo;

    /** 设备编号。 */
    private String deviceNo;
}
