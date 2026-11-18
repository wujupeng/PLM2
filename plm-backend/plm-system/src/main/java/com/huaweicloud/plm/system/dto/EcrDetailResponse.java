package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.EcoChangeOrder;
import com.huaweicloud.plm.system.entity.EcoChangeRequest;
import lombok.Data;

import java.util.List;

/**
 * 工程变更申请（ECR）详情：申请信息与由该申请转出的变更单列表。
 */
@Data
public class EcrDetailResponse {

    private EcoChangeRequest changeRequest;

    private List<EcoChangeOrder> orders;
}
