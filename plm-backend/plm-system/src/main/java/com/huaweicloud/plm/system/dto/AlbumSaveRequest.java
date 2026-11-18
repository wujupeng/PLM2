package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 相册保存入参。
 */
@Data
public class AlbumSaveRequest {

    private String albumName;

    private String category;

    private String description;

    private String publishScope;

    private String scopeValue;

    private String albumStatus;

    private String remark;
}
