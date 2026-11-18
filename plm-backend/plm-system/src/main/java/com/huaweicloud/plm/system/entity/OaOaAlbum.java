package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 相册：图片相册基础信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_album")
public class OaOaAlbum extends BaseEntity {

    private String albumNo;

    private String albumName;

    private String category;

    private String description;

    private Long coverPhotoId;

    /** 发布范围：ALL/DEPARTMENT/USER。 */
    private String publishScope;

    private String scopeValue;

    /** 相册状态：DRAFT/PUBLISHED/OFFLINE。 */
    private String albumStatus;

    private Integer photoCount;

    private Long creatorUserId;

    private String creatorName;

    private String remark;
}
