package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 目录权限映射：以「目录 + 授权对象 + 权限级别」表达文档中心权限，支持向子目录继承。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_doc_folder_permission")
public class OaDocFolderPermission extends BaseEntity {

    private Long folderId;

    /** 授权对象类型：ALL/DEPT/ROLE/USER。 */
    private String subjectType;

    /** 授权对象标识：ALL 为空，DEPT 为组织ID，ROLE 为角色ID，USER 为用户ID。 */
    private Long subjectId;

    /** 权限级别：READ/WRITE/MANAGE。 */
    private String permissionLevel;

    /** 是否向子目录继承：1 继承，0 仅本目录。 */
    private Integer inheritFlag;

    private String remark;
}
