package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceCostCollectionQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceCostCollectionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceCostCollection;
import com.huaweicloud.plm.system.mapper.ErpFinanceCostCollectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—成本归集（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 成本归集登记、分页查询与删除。
 * 归集单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceCostCollectionService {

    private static final String DEFAULT_COLLECTION_NO_PREFIX = "FCC";
    private static final String DEFAULT_OBJECT_TYPE = "PRODUCT";
    private static final String DEFAULT_COST_ELEMENT = "MATERIAL";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_COLLECTION_STATUS = "DRAFT";

    private final ErpFinanceCostCollectionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询成本归集单：对象类型/成本要素/状态/期间精确，归集单号/对象编码/对象名称模糊，按主键倒序。 */
    public PageResult<ErpFinanceCostCollection> page(ErpFinanceCostCollectionQuery query) {
        Page<ErpFinanceCostCollection> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceCostCollection>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()),
                        ErpFinanceCostCollection::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getCostElement()),
                        ErpFinanceCostCollection::getCostElement, query.getCostElement())
                .eq(StringUtils.hasText(query.getCollectionStatus()),
                        ErpFinanceCostCollection::getCollectionStatus, query.getCollectionStatus())
                .eq(StringUtils.hasText(query.getPeriodCode()),
                        ErpFinanceCostCollection::getPeriodCode, query.getPeriodCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceCostCollection::getCollectionNo, query.getKeyword()).or()
                        .like(ErpFinanceCostCollection::getObjectCode, query.getKeyword()).or()
                        .like(ErpFinanceCostCollection::getObjectName, query.getKeyword()))
                .orderByDesc(ErpFinanceCostCollection::getId));
        return PageResult.of(page);
    }

    public ErpFinanceCostCollection detail(Long id) {
        return require(id);
    }

    /** 新增或更新成本归集单：新增时回填默认对象类型/成本要素/金额/币种与状态及组织，归集单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceCostCollectionSaveRequest request) {
        ErpFinanceCostCollection entity;
        if (id == null) {
            entity = new ErpFinanceCostCollection();
            entity.setCollectionNo(StringUtils.hasText(request.getCollectionNo())
                    ? request.getCollectionNo() : flowSupport.nextBizNo(DEFAULT_COLLECTION_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setCostElement(StringUtils.hasText(request.getCostElement())
                    ? request.getCostElement() : DEFAULT_COST_ELEMENT);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setCollectionStatus(StringUtils.hasText(request.getCollectionStatus())
                    ? request.getCollectionStatus() : DEFAULT_COLLECTION_STATUS);
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

    /** 删除成本归集单：物理删除以释放归集单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceCostCollection require(Long id) {
        ErpFinanceCostCollection entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "成本归集单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceCostCollection entity, ErpFinanceCostCollectionSaveRequest request) {
        if (StringUtils.hasText(request.getCollectionNo())) {
            entity.setCollectionNo(request.getCollectionNo());
        }
        if (StringUtils.hasText(request.getPeriodCode())) {
            entity.setPeriodCode(request.getPeriodCode());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getObjectCode())) {
            entity.setObjectCode(request.getObjectCode());
        }
        if (StringUtils.hasText(request.getObjectName())) {
            entity.setObjectName(request.getObjectName());
        }
        if (StringUtils.hasText(request.getCostElement())) {
            entity.setCostElement(request.getCostElement());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getCollectionDate() != null) {
            entity.setCollectionDate(request.getCollectionDate());
        }
        if (StringUtils.hasText(request.getCollectionStatus())) {
            entity.setCollectionStatus(request.getCollectionStatus());
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
