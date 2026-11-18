package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsInventoryBatchQuery;
import com.huaweicloud.plm.system.dto.WmsInventoryBatchSaveRequest;
import com.huaweicloud.plm.system.entity.WmsInventoryBatch;
import com.huaweicloud.plm.system.mapper.WmsInventoryBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 库存控制—库存批次（对应库存批次）：
 * 库存批次登记、分页查询与删除。
 * 库存批次号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsInventoryBatchService {

    private static final String DEFAULT_NO_PREFIX = "INV";
    private static final String DEFAULT_BATCH_SOURCE = "PURCHASE";
    private static final String DEFAULT_BATCH_STATUS = "NORMAL";

    private final WmsInventoryBatchMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存批次记录：批次状态/物料编码/库存批次号/仓库编码精确，库存批次号/物料编码/物料名称/库位编码模糊，按主键倒序。 */
    public PageResult<WmsInventoryBatch> page(WmsInventoryBatchQuery query) {
        String keyword = query.getKeyword();
        Page<WmsInventoryBatch> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsInventoryBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getBatchStatus()),
                        WmsInventoryBatch::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        WmsInventoryBatch::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()),
                        WmsInventoryBatch::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        WmsInventoryBatch::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(WmsInventoryBatch::getBatchNo, keyword).or()
                        .like(WmsInventoryBatch::getMaterialCode, keyword).or()
                        .like(WmsInventoryBatch::getMaterialName, keyword).or()
                        .like(WmsInventoryBatch::getBinCode, keyword))
                .orderByDesc(WmsInventoryBatch::getId));
        return PageResult.of(page);
    }

    public WmsInventoryBatch detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存批次记录：新增时回填默认批次来源、批次状态与组织，库存批次号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsInventoryBatchSaveRequest request) {
        WmsInventoryBatch entity;
        if (id == null) {
            entity = new WmsInventoryBatch();
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setBatchSource(StringUtils.hasText(request.getBatchSource())
                    ? request.getBatchSource() : DEFAULT_BATCH_SOURCE);
            entity.setBatchStatus(StringUtils.hasText(request.getBatchStatus())
                    ? request.getBatchStatus() : DEFAULT_BATCH_STATUS);
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

    /** 删除库存批次记录：物理删除以释放库存批次号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsInventoryBatch require(Long id) {
        WmsInventoryBatch entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存批次不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空、数量非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsInventoryBatch entity, WmsInventoryBatchSaveRequest request) {
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
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
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getZoneCode())) {
            entity.setZoneCode(request.getZoneCode());
        }
        if (StringUtils.hasText(request.getBinCode())) {
            entity.setBinCode(request.getBinCode());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getBatchSource())) {
            entity.setBatchSource(request.getBatchSource());
        }
        if (request.getProductionDate() != null) {
            entity.setProductionDate(request.getProductionDate());
        }
        if (request.getExpiryDate() != null) {
            entity.setExpiryDate(request.getExpiryDate());
        }
        if (request.getInboundDate() != null) {
            entity.setInboundDate(request.getInboundDate());
        }
        if (request.getQty() != null) {
            entity.setQty(request.getQty());
        }
        if (request.getAvailableQty() != null) {
            entity.setAvailableQty(request.getAvailableQty());
        }
        if (request.getFrozenQty() != null) {
            entity.setFrozenQty(request.getFrozenQty());
        }
        if (StringUtils.hasText(request.getBatchStatus())) {
            entity.setBatchStatus(request.getBatchStatus());
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
