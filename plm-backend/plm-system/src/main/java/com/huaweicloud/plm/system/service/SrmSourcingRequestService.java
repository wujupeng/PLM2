package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSourcingRequestQuery;
import com.huaweicloud.plm.system.dto.SrmSourcingRequestSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSourcingRequest;
import com.huaweicloud.plm.system.mapper.SrmSourcingRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—采购需求寻源（对应采购需求寻源）：
 * 寻源需求登记、分页查询与删除。
 * 寻源单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSourcingRequestService {

    private static final String DEFAULT_SOURCING_NO_PREFIX = "SRC";
    private static final String DEFAULT_SOURCING_TYPE = "RFQ";
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final String DEFAULT_SOURCING_STATUS = "DRAFT";

    private final SrmSourcingRequestMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询寻源需求：寻源方式/状态/物料编码精确，寻源单号/寻源标题/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<SrmSourcingRequest> page(SrmSourcingRequestQuery query) {
        Page<SrmSourcingRequest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSourcingRequest>lambdaQuery()
                .eq(StringUtils.hasText(query.getSourcingType()),
                        SrmSourcingRequest::getSourcingType, query.getSourcingType())
                .eq(StringUtils.hasText(query.getSourcingStatus()),
                        SrmSourcingRequest::getSourcingStatus, query.getSourcingStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        SrmSourcingRequest::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSourcingRequest::getSourcingNo, query.getKeyword()).or()
                        .like(SrmSourcingRequest::getSourcingTitle, query.getKeyword()).or()
                        .like(SrmSourcingRequest::getMaterialCode, query.getKeyword()).or()
                        .like(SrmSourcingRequest::getMaterialName, query.getKeyword()))
                .orderByDesc(SrmSourcingRequest::getId));
        return PageResult.of(page);
    }

    public SrmSourcingRequest detail(Long id) {
        return require(id);
    }

    /** 新增或更新寻源需求：新增时回填默认寻源方式/币种/状态与组织，寻源单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSourcingRequestSaveRequest request) {
        SrmSourcingRequest entity;
        if (id == null) {
            entity = new SrmSourcingRequest();
            entity.setSourcingNo(StringUtils.hasText(request.getSourcingNo())
                    ? request.getSourcingNo() : flowSupport.nextBizNo(DEFAULT_SOURCING_NO_PREFIX));
            entity.setSourcingType(StringUtils.hasText(request.getSourcingType())
                    ? request.getSourcingType() : DEFAULT_SOURCING_TYPE);
            entity.setCurrency(StringUtils.hasText(request.getCurrency())
                    ? request.getCurrency() : DEFAULT_CURRENCY);
            entity.setSourcingStatus(StringUtils.hasText(request.getSourcingStatus())
                    ? request.getSourcingStatus() : DEFAULT_SOURCING_STATUS);
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

    /** 删除寻源需求：物理删除以释放寻源单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSourcingRequest require(Long id) {
        SrmSourcingRequest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "寻源需求单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSourcingRequest entity, SrmSourcingRequestSaveRequest request) {
        if (StringUtils.hasText(request.getSourcingNo())) {
            entity.setSourcingNo(request.getSourcingNo());
        }
        if (StringUtils.hasText(request.getSourcingTitle())) {
            entity.setSourcingTitle(request.getSourcingTitle());
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
        if (request.getDemandQty() != null) {
            entity.setDemandQty(request.getDemandQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getDemandDate() != null) {
            entity.setDemandDate(request.getDemandDate());
        }
        if (StringUtils.hasText(request.getDemandDept())) {
            entity.setDemandDept(request.getDemandDept());
        }
        if (StringUtils.hasText(request.getApplicant())) {
            entity.setApplicant(request.getApplicant());
        }
        if (StringUtils.hasText(request.getSourcingType())) {
            entity.setSourcingType(request.getSourcingType());
        }
        if (request.getBudgetAmount() != null) {
            entity.setBudgetAmount(request.getBudgetAmount());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            entity.setCurrency(request.getCurrency());
        }
        if (StringUtils.hasText(request.getSourcingStatus())) {
            entity.setSourcingStatus(request.getSourcingStatus());
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
