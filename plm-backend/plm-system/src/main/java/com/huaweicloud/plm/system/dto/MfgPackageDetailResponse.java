package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgPackageItem;
import lombok.Data;

import java.util.List;

/**
 * 包装箱详情响应（N8，DEV-089）。
 */
@Data
public class MfgPackageDetailResponse {

    private MfgPackage pkg;

    private List<MfgPackageItem> items;
}
