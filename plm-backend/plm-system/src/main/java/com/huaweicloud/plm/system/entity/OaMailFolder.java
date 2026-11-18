package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_mail_folder")
public class OaMailFolder extends BaseEntity {

    private String folderCode;

    private String folderName;

    /** 文件夹类型：SYSTEM=系统文件夹，CUSTOM=自定义文件夹。 */
    private String folderType;

    private Long ownerUserId;

    private Integer sortNo;

    private String status;

    private String remark;
}
