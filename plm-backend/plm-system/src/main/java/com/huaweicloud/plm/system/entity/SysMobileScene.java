package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 移动场景（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 登记扫码作业场景（RECEIVE 收货/SHELVE 上架/STOCKTAKE 盘点/PICK 拣料/REPORT 报工/
 * LABEL_CHECK 标签校验），配置所属业务模块、是否支持离线与排序，由平台统一维护
 * 场景清单，各业务系统按场景编码接入。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mobile_scene")
public class SysMobileScene extends BaseEntity {

    /** 场景编号（唯一，支持人工指定）。 */
    private String sceneNo;

    /** 场景编码（唯一）。 */
    private String sceneCode;

    /** 场景名称。 */
    private String sceneName;

    /** 扫码类型：RECEIVE/SHELVE/STOCKTAKE/PICK/REPORT/LABEL_CHECK，默认 RECEIVE。 */
    private String scanType;

    /** 所属业务模块。 */
    private String bizModule;

    /** 是否支持离线：1 支持 / 0 不支持，默认 0。 */
    private Integer requireOffline;

    /** 排序号，默认 1。 */
    private Integer sortNo;

    /** 场景状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String sceneStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
