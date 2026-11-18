package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPoChangeQuery;
import com.huaweicloud.plm.system.dto.SrmPoChangeSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPoChange;
import com.huaweicloud.plm.system.mapper.SrmPoChangeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 采购协同—变更确认（对应变更确认）：
 * 变更确认登记、分页查询与删除。
 * 变更编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPoChangeService {

    private static final String DEFAULT_CHANGE_NO_PREFIX = "PCH";
    private static final String DEFAULT_CHANGE_TYPE = "QTY";
    private static final String DEFAULT_CHANGE_STATUS = "PENDING";

    private final SrmPoChangeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询变更确认记录：变更类型/变更状态/供应商编码/采购订单号精确，变更编号/采购订单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmPoChange> page(SrmPoChangeQuery query) {
        Page<SrmPoChange> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPoChange>lambdaQuery()
                .eq(StringUtils.hasText(query.getChangeType()),
                        SrmPoChange::getChangeType, query.getChangeType())
                .eq(StringUtils.hasText(query.getChangeStatus()),
                        SrmPoChange::getChangeStatus, query.getChangeStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPoChange::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmPoChange::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPoChange::getChangeNo, query.getKeyword()).or()
                        .like(SrmPoChange::getPoNo, query.getKeyword()).or()
                        .like(SrmPoChange::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPoChange::getSupplierName, query.getKeyword()).or()
                        .like(SrmPoChange::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmPoChange::getId));
        return PageResult.of(page);
    }

    public SrmPoChange detail(Long id) {
        return require(id);
    }

    /** 新增或更新变更确认记录：新增时回填默认变更类型/变更状态与组织，变更编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPoChangeSaveRequest request) {
        SrmPoChange entity;
        if (id == null) {
            entity = new SrmPoChange();
            entity.setChangeNo(StringUtils.hasText(request.getChangeNo())
                    ? request.getChangeNo() : flowSupport.nextBizNo(DEFAULT_CHANGE_NO_PREFIX));
            entity.setChangeType(StringUtils.hasText(request.getChangeType())
                    ? request.getChangeType() : DEFAULT_CHANGE_TYPE);
            entity.setChangeStatus(StringUtils.hasText(request.getChangeStatus())
                    ? request.getChangeStatus() : DEFAULT_CHANGE_STATUS);
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

    /** 删除变更确认记录：物理删除以释放变更编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPoChange require(Long id) {
        SrmPoChange entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更确认单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPoChange entity, SrmPoChangeSaveRequest request) {
        if (StringUtils.hasText(request.getChangeNo())) {
            entity.setChangeNo(request.getChangeNo());
        }
        if (StringUtils.hasText(request.getPoNo())) {
            entity.setPoNo(request.getPoNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
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
        if (StringUtils.hasText(request.getChangeType())) {
            entity.setChangeType(request.getChangeType());
        }
        if (request.getBeforeQty() != null) {
            entity.setBeforeQty(request.getBeforeQty());
        }
        if (request.getAfterQty() != null) {
            entity.setAfterQty(request.getAfterQty());
        }
        if (request.getBeforeDate() != null) {
            entity.setBeforeDate(request.getBeforeDate());
        }
        if (request.getAfterDate() != null) {
            entity.setAfterDate(request.getAfterDate());
        }
        if (request.getBeforePrice() != null) {
            entity.setBeforePrice(request.getBeforePrice());
        }
        if (request.getAfterPrice() != null) {
            entity.setAfterPrice(request.getAfterPrice());
        }
        if (StringUtils.hasText(request.getChangeReason())) {
            entity.setChangeReason(request.getChangeReason());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyDate() != null) {
            entity.setApplyDate(request.getApplyDate());
        }
        if (StringUtils.hasText(request.getConfirmBy())) {
            entity.setConfirmBy(request.getConfirmBy());
        }
        if (request.getConfirmDate() != null) {
            entity.setConfirmDate(request.getConfirmDate());
        }
        if (StringUtils.hasText(request.getChangeStatus())) {
            entity.setChangeStatus(request.getChangeStatus());
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
