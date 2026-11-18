package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 图文档版本保存请求。
 */
@Data
public class DocVersionSaveRequest {

    /** 版本号，为空时自动递增。 */
    private String versionNo;

    /** 文件名。 */
    private String fileName;

    /** 文件存储路径。 */
    private String filePath;

    /** 文件大小（字节）。 */
    private Long fileSize;

    /** 文件类型。 */
    private String fileType;

    /** 文件摘要（哈希）。 */
    private String fileHash;

    /** 元数据 JSON。 */
    private String metadataJson;

    /** 变更说明。 */
    private String changeNote;

    /** 是否激活为当前版本。 */
    private Boolean activate;
}
