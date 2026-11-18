package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 投票记录：投票人的投票明细。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_vote_record")
public class OaOaVoteRecord extends BaseEntity {

    private Long voteId;

    private Long optionId;

    private Long voterUserId;

    private String voterName;

    private LocalDateTime votedAt;
}
