package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProductionSuggestionQuery;
import com.huaweicloud.plm.system.dto.ErpProductionSuggestionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProductionSuggestion;
import com.huaweicloud.plm.system.mapper.ErpProductionSuggestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 需求计划—生产建议（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 生产建议登记、分页查询与删除。
 * 生产建议单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProductionSuggestionService {

    private static final String DEFAULT_SUGGESTION_NO_PREFIX = "EPR";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_SUGGESTION_STATUS = "OPEN";

    private final ErpProductionSuggestionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询生产建议：状态/物料编码/运算单号精确，生产建议单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpProductionSuggestion> page(ErpProductionSuggestionQuery query) {
        Page<ErpProductionSuggestion> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProductionSuggestion>lambdaQuery()
                .eq(StringUtils.hasText(query.getSuggestionStatus()),
                        ErpProductionSuggestion::getSuggestionStatus, query.getSuggestionStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpProductionSuggestion::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getRunNo()),
                        ErpProductionSuggestion::getRunNo, query.getRunNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProductionSuggestion::getSuggestionNo, query.getKeyword()).or()
                        .like(ErpProductionSuggestion::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpProductionSuggestion::getId));
        return PageResult.of(page);
    }

    public ErpProductionSuggestion detail(Long id) {
        return require(id);
    }

    /** 新增或更新生产建议：新增时回填默认单位/状态/数量与组织，生产建议单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProductionSuggestionSaveRequest request) {
        ErpProductionSuggestion entity;
        if (id == null) {
            entity = new ErpProductionSuggestion();
            entity.setSuggestionNo(StringUtils.hasText(request.getSuggestionNo())
                    ? request.getSuggestionNo() : flowSupport.nextBizNo(DEFAULT_SUGGESTION_NO_PREFIX));
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setSuggestionStatus(StringUtils.hasText(request.getSuggestionStatus())
                    ? request.getSuggestionStatus() : DEFAULT_SUGGESTION_STATUS);
            entity.setNetQty(request.getNetQty() != null
                    ? request.getNetQty() : BigDecimal.ZERO);
            entity.setSuggestQty(request.getSuggestQty() != null
                    ? request.getSuggestQty() : BigDecimal.ZERO);
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

    /** 删除生产建议：物理删除以释放生产建议单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProductionSuggestion require(Long id) {
        ErpProductionSuggestion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产建议不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProductionSuggestion entity, ErpProductionSuggestionSaveRequest request) {
        if (StringUtils.hasText(request.getSuggestionNo())) {
            entity.setSuggestionNo(request.getSuggestionNo());
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
        if (request.getNetQty() != null) {
            entity.setNetQty(request.getNetQty());
        }
        if (request.getSuggestQty() != null) {
            entity.setSuggestQty(request.getSuggestQty());
        }
        if (StringUtils.hasText(request.getBomVersion())) {
            entity.setBomVersion(request.getBomVersion());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getRequiredDate() != null) {
            entity.setRequiredDate(request.getRequiredDate());
        }
        if (StringUtils.hasText(request.getSuggestionStatus())) {
            entity.setSuggestionStatus(request.getSuggestionStatus());
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
