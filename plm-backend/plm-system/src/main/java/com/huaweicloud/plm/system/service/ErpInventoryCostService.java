package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryCostQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryCostSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryCost;
import com.huaweicloud.plm.system.mapper.ErpInventoryCostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存成本核算单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存成本核算登记、分页查询与删除。
 * 成本核算单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryCostService {

    private static final String DEFAULT_COST_NO_PREFIX = "EST";
    private static final String DEFAULT_COST_METHOD = "MOVING_AVG";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_COST_STATUS = "DRAFT";

    private final ErpInventoryCostMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存成本核算单：方法/状态/期间/物料编码精确，核算单号/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryCost> page(ErpInventoryCostQuery query) {
        Page<ErpInventoryCost> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryCost>lambdaQuery()
                .eq(StringUtils.hasText(query.getCostMethod()),
                        ErpInventoryCost::getCostMethod, query.getCostMethod())
                .eq(StringUtils.hasText(query.getCostStatus()),
                        ErpInventoryCost::getCostStatus, query.getCostStatus())
                .eq(StringUtils.hasText(query.getPeriod()),
                        ErpInventoryCost::getPeriod, query.getPeriod())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpInventoryCost::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryCost::getCostNo, query.getKeyword()).or()
                        .like(ErpInventoryCost::getMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryCost::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpInventoryCost::getId));
        return PageResult.of(page);
    }

    public ErpInventoryCost detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存成本核算单：新增时回填默认状态/方法/单位/数量与组织，核算单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryCostSaveRequest request) {
        ErpInventoryCost entity;
        if (id == null) {
            entity = new ErpInventoryCost();
            entity.setCostNo(StringUtils.hasText(request.getCostNo())
                    ? request.getCostNo() : flowSupport.nextBizNo(DEFAULT_COST_NO_PREFIX));
            entity.setCostMethod(StringUtils.hasText(request.getCostMethod())
                    ? request.getCostMethod() : DEFAULT_COST_METHOD);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setBeginQty(request.getBeginQty() != null
                    ? request.getBeginQty() : BigDecimal.ZERO);
            entity.setBeginAmount(request.getBeginAmount() != null
                    ? request.getBeginAmount() : BigDecimal.ZERO);
            entity.setInQty(request.getInQty() != null
                    ? request.getInQty() : BigDecimal.ZERO);
            entity.setInAmount(request.getInAmount() != null
                    ? request.getInAmount() : BigDecimal.ZERO);
            entity.setOutQty(request.getOutQty() != null
                    ? request.getOutQty() : BigDecimal.ZERO);
            entity.setOutAmount(request.getOutAmount() != null
                    ? request.getOutAmount() : BigDecimal.ZERO);
            entity.setEndQty(request.getEndQty() != null
                    ? request.getEndQty() : BigDecimal.ZERO);
            entity.setEndAmount(request.getEndAmount() != null
                    ? request.getEndAmount() : BigDecimal.ZERO);
            entity.setAvgCost(request.getAvgCost() != null
                    ? request.getAvgCost() : BigDecimal.ZERO);
            entity.setCostStatus(StringUtils.hasText(request.getCostStatus())
                    ? request.getCostStatus() : DEFAULT_COST_STATUS);
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

    /** 删除库存成本核算单：物理删除以释放核算单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpInventoryCost require(Long id) {
        ErpInventoryCost entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存成本核算单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryCost entity, ErpInventoryCostSaveRequest request) {
        if (StringUtils.hasText(request.getCostNo())) {
            entity.setCostNo(request.getCostNo());
        }
        if (StringUtils.hasText(request.getCostMethod())) {
            entity.setCostMethod(request.getCostMethod());
        }
        if (StringUtils.hasText(request.getPeriod())) {
            entity.setPeriod(request.getPeriod());
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
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getBeginQty() != null) {
            entity.setBeginQty(request.getBeginQty());
        }
        if (request.getBeginAmount() != null) {
            entity.setBeginAmount(request.getBeginAmount());
        }
        if (request.getInQty() != null) {
            entity.setInQty(request.getInQty());
        }
        if (request.getInAmount() != null) {
            entity.setInAmount(request.getInAmount());
        }
        if (request.getOutQty() != null) {
            entity.setOutQty(request.getOutQty());
        }
        if (request.getOutAmount() != null) {
            entity.setOutAmount(request.getOutAmount());
        }
        if (request.getEndQty() != null) {
            entity.setEndQty(request.getEndQty());
        }
        if (request.getEndAmount() != null) {
            entity.setEndAmount(request.getEndAmount());
        }
        if (request.getAvgCost() != null) {
            entity.setAvgCost(request.getAvgCost());
        }
        if (StringUtils.hasText(request.getCostBy())) {
            entity.setCostBy(request.getCostBy());
        }
        if (request.getCostDate() != null) {
            entity.setCostDate(request.getCostDate());
        }
        if (StringUtils.hasText(request.getCostStatus())) {
            entity.setCostStatus(request.getCostStatus());
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
