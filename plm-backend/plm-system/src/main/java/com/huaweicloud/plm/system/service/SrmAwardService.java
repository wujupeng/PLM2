package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmAwardQuery;
import com.huaweicloud.plm.system.dto.SrmAwardSaveRequest;
import com.huaweicloud.plm.system.entity.SrmAward;
import com.huaweicloud.plm.system.mapper.SrmAwardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—定点定标（对应定点定标单）：
 * 定点定标单登记、分页查询与删除。
 * 定点单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmAwardService {

    private static final String DEFAULT_AWARD_NO_PREFIX = "AWD";
    private static final String DEFAULT_AWARD_TYPE = "SINGLE";
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final String DEFAULT_AWARD_STATUS = "DRAFT";

    private final SrmAwardMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询定点定标单：定点类型/状态/供应商编码/物料编码精确，定点单号/询价单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmAward> page(SrmAwardQuery query) {
        Page<SrmAward> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmAward>lambdaQuery()
                .eq(StringUtils.hasText(query.getAwardType()),
                        SrmAward::getAwardType, query.getAwardType())
                .eq(StringUtils.hasText(query.getAwardStatus()),
                        SrmAward::getAwardStatus, query.getAwardStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmAward::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        SrmAward::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmAward::getAwardNo, query.getKeyword()).or()
                        .like(SrmAward::getRfqNo, query.getKeyword()).or()
                        .like(SrmAward::getSupplierCode, query.getKeyword()).or()
                        .like(SrmAward::getSupplierName, query.getKeyword()).or()
                        .like(SrmAward::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmAward::getId));
        return PageResult.of(page);
    }

    public SrmAward detail(Long id) {
        return require(id);
    }

    /** 新增或更新定点定标单：新增时回填默认定点类型/币种/状态与组织，定点单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmAwardSaveRequest request) {
        SrmAward entity;
        if (id == null) {
            entity = new SrmAward();
            entity.setAwardNo(StringUtils.hasText(request.getAwardNo())
                    ? request.getAwardNo() : flowSupport.nextBizNo(DEFAULT_AWARD_NO_PREFIX));
            entity.setAwardType(StringUtils.hasText(request.getAwardType())
                    ? request.getAwardType() : DEFAULT_AWARD_TYPE);
            entity.setCurrency(StringUtils.hasText(request.getCurrency())
                    ? request.getCurrency() : DEFAULT_CURRENCY);
            entity.setAwardStatus(StringUtils.hasText(request.getAwardStatus())
                    ? request.getAwardStatus() : DEFAULT_AWARD_STATUS);
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

    /** 删除定点定标单：物理删除以释放定点单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmAward require(Long id) {
        SrmAward entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "定点定标单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmAward entity, SrmAwardSaveRequest request) {
        if (StringUtils.hasText(request.getAwardNo())) {
            entity.setAwardNo(request.getAwardNo());
        }
        if (StringUtils.hasText(request.getRfqNo())) {
            entity.setRfqNo(request.getRfqNo());
        }
        if (StringUtils.hasText(request.getCompareNo())) {
            entity.setCompareNo(request.getCompareNo());
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
        if (StringUtils.hasText(request.getAwardType())) {
            entity.setAwardType(request.getAwardType());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (request.getAwardQty() != null) {
            entity.setAwardQty(request.getAwardQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getAwardPrice() != null) {
            entity.setAwardPrice(request.getAwardPrice());
        }
        if (request.getAwardAmount() != null) {
            entity.setAwardAmount(request.getAwardAmount());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            entity.setCurrency(request.getCurrency());
        }
        if (request.getAwardDate() != null) {
            entity.setAwardDate(request.getAwardDate());
        }
        if (StringUtils.hasText(request.getAwardBy())) {
            entity.setAwardBy(request.getAwardBy());
        }
        if (StringUtils.hasText(request.getApprover())) {
            entity.setApprover(request.getApprover());
        }
        if (request.getApproveDate() != null) {
            entity.setApproveDate(request.getApproveDate());
        }
        if (StringUtils.hasText(request.getAwardStatus())) {
            entity.setAwardStatus(request.getAwardStatus());
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
