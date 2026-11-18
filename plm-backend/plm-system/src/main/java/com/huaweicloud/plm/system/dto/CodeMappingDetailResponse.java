package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.CodeMapping;
import com.huaweicloud.plm.system.entity.ScanLog;
import lombok.Data;

import java.util.List;

/**
 * 编码映射详情（含扫描日志）。
 */
@Data
public class CodeMappingDetailResponse {

    /** 映射记录。 */
    private CodeMapping mapping;

    /** 该原码的扫描日志。 */
    private List<ScanLog> logs;
}
