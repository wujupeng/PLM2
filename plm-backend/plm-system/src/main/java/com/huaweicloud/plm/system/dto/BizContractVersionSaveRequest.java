package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 合同版本保存入参（OA-DEV-080）。
 */
@Data
public class BizContractVersionSaveRequest {

    private String versionDesc;

    private String changeSummary;

    private String fileName;

    private String attachmentJson;
}
