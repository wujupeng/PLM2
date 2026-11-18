package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 相册照片：相册内的图片文件记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_album_photo")
public class OaOaAlbumPhoto extends BaseEntity {

    private Long albumId;

    private Long fileId;

    private String fileName;

    private Long fileSize;

    private String contentType;

    private String filePath;

    private String description;

    private Integer sortNo;

    private Long uploaderUserId;

    private String uploaderName;

    private String remark;
}
