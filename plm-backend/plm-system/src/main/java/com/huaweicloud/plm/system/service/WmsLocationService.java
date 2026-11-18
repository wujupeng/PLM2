package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.WmsLocationQuery;
import com.huaweicloud.plm.system.dto.WmsLocationSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStorageLocation;
import com.huaweicloud.plm.system.mapper.WmsStorageLocationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 库位/货架主数据服务（N7，DEV-075）。
 */
@Service
@RequiredArgsConstructor
public class WmsLocationService {

    private static final String DEFAULT_LOCATION_TYPE = "RACK";
    private static final String STATUS_ENABLED = "enabled";

    private final WmsStorageLocationMapper wmsStorageLocationMapper;

    public PageResult<WmsStorageLocation> page(WmsLocationQuery query) {
        Page<WmsStorageLocation> page = query.toPage();
        wmsStorageLocationMapper.selectPage(page, Wrappers.<WmsStorageLocation>lambdaQuery()
                .eq(StringUtils.hasText(query.getLocationType()), WmsStorageLocation::getLocationType, query.getLocationType())
                .eq(StringUtils.hasText(query.getLineCode()), WmsStorageLocation::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWarehouseCode()), WmsStorageLocation::getWarehouseCode, query.getWarehouseCode())
                .eq(StringUtils.hasText(query.getStatus()), WmsStorageLocation::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsStorageLocation::getLocationCode, query.getKeyword()).or()
                        .like(WmsStorageLocation::getLocationName, query.getKeyword()))
                .orderByAsc(WmsStorageLocation::getLocationCode));
        return PageResult.of(page);
    }

    public List<WmsStorageLocation> options(String locationType) {
        return wmsStorageLocationMapper.selectList(Wrappers.<WmsStorageLocation>lambdaQuery()
                .eq(WmsStorageLocation::getStatus, STATUS_ENABLED)
                .eq(StringUtils.hasText(locationType), WmsStorageLocation::getLocationType, locationType)
                .orderByAsc(WmsStorageLocation::getLocationCode));
    }

    public WmsStorageLocation requireLocation(Long id) {
        WmsStorageLocation location = wmsStorageLocationMapper.selectById(id);
        if (location == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库位不存在: " + id);
        }
        return location;
    }

    public WmsStorageLocation requireByCode(String locationCode) {
        WmsStorageLocation location = wmsStorageLocationMapper.selectOne(Wrappers.<WmsStorageLocation>lambdaQuery()
                .eq(WmsStorageLocation::getLocationCode, locationCode));
        if (location == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库位不存在: " + locationCode);
        }
        return location;
    }

    public Long create(WmsLocationSaveRequest request) {
        ensureUnique(request.getLocationCode(), -1L);
        WmsStorageLocation location = new WmsStorageLocation();
        applyRequest(location, request);
        wmsStorageLocationMapper.insert(location);
        return location.getId();
    }

    public void update(Long id, WmsLocationSaveRequest request) {
        WmsStorageLocation location = requireLocation(id);
        ensureUnique(request.getLocationCode(), id);
        applyRequest(location, request);
        wmsStorageLocationMapper.updateById(location);
    }

    public void delete(Long id) {
        requireLocation(id);
        wmsStorageLocationMapper.deleteById(id);
    }

    private void applyRequest(WmsStorageLocation location, WmsLocationSaveRequest request) {
        location.setLocationCode(request.getLocationCode());
        location.setLocationName(request.getLocationName());
        location.setLocationType(StringUtils.hasText(request.getLocationType())
                ? request.getLocationType() : DEFAULT_LOCATION_TYPE);
        location.setWarehouseCode(request.getWarehouseCode());
        location.setAreaCode(request.getAreaCode());
        location.setRackCode(request.getRackCode());
        location.setLevelCode(request.getLevelCode());
        location.setBinCode(request.getBinCode());
        location.setLineCode(request.getLineCode());
        location.setCapacity(request.getCapacity());
        location.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus() : STATUS_ENABLED);
        location.setRemark(request.getRemark());
    }

    private void ensureUnique(String locationCode, Long excludeId) {
        long count = wmsStorageLocationMapper.selectCount(Wrappers.<WmsStorageLocation>lambdaQuery()
                .eq(WmsStorageLocation::getLocationCode, locationCode)
                .ne(excludeId != null && excludeId > 0, WmsStorageLocation::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "库位编码已存在: " + locationCode);
        }
    }
}
