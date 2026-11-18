package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsZoneQuery;
import com.huaweicloud.plm.system.dto.WmsZoneSaveRequest;
import com.huaweicloud.plm.system.entity.WmsZone;
import com.huaweicloud.plm.system.mapper.WmsZoneMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 仓储基础—库区（对应库区）：
 * 库区登记、分页查询与删除。
 * 库区编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsZoneService {

    private static final String DEFAULT_ZONE_NO_PREFIX = "ZON";
    private static final String DEFAULT_ZONE_TYPE = "STORAGE";
    private static final String DEFAULT_TEMPERATURE_TYPE = "NORMAL";
    private static final String DEFAULT_ZONE_STATUS = "DRAFT";

    private final WmsZoneMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库区记录：库区类型/库区状态/仓库编码精确，库区编码/库区名称/仓库编码/仓库名称模糊，按主键倒序。 */
    public PageResult<WmsZone> page(WmsZoneQuery query) {
        Page<WmsZone> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsZone>lambdaQuery()
                .eq(StringUtils.hasText(query.getZoneType()),
                        WmsZone::getZoneType, query.getZoneType())
                .eq(StringUtils.hasText(query.getZoneStatus()),
                        WmsZone::getZoneStatus, query.getZoneStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        WmsZone::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsZone::getZoneCode, query.getKeyword()).or()
                        .like(WmsZone::getZoneName, query.getKeyword()).or()
                        .like(WmsZone::getWarehouseCode, query.getKeyword()).or()
                        .like(WmsZone::getWarehouseName, query.getKeyword()))
                .orderByDesc(WmsZone::getId));
        return PageResult.of(page);
    }

    public WmsZone detail(Long id) {
        return require(id);
    }

    /** 新增或更新库区记录：新增时回填默认库区类型、温层类型、库区状态与组织，库区编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsZoneSaveRequest request) {
        WmsZone entity;
        if (id == null) {
            entity = new WmsZone();
            entity.setZoneCode(StringUtils.hasText(request.getZoneCode())
                    ? request.getZoneCode() : flowSupport.nextBizNo(DEFAULT_ZONE_NO_PREFIX));
            entity.setZoneType(StringUtils.hasText(request.getZoneType())
                    ? request.getZoneType() : DEFAULT_ZONE_TYPE);
            entity.setTemperatureType(StringUtils.hasText(request.getTemperatureType())
                    ? request.getTemperatureType() : DEFAULT_TEMPERATURE_TYPE);
            entity.setZoneStatus(StringUtils.hasText(request.getZoneStatus())
                    ? request.getZoneStatus() : DEFAULT_ZONE_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除库区记录：物理删除以释放库区编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsZone require(Long id) {
        WmsZone entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库区不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsZone entity, WmsZoneSaveRequest request) {
        if (StringUtils.hasText(request.getZoneCode())) {
            entity.setZoneCode(request.getZoneCode());
        }
        if (StringUtils.hasText(request.getZoneName())) {
            entity.setZoneName(request.getZoneName());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            entity.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getZoneType())) {
            entity.setZoneType(request.getZoneType());
        }
        if (StringUtils.hasText(request.getTemperatureType())) {
            entity.setTemperatureType(request.getTemperatureType());
        }
        if (StringUtils.hasText(request.getZoneStatus())) {
            entity.setZoneStatus(request.getZoneStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
