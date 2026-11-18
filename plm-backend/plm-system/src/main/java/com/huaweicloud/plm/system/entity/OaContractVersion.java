package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 合同版本（OA-DEV-080）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_contract_version")
public class OaContractVersion extends BaseEntity {

    /** 合同ID。 */
    private Long contractId;

    /** 版本号。 */
    private Integer versionNo;

    /** 版本描述。 */
    private String versionDesc;

    /** 变更摘要。 */
    private String changeSummary;

    /** 文件名。 */
    private String fileName;

    /** 附件JSON。 */
    private String attachmentJson;

    /** 操作人用户ID。 */
    private Long operatorUserId;

    /** 操作人姓名。 */
    private String operatorName;

    /** 备注。 */
    private String remark;
}
