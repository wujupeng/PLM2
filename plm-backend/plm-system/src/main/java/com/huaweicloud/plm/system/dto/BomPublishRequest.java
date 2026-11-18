package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * BOM 发布请求（DEV-032 / IF-02）。
 */
@Data
public class BomPublishRequest {

    /** 目标系统列表，为空时取配置项 bom.publish.target_systems。 */
    private List<String> targetSystems;
}
