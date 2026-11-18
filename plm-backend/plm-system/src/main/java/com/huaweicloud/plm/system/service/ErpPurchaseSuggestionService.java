package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpPurchaseSuggestionQuery;
import com.huaweicloud.plm.system.dto.ErpPurchaseSuggestionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPurchaseSuggestion;
import com.huaweicloud.plm.system.mapper.ErpPurchaseSuggestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 需求计划—采购建议（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 采购建议登记、分页查询与删除。
 * 采购建议单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpPurchaseSuggestionService {

    private static final String DEFAULT_SUGGESTION_NO_PREFIX = "EPS";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_SUGGESTION_STATUS = "OPEN";

    private final ErpPurchaseSuggestionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询采购建议：状态/物料编码/运算单号精确，建议单号/物料名称/建议供应商模糊，按主键倒序。 */
    public PageResult<ErpPurchaseSuggestion> page(ErpPurchaseSuggestionQuery query) {
        Page<ErpPurchaseSuggestion> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpPurchaseSuggestion>lambdaQuery()
                .eq(StringUtils.hasText(query.getSuggestionStatus()),
                        ErpPurchaseSuggestion::getSuggestionStatus, query.getSuggestionStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpPurchaseSuggestion::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getRunNo()),
                        ErpPurchaseSuggestion::getRunNo, query.getRunNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpPurchaseSuggestion::getSuggestionNo, query.getKeyword()).or()
                        .like(ErpPurchaseSuggestion::getMaterialName, query.getKeyword()).or()
                        .like(ErpPurchaseSuggestion::getSuggestedSupplier, query.getKeyword()))
                .orderByDesc(ErpPurchaseSuggestion::getId));
        return PageResult.of(page);
    }

    public ErpPurchaseSuggestion detail(Long id) {
        return require(id);
    }

    /** 新增或更新采购建议：新增时回填默认单位/币别/状态/数量与组织，建议单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpPurchaseSuggestionSaveRequest request) {
        ErpPurchaseSuggestion entity;
        if (id == null) {
            entity = new ErpPurchaseSuggestion();
            entity.setSuggestionNo(StringUtils.hasText(request.getSuggestionNo())
                    ? request.getSuggestionNo() : flowSupport.nextBizNo(DEFAULT_SUGGESTION_NO_PREFIX));
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setSuggestionStatus(StringUtils.hasText(request.getSuggestionStatus())
                    ? request.getSuggestionStatus() : DEFAULT_SUGGESTION_STATUS);
            entity.setNetQty(request.getNetQty() != null
                    ? request.getNetQty() : BigDecimal.ZERO);
            entity.setSuggestQty(request.getSuggestQty() != null
                    ? request.getSuggestQty() : BigDecimal.ZERO);
            entity.setSuggestedPrice(request.getSuggestedPrice() != null
                    ? request.getSuggestedPrice() : BigDecimal.ZERO);
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

    /** 删除采购建议：物理删除以释放建议单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpPurchaseSuggestion require(Long id) {
        ErpPurchaseSuggestion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采购建议不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpPurchaseSuggestion entity, ErpPurchaseSuggestionSaveRequest request) {
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
        if (StringUtils.hasText(request.getSuggestedSupplier())) {
            entity.setSuggestedSupplier(request.getSuggestedSupplier());
        }
        if (request.getSuggestedPrice() != null) {
            entity.setSuggestedPrice(request.getSuggestedPrice());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
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
