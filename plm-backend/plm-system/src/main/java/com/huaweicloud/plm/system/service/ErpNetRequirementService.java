package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpNetRequirementQuery;
import com.huaweicloud.plm.system.dto.ErpNetRequirementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpNetRequirement;
import com.huaweicloud.plm.system.mapper.ErpNetRequirementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 需求计划—净需求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 净需求登记、分页查询与删除。
 * 净需求单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpNetRequirementService {

    private static final String DEFAULT_REQUIREMENT_NO_PREFIX = "ENR";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_REQUIREMENT_STATUS = "OPEN";

    private final ErpNetRequirementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询净需求：状态/物料编码/运算单号精确，净需求单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpNetRequirement> page(ErpNetRequirementQuery query) {
        Page<ErpNetRequirement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpNetRequirement>lambdaQuery()
                .eq(StringUtils.hasText(query.getRequirementStatus()),
                        ErpNetRequirement::getRequirementStatus, query.getRequirementStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpNetRequirement::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getRunNo()),
                        ErpNetRequirement::getRunNo, query.getRunNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpNetRequirement::getRequirementNo, query.getKeyword()).or()
                        .like(ErpNetRequirement::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpNetRequirement::getId));
        return PageResult.of(page);
    }

    public ErpNetRequirement detail(Long id) {
        return require(id);
    }

    /** 新增或更新净需求：新增时回填默认单位/状态/数量与组织，净需求单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpNetRequirementSaveRequest request) {
        ErpNetRequirement entity;
        if (id == null) {
            entity = new ErpNetRequirement();
            entity.setRequirementNo(StringUtils.hasText(request.getRequirementNo())
                    ? request.getRequirementNo() : flowSupport.nextBizNo(DEFAULT_REQUIREMENT_NO_PREFIX));
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setRequirementStatus(StringUtils.hasText(request.getRequirementStatus())
                    ? request.getRequirementStatus() : DEFAULT_REQUIREMENT_STATUS);
            entity.setGrossQty(request.getGrossQty() != null
                    ? request.getGrossQty() : BigDecimal.ZERO);
            entity.setOnHandQty(request.getOnHandQty() != null
                    ? request.getOnHandQty() : BigDecimal.ZERO);
            entity.setInTransitQty(request.getInTransitQty() != null
                    ? request.getInTransitQty() : BigDecimal.ZERO);
            entity.setAllocatedQty(request.getAllocatedQty() != null
                    ? request.getAllocatedQty() : BigDecimal.ZERO);
            entity.setSafetyStock(request.getSafetyStock() != null
                    ? request.getSafetyStock() : BigDecimal.ZERO);
            entity.setNetQty(request.getNetQty() != null
                    ? request.getNetQty() : BigDecimal.ZERO);
            entity.setLossRate(request.getLossRate() != null
                    ? request.getLossRate() : BigDecimal.ZERO);
            entity.setLeadTimeDays(request.getLeadTimeDays() != null
                    ? request.getLeadTimeDays() : 0);
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

    /** 删除净需求：物理删除以释放净需求单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpNetRequirement require(Long id) {
        ErpNetRequirement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "净需求不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpNetRequirement entity, ErpNetRequirementSaveRequest request) {
        if (StringUtils.hasText(request.getRequirementNo())) {
            entity.setRequirementNo(request.getRequirementNo());
        }
        if (StringUtils.hasText(request.getRunNo())) {
            entity.setRunNo(request.getRunNo());
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
        if (request.getGrossQty() != null) {
            entity.setGrossQty(request.getGrossQty());
        }
        if (request.getOnHandQty() != null) {
            entity.setOnHandQty(request.getOnHandQty());
        }
        if (request.getInTransitQty() != null) {
            entity.setInTransitQty(request.getInTransitQty());
        }
        if (request.getAllocatedQty() != null) {
            entity.setAllocatedQty(request.getAllocatedQty());
        }
        if (request.getSafetyStock() != null) {
            entity.setSafetyStock(request.getSafetyStock());
        }
        if (request.getNetQty() != null) {
            entity.setNetQty(request.getNetQty());
        }
        if (request.getLossRate() != null) {
            entity.setLossRate(request.getLossRate());
        }
        if (request.getLeadTimeDays() != null) {
            entity.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getRequiredDate() != null) {
            entity.setRequiredDate(request.getRequiredDate());
        }
        if (StringUtils.hasText(request.getRequirementStatus())) {
            entity.setRequirementStatus(request.getRequirementStatus());
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
