package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryFreezeQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryFreezeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryFreeze;
import com.huaweicloud.plm.system.mapper.ErpInventoryFreezeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存冻结单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存冻结登记、分页查询与删除。
 * 冻结单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryFreezeService {

    private static final String DEFAULT_FREEZE_NO_PREFIX = "EFZ";
    private static final String DEFAULT_FREEZE_TYPE = "MANUAL";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_FREEZE_STATUS = "FROZEN";

    private final ErpInventoryFreezeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存冻结单：类型/状态/仓库编码精确，冻结单号/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryFreeze> page(ErpInventoryFreezeQuery query) {
        Page<ErpInventoryFreeze> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryFreeze>lambdaQuery()
                .eq(StringUtils.hasText(query.getFreezeType()),
                        ErpInventoryFreeze::getFreezeType, query.getFreezeType())
                .eq(StringUtils.hasText(query.getFreezeStatus()),
                        ErpInventoryFreeze::getFreezeStatus, query.getFreezeStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        ErpInventoryFreeze::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryFreeze::getFreezeNo, query.getKeyword()).or()
                        .like(ErpInventoryFreeze::getMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryFreeze::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpInventoryFreeze::getId));
        return PageResult.of(page);
    }

    public ErpInventoryFreeze detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存冻结单：新增时回填默认状态/类型/单位/数量与组织，冻结单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryFreezeSaveRequest request) {
        ErpInventoryFreeze entity;
        if (id == null) {
            entity = new ErpInventoryFreeze();
            entity.setFreezeNo(StringUtils.hasText(request.getFreezeNo())
                    ? request.getFreezeNo() : flowSupport.nextBizNo(DEFAULT_FREEZE_NO_PREFIX));
            entity.setFreezeType(StringUtils.hasText(request.getFreezeType())
                    ? request.getFreezeType() : DEFAULT_FREEZE_TYPE);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setLocationCode(StringUtils.hasText(request.getLocationCode())
                    ? request.getLocationCode() : "");
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : "");
            entity.setFreezeQty(request.getFreezeQty() != null
                    ? request.getFreezeQty() : BigDecimal.ZERO);
            entity.setFreezeStatus(StringUtils.hasText(request.getFreezeStatus())
                    ? request.getFreezeStatus() : DEFAULT_FREEZE_STATUS);
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

    /** 删除库存冻结单：物理删除以释放冻结单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpInventoryFreeze require(Long id) {
        ErpInventoryFreeze entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存冻结单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryFreeze entity, ErpInventoryFreezeSaveRequest request) {
        if (StringUtils.hasText(request.getFreezeNo())) {
            entity.setFreezeNo(request.getFreezeNo());
        }
        if (StringUtils.hasText(request.getFreezeType())) {
            entity.setFreezeType(request.getFreezeType());
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
        if (request.getFreezeQty() != null) {
            entity.setFreezeQty(request.getFreezeQty());
        }
        if (StringUtils.hasText(request.getFreezeReason())) {
            entity.setFreezeReason(request.getFreezeReason());
        }
        if (StringUtils.hasText(request.getFreezeBy())) {
            entity.setFreezeBy(request.getFreezeBy());
        }
        if (request.getFreezeDate() != null) {
            entity.setFreezeDate(request.getFreezeDate());
        }
        if (request.getUnfreezeDate() != null) {
            entity.setUnfreezeDate(request.getUnfreezeDate());
        }
        if (StringUtils.hasText(request.getFreezeStatus())) {
            entity.setFreezeStatus(request.getFreezeStatus());
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
