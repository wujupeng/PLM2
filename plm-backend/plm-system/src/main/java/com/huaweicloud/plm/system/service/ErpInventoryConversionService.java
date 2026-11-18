package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryConversionQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryConversionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryConversion;
import com.huaweicloud.plm.system.mapper.ErpInventoryConversionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—形态转换单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 形态转换登记、分页查询与删除。
 * 转换单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryConversionService {

    private static final String DEFAULT_CONVERSION_NO_PREFIX = "ECV";
    private static final String DEFAULT_CONVERSION_TYPE = "SPLIT";
    private static final String DEFAULT_SOURCE_UOM = "PCS";
    private static final String DEFAULT_TARGET_UOM = "PCS";
    private static final String DEFAULT_CONVERSION_STATUS = "DRAFT";

    private final ErpInventoryConversionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询形态转换单：类型/状态/仓库编码精确，转换单号/源物料编码/目标物料编码模糊，按主键倒序。 */
    public PageResult<ErpInventoryConversion> page(ErpInventoryConversionQuery query) {
        Page<ErpInventoryConversion> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryConversion>lambdaQuery()
                .eq(StringUtils.hasText(query.getConversionType()),
                        ErpInventoryConversion::getConversionType, query.getConversionType())
                .eq(StringUtils.hasText(query.getConversionStatus()),
                        ErpInventoryConversion::getConversionStatus, query.getConversionStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        ErpInventoryConversion::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryConversion::getConversionNo, query.getKeyword()).or()
                        .like(ErpInventoryConversion::getSourceMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryConversion::getTargetMaterialCode, query.getKeyword()))
                .orderByDesc(ErpInventoryConversion::getId));
        return PageResult.of(page);
    }

    public ErpInventoryConversion detail(Long id) {
        return require(id);
    }

    /** 新增或更新形态转换单：新增时回填默认类型/单位/数量/批次与状态及组织，转换单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryConversionSaveRequest request) {
        ErpInventoryConversion entity;
        if (id == null) {
            entity = new ErpInventoryConversion();
            entity.setConversionNo(StringUtils.hasText(request.getConversionNo())
                    ? request.getConversionNo() : flowSupport.nextBizNo(DEFAULT_CONVERSION_NO_PREFIX));
            entity.setConversionType(StringUtils.hasText(request.getConversionType())
                    ? request.getConversionType() : DEFAULT_CONVERSION_TYPE);
            entity.setSourceUom(StringUtils.hasText(request.getSourceUom())
                    ? request.getSourceUom() : DEFAULT_SOURCE_UOM);
            entity.setTargetUom(StringUtils.hasText(request.getTargetUom())
                    ? request.getTargetUom() : DEFAULT_TARGET_UOM);
            entity.setSourceQty(request.getSourceQty() != null
                    ? request.getSourceQty() : BigDecimal.ZERO);
            entity.setTargetQty(request.getTargetQty() != null
                    ? request.getTargetQty() : BigDecimal.ZERO);
            entity.setSourceBatchNo(StringUtils.hasText(request.getSourceBatchNo())
                    ? request.getSourceBatchNo() : "");
            entity.setConversionStatus(StringUtils.hasText(request.getConversionStatus())
                    ? request.getConversionStatus() : DEFAULT_CONVERSION_STATUS);
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

    /** 删除形态转换单：物理删除以释放转换单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpInventoryConversion require(Long id) {
        ErpInventoryConversion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "形态转换单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryConversion entity, ErpInventoryConversionSaveRequest request) {
        if (StringUtils.hasText(request.getConversionNo())) {
            entity.setConversionNo(request.getConversionNo());
        }
        if (StringUtils.hasText(request.getConversionType())) {
            entity.setConversionType(request.getConversionType());
        }
        if (StringUtils.hasText(request.getSourceMaterialCode())) {
            entity.setSourceMaterialCode(request.getSourceMaterialCode());
        }
        if (StringUtils.hasText(request.getSourceMaterialName())) {
            entity.setSourceMaterialName(request.getSourceMaterialName());
        }
        if (StringUtils.hasText(request.getSourceSpec())) {
            entity.setSourceSpec(request.getSourceSpec());
        }
        if (StringUtils.hasText(request.getSourceUom())) {
            entity.setSourceUom(request.getSourceUom());
        }
        if (request.getSourceQty() != null) {
            entity.setSourceQty(request.getSourceQty());
        }
        if (request.getSourceBatchNo() != null) {
            entity.setSourceBatchNo(request.getSourceBatchNo());
        }
        if (StringUtils.hasText(request.getTargetMaterialCode())) {
            entity.setTargetMaterialCode(request.getTargetMaterialCode());
        }
        if (StringUtils.hasText(request.getTargetMaterialName())) {
            entity.setTargetMaterialName(request.getTargetMaterialName());
        }
        if (StringUtils.hasText(request.getTargetSpec())) {
            entity.setTargetSpec(request.getTargetSpec());
        }
        if (StringUtils.hasText(request.getTargetUom())) {
            entity.setTargetUom(request.getTargetUom());
        }
        if (request.getTargetQty() != null) {
            entity.setTargetQty(request.getTargetQty());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getConversionBy())) {
            entity.setConversionBy(request.getConversionBy());
        }
        if (request.getConversionDate() != null) {
            entity.setConversionDate(request.getConversionDate());
        }
        if (StringUtils.hasText(request.getConversionStatus())) {
            entity.setConversionStatus(request.getConversionStatus());
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
