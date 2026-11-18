package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N3 统一文件服务通用分页查询条件。
 * 各字段按业务对象选择性使用：bizModule/bizType/storageType/securityLevel/scanStatus/fileStatus/archiveStatus（统一附件）、
 * versionStatus（文件版本）、taskStatus/convertMode（预览转换任务）、scanResult（病毒扫描记录）、
 * archiveType/restoreStatus（文件归档）、startDate/endDate（时间区间，作用于创建时间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FileQuery extends PageQuery {

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 业务单据类型。 */
    private String bizType;

    /** 存储类型：OBJECT/LOCAL。 */
    private String storageType;

    /** 密级：PUBLIC/INTERNAL/CONFIDENTIAL/SECRET。 */
    private String securityLevel;

    /** 扫描状态：PENDING/CLEAN/INFECTED/ERROR。 */
    private String scanStatus;

    /** 文件状态：NORMAL/QUARANTINED/ARCHIVED/DELETED。 */
    private String fileStatus;

    /** 归档状态：PENDING/ARCHIVED/RESTORING/RESTORED/EXPIRED。 */
    private String archiveStatus;

    /** 版本状态：ACTIVE/HISTORY。 */
    private String versionStatus;

    /** 任务状态：PENDING/PROCESSING/SUCCESS/FAILED。 */
    private String taskStatus;

    /** 转换模式：OFFICE/CAD/PDF/IMAGE。 */
    private String convertMode;

    /** 归档类型：HOT/COLD/PERMANENT。 */
    private String archiveType;

    /** 恢复状态：NONE/REQUESTED/DONE。 */
    private String restoreStatus;

    /** 扫描结果：CLEAN/INFECTED/ERROR。 */
    private String scanResult;

    /** 起始日期（yyyy-MM-dd）。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd）。 */
    private String endDate;
}
