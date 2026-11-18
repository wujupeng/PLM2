package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_process_node")
public class OaProcessNode extends BaseEntity {

    private Long processId;

    private String nodeCode;

    private String nodeName;

    /** 节点类型：START/APPROVAL/CC/END。 */
    private String nodeType;

    /** 审批人类型：USER/ROLE/ORG_MANAGER/APPLICANT_MANAGER/PROCESS_STARTER。 */
    private String approverType;

    /** 审批人参数：USER 为逗号分隔用户 ID，ROLE 为逗号分隔角色 ID。 */
    private String approverValue;

    /** 1=允许按代理授权自动转办，0=不允许。 */
    private Integer allowDelegate;

    private Integer sortNo;

    private String remark;
}
