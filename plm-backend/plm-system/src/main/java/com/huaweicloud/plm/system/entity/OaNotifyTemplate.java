package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通知模板：标题与正文模板、渠道与变量清单均可配置，发送失败可按模板追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_notify_template")
public class OaNotifyTemplate extends BaseEntity {

    private String templateCode;

    private String templateName;

    private String messageType;

    private String channel;

    /** 标题模板，支持 ${变量名} 占位符。 */
    private String titleTemplate;

    /** 正文模板，支持 ${变量名} 占位符。 */
    private String contentTemplate;

    /** 变量清单 JSON 数组，便于界面提示与校验。 */
    private String variableJson;

    private String status;

    private String remark;
}
