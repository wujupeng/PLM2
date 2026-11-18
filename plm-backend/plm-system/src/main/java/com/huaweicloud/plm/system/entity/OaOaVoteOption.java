package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 投票选项：投票调查的候选项及得票数。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_vote_option")
public class OaOaVoteOption extends BaseEntity {

    private Long voteId;

    private String optionText;

    private Integer voteCount;

    private Integer sortNo;

    private String remark;
}
