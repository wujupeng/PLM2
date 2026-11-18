package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryScrapQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryScrapSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryScrap;
import com.huaweicloud.plm.system.mapper.ErpInventoryScrapMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 库存核算—库存报废单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存报废登记、分页查询与删除。
 * 报废单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryScrapService {

    private static final String DEFAULT_SCRAP_NO_PREFIX = "ESC";
    private static final String DEFAULT_SCRAP_TYPE = "NORMAL";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_SCRAP_STATUS = "DRAFT";

    private final ErpInventoryScrapMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存报废单：类型/状态/仓库编码精确，报废单号/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryScrap> page(ErpInventoryScrapQuery query) {
        Page<ErpInventoryScrap> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryScrap>lambdaQuery()
                .eq(StringUtils.hasText(query.getScrapType()),
                        ErpInventoryScrap::getScrapType, query.getScrapType())
                .eq(StringUtils.hasText(query.getScrapStatus()),
                        ErpInventoryScrap::getScrapStatus, query.getScrapStatus())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        ErpInventoryScrap::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryScrap::getScrapNo, query.getKeyword()).or()
                        .like(ErpInventoryScrap::getMaterialCode, query.getKeyword()).or()
                        .like(ErpInventoryScrap::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpInventoryScrap::getId));
        return PageResult.of(page);
    }

    public ErpInventoryScrap detail(Long id) {
        return require(id);
    }

    /** 新增或更新库存报废单：新增时回填默认类型/单位/库位/批次/数量与状态及组织，报废单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpInventoryScrapSaveRequest request) {
        ErpInventoryScrap entity;
        if (id == null) {
            entity = new ErpInventoryScrap();
            entity.setScrapNo(StringUtils.hasText(request.getScrapNo())
                    ? request.getScrapNo() : flowSupport.nextBizNo(DEFAULT_SCRAP_NO_PREFIX));
            entity.setScrapType(StringUtils.hasText(request.getScrapType())
                    ? request.getScrapType() : DEFAULT_SCRAP_TYPE);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setLocationCode(StringUtils.hasText(request.getLocationCode())
                    ? request.getLocationCode() : "");
            entity.setBatchNo(StringUtils.hasText(request.getBatchNo())
                    ? request.getBatchNo() : "");
            entity.setScrapQty(request.getScrapQty() != null
                    ? request.getScrapQty() : BigDecimal.ZERO);
            entity.setScrapStatus(StringUtils.hasText(request.getScrapStatus())
                    ? request.getScrapStatus() : DEFAULT_SCRAP_STATUS);
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

    /** 删除库存报废单：物理删除以释放报废单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpInventoryScrap require(Long id) {
        ErpInventoryScrap entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存报废单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpInventoryScrap entity, ErpInventoryScrapSaveRequest request) {
        if (StringUtils.hasText(request.getScrapNo())) {
            entity.setScrapNo(request.getScrapNo());
        }
        if (StringUtils.hasText(request.getScrapType())) {
            entity.setScrapType(request.getScrapType());
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
        if (request.getLocationCode() != null) {
            entity.setLocationCode(request.getLocationCode());
        }
        if (request.getBatchNo() != null) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (request.getScrapQty() != null) {
            entity.setScrapQty(request.getScrapQty());
        }
        if (StringUtils.hasText(request.getScrapReason())) {
            entity.setScrapReason(request.getScrapReason());
        }
        if (StringUtils.hasText(request.getScrapBy())) {
            entity.setScrapBy(request.getScrapBy());
        }
        if (request.getScrapDate() != null) {
            entity.setScrapDate(request.getScrapDate());
        }
        if (StringUtils.hasText(request.getScrapStatus())) {
            entity.setScrapStatus(request.getScrapStatus());
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
