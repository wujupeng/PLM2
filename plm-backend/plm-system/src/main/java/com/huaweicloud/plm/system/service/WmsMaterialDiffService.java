package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsMaterialDiffQuery;
import com.huaweicloud.plm.system.dto.WmsMaterialDiffSaveRequest;
import com.huaweicloud.plm.system.entity.WmsMaterialDiff;
import com.huaweicloud.plm.system.mapper.WmsMaterialDiffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 退补料差异处理服务。
 */
@Service
@RequiredArgsConstructor
public class WmsMaterialDiffService {

    private static final String DEFAULT_NO_PREFIX = "DIF";
    private static final String DEFAULT_DIFF_TYPE = "QTY";
    private static final String DEFAULT_DIFF_STATUS = "PENDING";

    private final WmsMaterialDiffMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsMaterialDiff> page(WmsMaterialDiffQuery query) {
        String keyword = query.getKeyword();
        Page<WmsMaterialDiff> page = mapper.selectPage(query.toPage(), Wrappers.<WmsMaterialDiff>lambdaQuery()
                .eq(StringUtils.hasText(query.getDiffStatus()), WmsMaterialDiff::getDiffStatus, query.getDiffStatus())
                .eq(StringUtils.hasText(query.getDiffType()), WmsMaterialDiff::getDiffType, query.getDiffType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsMaterialDiff::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsMaterialDiff::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsMaterialDiff::getDiffNo, keyword).or()
                        .like(WmsMaterialDiff::getWorkOrderNo, keyword).or()
                        .like(WmsMaterialDiff::getMaterialCode, keyword).or()
                        .like(WmsMaterialDiff::getMaterialName, keyword))
                .orderByDesc(WmsMaterialDiff::getId));
        return PageResult.of(page);
    }

    public WmsMaterialDiff detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsMaterialDiffSaveRequest request) {
        WmsMaterialDiff entity;
        if (id == null) {
            entity = new WmsMaterialDiff();
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

    private WmsMaterialDiff require(Long id) {
        WmsMaterialDiff entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "差异处理单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsMaterialDiff entity, WmsMaterialDiffSaveRequest request) {
        if (StringUtils.hasText(request.getDiffNo())) {
            entity.setDiffNo(request.getDiffNo());
        }
        if (StringUtils.hasText(request.getDiffType())) {
            entity.setDiffType(request.getDiffType());
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
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getActualQty() != null) {
            entity.setActualQty(request.getActualQty());
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
