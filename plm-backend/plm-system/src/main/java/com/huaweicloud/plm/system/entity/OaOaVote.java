package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 投票调查：投票/问卷主表。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_vote")
public class OaOaVote extends BaseEntity {

    private String voteNo;

    private String title;

    private String description;

    /** 投票类型：SINGLE/MULTI。 */
    private String voteType;

    private Integer anonymousFlag;

    private Integer maxChoice;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    /** 投票状态：DRAFT/PUBLISHED/CLOSED。 */
    private String voteStatus;

    /** 发布范围：ALL/DEPARTMENT/USER。 */
    private String publishScope;

    private String scopeValue;

    private Long creatorUserId;

    private String creatorName;

    private String remark;
}
