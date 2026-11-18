package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_position")
public class SysPosition extends BaseEntity {

    private String positionCode;

    private String positionName;

    private Long orgId;

    /** 岗位层级：STAFF/SUPERVISOR/MANAGER/DIRECTOR/EXECUTIVE。 */
    private String positionLevel;

    private Integer sortNo;

    /** 1=启用，0=停用。 */
    private Integer status;

    private String remark;
}
