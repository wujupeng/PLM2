package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/**
 * 投票保存入参。
 */
@Data
public class VoteSaveRequest {

    private String title;

    private String description;

    private String voteType;

    private Integer anonymousFlag;

    private Integer maxChoice;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String voteStatus;

    private String publishScope;

    private String scopeValue;

    private List<String> options;

    private String remark;
}
