package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPoConfirmationQuery;
import com.huaweicloud.plm.system.dto.SrmPoConfirmationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPoConfirmation;
import com.huaweicloud.plm.system.mapper.SrmPoConfirmationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 采购协同—订单确认（对应订单确认）：
 * 订单确认登记、分页查询与删除。
 * 确认编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPoConfirmationService {

    private static final String DEFAULT_CONFIRM_NO_PREFIX = "POC";
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final String DEFAULT_CONFIRM_STATUS = "PENDING";

    private final SrmPoConfirmationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询订单确认记录：确认状态/供应商编码/采购订单号精确，确认编号/采购订单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmPoConfirmation> page(SrmPoConfirmationQuery query) {
        Page<SrmPoConfirmation> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPoConfirmation>lambdaQuery()
                .eq(StringUtils.hasText(query.getConfirmStatus()),
                        SrmPoConfirmation::getConfirmStatus, query.getConfirmStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPoConfirmation::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        SrmPoConfirmation::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPoConfirmation::getConfirmNo, query.getKeyword()).or()
                        .like(SrmPoConfirmation::getPoNo, query.getKeyword()).or()
                        .like(SrmPoConfirmation::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPoConfirmation::getSupplierName, query.getKeyword()).or()
                        .like(SrmPoConfirmation::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmPoConfirmation::getId));
        return PageResult.of(page);
    }

    public SrmPoConfirmation detail(Long id) {
        return require(id);
    }

    /** 新增或更新订单确认记录：新增时回填默认币种/确认状态与组织，确认编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPoConfirmationSaveRequest request) {
        SrmPoConfirmation entity;
        if (id == null) {
            entity = new SrmPoConfirmation();
            entity.setConfirmNo(StringUtils.hasText(request.getConfirmNo())
                    ? request.getConfirmNo() : flowSupport.nextBizNo(DEFAULT_CONFIRM_NO_PREFIX));
            entity.setCurrency(StringUtils.hasText(request.getCurrency())
                    ? request.getCurrency() : DEFAULT_CURRENCY);
            entity.setConfirmStatus(StringUtils.hasText(request.getConfirmStatus())
                    ? request.getConfirmStatus() : DEFAULT_CONFIRM_STATUS);
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

    /** 删除订单确认记录：物理删除以释放确认编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPoConfirmation require(Long id) {
        SrmPoConfirmation entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "订单确认单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPoConfirmation entity, SrmPoConfirmationSaveRequest request) {
        if (StringUtils.hasText(request.getConfirmNo())) {
            entity.setConfirmNo(request.getConfirmNo());
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
        if (request.getPoQty() != null) {
            entity.setPoQty(request.getPoQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getUnitPrice() != null) {
            entity.setUnitPrice(request.getUnitPrice());
        }
        if (request.getTotalAmount() != null) {
            entity.setTotalAmount(request.getTotalAmount());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            entity.setCurrency(request.getCurrency());
        }
        if (request.getPoDate() != null) {
            entity.setPoDate(request.getPoDate());
        }
        if (request.getRequireDate() != null) {
            entity.setRequireDate(request.getRequireDate());
        }
        if (StringUtils.hasText(request.getConfirmBy())) {
            entity.setConfirmBy(request.getConfirmBy());
        }
        if (request.getConfirmDate() != null) {
            entity.setConfirmDate(request.getConfirmDate());
        }
        if (StringUtils.hasText(request.getConfirmStatus())) {
            entity.setConfirmStatus(request.getConfirmStatus());
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
