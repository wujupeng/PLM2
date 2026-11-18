package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 交付物（N9，DEV-105）：源代码、技术文档、部署脚本与配置清单等交付与验收。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_delivery_item")
public class IntDeliveryItem extends BaseEntity {

    /** 交付物编号（唯一）。 */
    private String itemNo;

    /** 类别：SOURCE_CODE/DOC/SCRIPT/CONFIG。 */
    private String category;

    /** 名称。 */
    private String name;

    /** 版本。 */
    private String itemVersion;

    /** 文件路径。 */
    private String filePath;

    /** 校验和。 */
    private String checksum;

    /** 交付时间。 */
    private LocalDateTime deliveredAt;

    /** 状态：PENDING/DELIVERED/ACCEPTED。 */
    private String status;

    /** 验收人。 */
    private String verifier;

    private String remark;
}
