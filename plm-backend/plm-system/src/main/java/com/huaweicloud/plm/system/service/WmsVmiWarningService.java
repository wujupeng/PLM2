package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsVmiWarningQuery;
import com.huaweicloud.plm.system.dto.WmsVmiWarningSaveRequest;
import com.huaweicloud.plm.system.entity.WmsVmiWarning;
import com.huaweicloud.plm.system.mapper.WmsVmiWarningMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * VMI 超容量预警服务（G5-N8）。
 */
@Service
@RequiredArgsConstructor
public class WmsVmiWarningService {

    private static final String DEFAULT_NO_PREFIX = "VWR";
    private static final String DEFAULT_WARNING_LEVEL = "MEDIUM";
    private static final String DEFAULT_WARNING_STATUS = "PENDING";

    private final WmsVmiWarningMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsVmiWarning> page(WmsVmiWarningQuery query) {
        String keyword = query.getKeyword();
        Page<WmsVmiWarning> page = mapper.selectPage(query.toPage(), Wrappers.<WmsVmiWarning>lambdaQuery()
                .eq(StringUtils.hasText(query.getWarningStatus()), WmsVmiWarning::getWarningStatus, query.getWarningStatus())
                .eq(StringUtils.hasText(query.getWarningLevel()), WmsVmiWarning::getWarningLevel, query.getWarningLevel())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsVmiWarning::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsVmiWarning::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsVmiWarning::getWarningNo, keyword).or()
                        .like(WmsVmiWarning::getWarehouseCode, keyword).or()
                        .like(WmsVmiWarning::getBinCode, keyword).or()
                        .like(WmsVmiWarning::getMaterialCode, keyword).or()
                        .like(WmsVmiWarning::getMaterialName, keyword))
                .orderByDesc(WmsVmiWarning::getId));
        return PageResult.of(page);
    }

    public WmsVmiWarning detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsVmiWarningSaveRequest request) {
        WmsVmiWarning entity;
        if (id == null) {
            entity = new WmsVmiWarning();
            entity.setWarningNo(StringUtils.hasText(request.getWarningNo())
                    ? request.getWarningNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setWarningLevel(StringUtils.hasText(request.getWarningLevel())
                    ? request.getWarningLevel() : DEFAULT_WARNING_LEVEL);
            entity.setWarningStatus(StringUtils.hasText(request.getWarningStatus())
                    ? request.getWarningStatus() : DEFAULT_WARNING_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private WmsVmiWarning require(Long id) {
        WmsVmiWarning entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "VMI预警单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsVmiWarning entity, WmsVmiWarningSaveRequest request) {
        if (StringUtils.hasText(request.getWarningNo())) {
            entity.setWarningNo(request.getWarningNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (request.getCapacityQty() != null) {
            entity.setCapacityQty(request.getCapacityQty());
        }
        if (request.getCurrentQty() != null) {
            entity.setCurrentQty(request.getCurrentQty());
        }
        if (request.getUsageRate() != null) {
            entity.setUsageRate(request.getUsageRate());
        }
        if (StringUtils.hasText(request.getWarningLevel())) {
            entity.setWarningLevel(request.getWarningLevel());
        }
        if (StringUtils.hasText(request.getWarningStatus())) {
            entity.setWarningStatus(request.getWarningStatus());
        }
        if (request.getWarningTime() != null) {
            entity.setWarningTime(request.getWarningTime());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
        }
        if (request.getHandleTime() != null) {
            entity.setHandleTime(request.getHandleTime());
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
