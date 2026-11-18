package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpOutsourceIssue;
import com.huaweicloud.plm.system.entity.ErpOutsourceIssueLine;
import lombok.Data;

import java.util.List;

/**
 * 委外发料单详情：头信息与行项目（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceIssueDetailResponse {

    private ErpOutsourceIssue header;

    private List<ErpOutsourceIssueLine> lines;
}
