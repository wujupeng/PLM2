package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends BaseEntity {

    /** 配置分类，例如 CODE、EDI、LABEL、MATERIAL。 */
    private String category;

    private String configKey;

    private String configName;

    private String configValue;

    /** 是否为业务方待确认项，1=待确认。 */
    private Integer pendingConfirm;

    /** 1=允许在界面上修改，0=仅由运维修改。 */
    private Integer editable;

    private String remark;
}
