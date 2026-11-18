package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsKittingCheckQuery;
import com.huaweicloud.plm.system.dto.WmsKittingCheckSaveRequest;
import com.huaweicloud.plm.system.entity.WmsKittingCheck;
import com.huaweicloud.plm.system.mapper.WmsKittingCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 齐套检查服务。
 */
@Service
@RequiredArgsConstructor
public class WmsKittingCheckService {

    private static final String DEFAULT_NO_PREFIX = "KIT";
    private static final String DEFAULT_KIT_STATUS = "PENDING";

    private final WmsKittingCheckMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsKittingCheck> page(WmsKittingCheckQuery query) {
        String keyword = query.getKeyword();
        Page<WmsKittingCheck> page = mapper.selectPage(query.toPage(), Wrappers.<WmsKittingCheck>lambdaQuery()
                .eq(StringUtils.hasText(query.getKitStatus()), WmsKittingCheck::getKitStatus, query.getKitStatus())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsKittingCheck::getWorkOrderNo, query.getWorkOrderNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsKittingCheck::getCheckNo, keyword).or()
                        .like(WmsKittingCheck::getWorkOrderNo, keyword).or()
                        .like(WmsKittingCheck::getProductCode, keyword).or()
                        .like(WmsKittingCheck::getProductName, keyword))
                .orderByDesc(WmsKittingCheck::getId));
        return PageResult.of(page);
    }

    public WmsKittingCheck detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsKittingCheckSaveRequest request) {
        WmsKittingCheck entity;
        if (id == null) {
            entity = new WmsKittingCheck();
            entity.setCheckNo(StringUtils.hasText(request.getCheckNo())
                    ? request.getCheckNo() : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setKitStatus(StringUtils.hasText(request.getKitStatus())
                    ? request.getKitStatus() : DEFAULT_KIT_STATUS);
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

    private WmsKittingCheck require(Long id) {
        WmsKittingCheck entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "齐套检查单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsKittingCheck entity, WmsKittingCheckSaveRequest request) {
        if (StringUtils.hasText(request.getCheckNo())) {
            entity.setCheckNo(request.getCheckNo());
        }
        if (StringUtils.hasText(request.getWorkOrderNo())) {
            entity.setWorkOrderNo(request.getWorkOrderNo());
        }
        if (StringUtils.hasText(request.getProductCode())) {
            entity.setProductCode(request.getProductCode());
        }
        if (StringUtils.hasText(request.getProductName())) {
            entity.setProductName(request.getProductName());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getTotalItems() != null) {
            entity.setTotalItems(request.getTotalItems());
        }
        if (request.getKitItems() != null) {
            entity.setKitItems(request.getKitItems());
        }
        if (request.getShortItems() != null) {
            entity.setShortItems(request.getShortItems());
        }
        if (request.getShortQty() != null) {
            entity.setShortQty(request.getShortQty());
        }
        if (StringUtils.hasText(request.getKitStatus())) {
            entity.setKitStatus(request.getKitStatus());
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
