package com.huaweicloud.plm.system.dto;

import java.util.List;
import lombok.Data;

/**
 * 参与投票入参。
 */
@Data
public class VoteCastRequest {

    private List<Long> optionIds;
}
