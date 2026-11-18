package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsStocktakeDiffQuery;
import com.huaweicloud.plm.system.dto.WmsStocktakeDiffSaveRequest;
import com.huaweicloud.plm.system.entity.WmsStocktakeDiff;
import com.huaweicloud.plm.system.mapper.WmsStocktakeDiffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 盘点差异单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsStocktakeDiffService {

    private static final String DEFAULT_NO_PREFIX = "STD";
    private static final String DEFAULT_DIFF_TYPE = "PROFIT";
    private static final String DEFAULT_DIFF_STATUS = "PENDING";

    private final WmsStocktakeDiffMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsStocktakeDiff> page(WmsStocktakeDiffQuery query) {
        String keyword = query.getKeyword();
        Page<WmsStocktakeDiff> page = mapper.selectPage(query.toPage(), Wrappers.<WmsStocktakeDiff>lambdaQuery()
                .eq(StringUtils.hasText(query.getDiffStatus()), WmsStocktakeDiff::getDiffStatus, query.getDiffStatus())
                .eq(StringUtils.hasText(query.getDiffType()), WmsStocktakeDiff::getDiffType, query.getDiffType())
                .eq(StringUtils.hasText(query.getStocktakeNo()), WmsStocktakeDiff::getStocktakeNo, query.getStocktakeNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsStocktakeDiff::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsStocktakeDiff::getDiffNo, keyword).or()
                        .like(WmsStocktakeDiff::getStocktakeNo, keyword).or()
                        .like(WmsStocktakeDiff::getMaterialCode, keyword).or()
                        .like(WmsStocktakeDiff::getMaterialName, keyword))
                .orderByDesc(WmsStocktakeDiff::getId));
        return PageResult.of(page);
    }

    public WmsStocktakeDiff detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsStocktakeDiffSaveRequest request) {
        WmsStocktakeDiff entity;
        if (id == null) {
            entity = new WmsStocktakeDiff();
            entity.setDiffNo(StringUtils.hasText(request.getDiffNo())
                    ? request.getDiffNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setDiffType(StringUtils.hasText(request.getDiffType())
                    ? request.getDiffType() : DEFAULT_DIFF_TYPE);
            entity.setDiffStatus(StringUtils.hasText(request.getDiffStatus())
                    ? request.getDiffStatus() : DEFAULT_DIFF_STATUS);
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

    private WmsStocktakeDiff require(Long id) {
        WmsStocktakeDiff entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "盘点差异单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsStocktakeDiff entity, WmsStocktakeDiffSaveRequest request) {
        if (StringUtils.hasText(request.getDiffNo())) {
            entity.setDiffNo(request.getDiffNo());
        }
        if (StringUtils.hasText(request.getStocktakeNo())) {
            entity.setStocktakeNo(request.getStocktakeNo());
        }
        if (StringUtils.hasText(request.getDiffType())) {
            entity.setDiffType(request.getDiffType());
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
        if (request.getBookQty() != null) {
            entity.setBookQty(request.getBookQty());
        }
        if (request.getCountedQty() != null) {
            entity.setCountedQty(request.getCountedQty());
        }
        if (request.getDiffQty() != null) {
            entity.setDiffQty(request.getDiffQty());
        }
        if (StringUtils.hasText(request.getDiffReason())) {
            entity.setDiffReason(request.getDiffReason());
        }
        if (StringUtils.hasText(request.getDiffStatus())) {
            entity.setDiffStatus(request.getDiffStatus());
        }
        if (StringUtils.hasText(request.getApproveBy())) {
            entity.setApproveBy(request.getApproveBy());
        }
        if (request.getApproveTime() != null) {
            entity.setApproveTime(request.getApproveTime());
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
