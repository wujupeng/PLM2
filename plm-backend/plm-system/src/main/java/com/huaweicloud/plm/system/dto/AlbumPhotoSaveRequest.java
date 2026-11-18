package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 相册图片保存入参。
 */
@Data
public class AlbumPhotoSaveRequest {

    private Long fileId;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String filePath;

    private String description;

    private Integer sortNo;
}
