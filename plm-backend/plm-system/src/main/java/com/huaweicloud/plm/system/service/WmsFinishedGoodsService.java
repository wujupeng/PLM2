package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsFinishedGoodsQuery;
import com.huaweicloud.plm.system.dto.WmsFinishedGoodsSaveRequest;
import com.huaweicloud.plm.system.entity.WmsFinishedGoods;
import com.huaweicloud.plm.system.mapper.WmsFinishedGoodsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 成品入库单服务。
 */
@Service
@RequiredArgsConstructor
public class WmsFinishedGoodsService {

    private static final String DEFAULT_NO_PREFIX = "FG";
    private static final String DEFAULT_FG_TYPE = "FINISHED";
    private static final String DEFAULT_FG_STATUS = "DRAFT";

    private final WmsFinishedGoodsMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<WmsFinishedGoods> page(WmsFinishedGoodsQuery query) {
        String keyword = query.getKeyword();
        Page<WmsFinishedGoods> page = mapper.selectPage(query.toPage(), Wrappers.<WmsFinishedGoods>lambdaQuery()
                .eq(StringUtils.hasText(query.getFgStatus()), WmsFinishedGoods::getFgStatus, query.getFgStatus())
                .eq(StringUtils.hasText(query.getFgType()), WmsFinishedGoods::getFgType, query.getFgType())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsFinishedGoods::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsFinishedGoods::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsFinishedGoods::getFgNo, keyword).or()
                        .like(WmsFinishedGoods::getWorkOrderNo, keyword).or()
                        .like(WmsFinishedGoods::getMaterialCode, keyword).or()
                        .like(WmsFinishedGoods::getMaterialName, keyword))
                .orderByDesc(WmsFinishedGoods::getId));
        return PageResult.of(page);
    }

    public WmsFinishedGoods detail(Long id) {
        return require(id);
    }

    public Long save(Long id, WmsFinishedGoodsSaveRequest request) {
        WmsFinishedGoods entity;
        if (id == null) {
            entity = new WmsFinishedGoods();
            entity.setFgNo(StringUtils.hasText(request.getFgNo())
                    ? request.getFgNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setFgType(StringUtils.hasText(request.getFgType())
                    ? request.getFgType() : DEFAULT_FG_TYPE);
            entity.setFgStatus(StringUtils.hasText(request.getFgStatus())
                    ? request.getFgStatus() : DEFAULT_FG_STATUS);
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

    private WmsFinishedGoods require(Long id) {
        WmsFinishedGoods entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "成品入库单不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(WmsFinishedGoods entity, WmsFinishedGoodsSaveRequest request) {
        if (StringUtils.hasText(request.getFgNo())) {
            entity.setFgNo(request.getFgNo());
        }
        if (StringUtils.hasText(request.getFgType())) {
            entity.setFgType(request.getFgType());
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
        if (request.getInboundQty() != null) {
            entity.setInboundQty(request.getInboundQty());
        }
        if (StringUtils.hasText(request.getPackageNo())) {
            entity.setPackageNo(request.getPackageNo());
        }
        if (StringUtils.hasText(request.getPackageType())) {
            entity.setPackageType(request.getPackageType());
        }
        if (StringUtils.hasText(request.getLabelNo())) {
            entity.setLabelNo(request.getLabelNo());
        }
        if (StringUtils.hasText(request.getFgStatus())) {
            entity.setFgStatus(request.getFgStatus());
        }
        if (StringUtils.hasText(request.getProduceBy())) {
            entity.setProduceBy(request.getProduceBy());
        }
        if (request.getProduceTime() != null) {
            entity.setProduceTime(request.getProduceTime());
        }
        if (StringUtils.hasText(request.getInboundBy())) {
            entity.setInboundBy(request.getInboundBy());
        }
        if (request.getInboundTime() != null) {
            entity.setInboundTime(request.getInboundTime());
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
