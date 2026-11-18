package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPriceAgreementQuery;
import com.huaweicloud.plm.system.dto.SrmPriceAgreementSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPriceAgreement;
import com.huaweicloud.plm.system.mapper.SrmPriceAgreementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—定点定价协议（对应定点定价协议）：
 * 协议登记、分页查询与删除。
 * 协议编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPriceAgreementService {

    private static final String DEFAULT_AGREEMENT_NO_PREFIX = "PRA";
    private static final String DEFAULT_PRICE_TYPE = "AGREEMENT";
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final String DEFAULT_AGREEMENT_STATUS = "DRAFT";

    private final SrmPriceAgreementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询协议记录：价格类型/协议状态/供应商编码/物料编码精确，协议编号/供应商编码/供应商名称/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<SrmPriceAgreement> page(SrmPriceAgreementQuery query) {
        Page<SrmPriceAgreement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPriceAgreement>lambdaQuery()
                .eq(StringUtils.hasText(query.getPriceType()),
                        SrmPriceAgreement::getPriceType, query.getPriceType())
                .eq(StringUtils.hasText(query.getAgreementStatus()),
                        SrmPriceAgreement::getAgreementStatus, query.getAgreementStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPriceAgreement::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        SrmPriceAgreement::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPriceAgreement::getAgreementNo, query.getKeyword()).or()
                        .like(SrmPriceAgreement::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPriceAgreement::getSupplierName, query.getKeyword()).or()
                        .like(SrmPriceAgreement::getMaterialCode, query.getKeyword()).or()
                        .like(SrmPriceAgreement::getMaterialName, query.getKeyword()))
                .orderByDesc(SrmPriceAgreement::getId));
        return PageResult.of(page);
    }

    public SrmPriceAgreement detail(Long id) {
        return require(id);
    }

    /** 新增或更新协议记录：新增时回填默认价格类型/币种/协议状态与组织，协议编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPriceAgreementSaveRequest request) {
        SrmPriceAgreement entity;
        if (id == null) {
            entity = new SrmPriceAgreement();
            entity.setAgreementNo(StringUtils.hasText(request.getAgreementNo())
                    ? request.getAgreementNo() : flowSupport.nextBizNo(DEFAULT_AGREEMENT_NO_PREFIX));
            entity.setPriceType(StringUtils.hasText(request.getPriceType())
                    ? request.getPriceType() : DEFAULT_PRICE_TYPE);
            entity.setCurrency(StringUtils.hasText(request.getCurrency())
                    ? request.getCurrency() : DEFAULT_CURRENCY);
            entity.setAgreementStatus(StringUtils.hasText(request.getAgreementStatus())
                    ? request.getAgreementStatus() : DEFAULT_AGREEMENT_STATUS);
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

    /** 删除协议记录：物理删除以释放协议编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPriceAgreement require(Long id) {
        SrmPriceAgreement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "定点定价协议不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPriceAgreement entity, SrmPriceAgreementSaveRequest request) {
        if (StringUtils.hasText(request.getAgreementNo())) {
            entity.setAgreementNo(request.getAgreementNo());
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
        if (StringUtils.hasText(request.getPriceType())) {
            entity.setPriceType(request.getPriceType());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getUnitPrice() != null) {
            entity.setUnitPrice(request.getUnitPrice());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            entity.setCurrency(request.getCurrency());
        }
        if (request.getTaxRate() != null) {
            entity.setTaxRate(request.getTaxRate());
        }
        if (request.getMoq() != null) {
            entity.setMoq(request.getMoq());
        }
        if (request.getLeadTimeDays() != null) {
            entity.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getAgreementStatus())) {
            entity.setAgreementStatus(request.getAgreementStatus());
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
