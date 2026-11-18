package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsOutboundWaveQuery;
import com.huaweicloud.plm.system.dto.WmsOutboundWaveSaveRequest;
import com.huaweicloud.plm.system.entity.WmsOutboundWave;
import com.huaweicloud.plm.system.mapper.WmsOutboundWaveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 出库波次单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsOutboundWaveService {

    private static final String DEFAULT_NO_PREFIX = "WAV";
    private static final String DEFAULT_WAVE_TYPE = "WAVE";
    private static final String DEFAULT_WAVE_STATUS = "DRAFT";

    private final WmsOutboundWaveMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsOutboundWave> page(WmsOutboundWaveQuery query) {
        String keyword = query.getKeyword();
        Page<WmsOutboundWave> page = mapper.selectPage(query.toPage(), Wrappers.<WmsOutboundWave>lambdaQuery()
                .eq(StringUtils.hasText(query.getWaveStatus()), WmsOutboundWave::getWaveStatus, query.getWaveStatus())
                .eq(StringUtils.hasText(query.getWaveType()), WmsOutboundWave::getWaveType, query.getWaveType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsOutboundWave::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsOutboundWave::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsOutboundWave::getWaveNo, keyword).or()
                        .like(WmsOutboundWave::getWorkOrderNo, keyword).or()
                        .like(WmsOutboundWave::getMaterialCode, keyword).or()
                        .like(WmsOutboundWave::getMaterialName, keyword))
                .orderByDesc(WmsOutboundWave::getId));
        return PageResult.of(page);
    }

    public WmsOutboundWave detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsOutboundWaveSaveRequest request) {
        WmsOutboundWave entity;
        if (id == null) {
            entity = new WmsOutboundWave();
            entity.setWaveNo(StringUtils.hasText(request.getWaveNo())
                    ? request.getWaveNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setWaveType(StringUtils.hasText(request.getWaveType())
                    ? request.getWaveType() : DEFAULT_WAVE_TYPE);
            entity.setWaveStatus(StringUtils.hasText(request.getWaveStatus())
                    ? request.getWaveStatus() : DEFAULT_WAVE_STATUS);
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

    private WmsOutboundWave require(Long id) {
        WmsOutboundWave entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "出库波次单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsOutboundWave entity, WmsOutboundWaveSaveRequest request) {
        if (StringUtils.hasText(request.getWaveNo())) {
            entity.setWaveNo(request.getWaveNo());
        }
        if (StringUtils.hasText(request.getWaveType())) {
            entity.setWaveType(request.getWaveType());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
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
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getPickedQty() != null) {
            entity.setPickedQty(request.getPickedQty());
        }
        if (request.getCheckedQty() != null) {
            entity.setCheckedQty(request.getCheckedQty());
        }
        if (StringUtils.hasText(request.getWaveStatus())) {
            entity.setWaveStatus(request.getWaveStatus());
        }
        if (StringUtils.hasText(request.getPickBy())) {
            entity.setPickBy(request.getPickBy());
        }
        if (request.getPickTime() != null) {
            entity.setPickTime(request.getPickTime());
        }
        if (StringUtils.hasText(request.getCheckBy())) {
            entity.setCheckBy(request.getCheckBy());
        }
        if (request.getCheckTime() != null) {
            entity.setCheckTime(request.getCheckTime());
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
