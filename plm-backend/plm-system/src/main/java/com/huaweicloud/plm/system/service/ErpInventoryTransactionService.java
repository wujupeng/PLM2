package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryTransactionQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryTransactionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryTransaction;
import com.huaweicloud.plm.system.mapper.ErpInventoryTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存流水（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 出入库明细登记、分页查询与删除。
 * 流水单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryTransactionService {

    private static final String DEFAULT_TRANSACTION_NO_PREFIX = "EIT";
    private static final String DEFAULT_TRANSACTION_TYPE = "IN";
    private static final String DEFAULT_BIZ_TYPE = "MANUAL";
    private static final String DEFAULT_DIRECTION = "IN";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_TRANSACTION_STATUS = "POSTED";

    private final ErpInventoryTransactionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存流水：交易类型/业务类型/交易状态精确，流水单号/物料编码/来源单据号模糊，按主键倒序。 */
    public PageResult<ErpInventoryTransaction> page(ErpInventoryTransactionQuery query) {
        Page<ErpInventoryTransaction> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryTransaction>lambdaQuery()
                .eq(StringUtils.hasText(query.getTransactionType()),
                        ErpInventoryTransaction::getTransactionType, query.getTransactionType())
                .eq(StringUtils.hasText(query.getBizType()),
                        ErpInventoryTransaction::getBizType, query.getBizType())
                .eq(StringUtils.hasText(query.getTransactionStatus()),
                        ErpInventoryTransaction::getTransactionStatus, query.getTransactionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryTransaction::getTransactionNo, query.getKeyword()).or()
                        .like(ErpInventoryTransaction::getMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryTransaction::getBizNo, query.getKeyword()))
                .orderByDesc(ErpInventoryTransaction::getId));
        return PageResult.of(page);
    }

    public ErpInventoryTransaction detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存流水：新增时回填默认类型/方向/单位/数量/状态与组织，流水单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryTransactionSaveRequest request) {
        ErpInventoryTransaction entity;
        if (id == null) {
            entity = new ErpInventoryTransaction();
            entity.setTransactionNo(StringUtils.hasText(request.getTransactionNo())
                    ? request.getTransactionNo() : flowSupport.nextBizNo(DEFAULT_TRANSACTION_NO_PREFIX));
            entity.setTransactionType(StringUtils.hasText(request.getTransactionType())
                    ? request.getTransactionType() : DEFAULT_TRANSACTION_TYPE);
            entity.setBizType(StringUtils.hasText(request.getBizType())
                    ? request.getBizType() : DEFAULT_BIZ_TYPE);
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setLocationCode(StringUtils.hasText(request.getLocationCode())
                    ? request.getLocationCode() : "");
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : "");
            entity.setQty(request.getQty() != null
                    ? request.getQty() : BigDecimal.ZERO);
            entity.setUnitCost(request.getUnitCost() != null
                    ? request.getUnitCost() : BigDecimal.ZERO);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setTransactionStatus(StringUtils.hasText(request.getTransactionStatus())
                    ? request.getTransactionStatus() : DEFAULT_TRANSACTION_STATUS);
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

    /** 删除库存流水：物理删除以释放流水单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpInventoryTransaction require(Long id) {
        ErpInventoryTransaction entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存流水不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryTransaction entity, ErpInventoryTransactionSaveRequest request) {
        if (StringUtils.hasText(request.getTransactionNo())) {
            entity.setTransactionNo(request.getTransactionNo());
        }
        if (StringUtils.hasText(request.getTransactionType())) {
            entity.setTransactionType(request.getTransactionType());
        }
        if (StringUtils.hasText(request.getBizType())) {
            entity.setBizType(request.getBizType());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
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
        if (StringUtils.hasText(request.getLocationCode())) {
            entity.setLocationCode(request.getLocationCode());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getQty() != null) {
            entity.setQty(request.getQty());
        }
        if (request.getUnitCost() != null) {
            entity.setUnitCost(request.getUnitCost());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getTransactionDate() != null) {
            entity.setTransactionDate(request.getTransactionDate());
        }
        if (StringUtils.hasText(request.getOperator())) {
            entity.setOperator(request.getOperator());
        }
        if (StringUtils.hasText(request.getTransactionStatus())) {
            entity.setTransactionStatus(request.getTransactionStatus());
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
