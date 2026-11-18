package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPriceCompareQuery;
import com.huaweicloud.plm.system.dto.SrmPriceCompareSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPriceCompare;
import com.huaweicloud.plm.system.mapper.SrmPriceCompareMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—报价比价（对应报价比价）：
 * 比价记录登记、分页查询与删除。
 * 比价单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPriceCompareService {

    private static final String DEFAULT_COMPARE_NO_PREFIX = "CMP";
    private static final String DEFAULT_COMPARE_RULE = "LOWEST_PRICE";
    private static final String DEFAULT_COMPARE_STATUS = "DRAFT";

    private final SrmPriceCompareMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询比价记录：比价状态/询价单号精确，比价单号/询价单号/推荐供应商编码/推荐供应商名称/比价人模糊，按主键倒序。 */
    public PageResult<SrmPriceCompare> page(SrmPriceCompareQuery query) {
        Page<SrmPriceCompare> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPriceCompare>lambdaQuery()
                .eq(StringUtils.hasText(query.getCompareStatus()),
                        SrmPriceCompare::getCompareStatus, query.getCompareStatus())
                .eq(StringUtils.hasText(query.getRfqNo()),
                        SrmPriceCompare::getRfqNo, query.getRfqNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPriceCompare::getCompareNo, query.getKeyword()).or()
                        .like(SrmPriceCompare::getRfqNo, query.getKeyword()).or()
                        .like(SrmPriceCompare::getRecommendSupplierCode, query.getKeyword()).or()
                        .like(SrmPriceCompare::getRecommendSupplierName, query.getKeyword()).or()
                        .like(SrmPriceCompare::getCompareBy, query.getKeyword()))
                .orderByDesc(SrmPriceCompare::getId));
        return PageResult.of(page);
    }

    public SrmPriceCompare detail(Long id) {
        return require(id);
    }

    /** 新增或更新比价记录：新增时回填默认比价规则/比价状态与组织，比价单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPriceCompareSaveRequest request) {
        SrmPriceCompare entity;
        if (id == null) {
            entity = new SrmPriceCompare();
            entity.setCompareNo(StringUtils.hasText(request.getCompareNo())
                    ? request.getCompareNo() : flowSupport.nextBizNo(DEFAULT_COMPARE_NO_PREFIX));
            entity.setCompareRule(StringUtils.hasText(request.getCompareRule())
                    ? request.getCompareRule() : DEFAULT_COMPARE_RULE);
            entity.setCompareStatus(StringUtils.hasText(request.getCompareStatus())
                    ? request.getCompareStatus() : DEFAULT_COMPARE_STATUS);
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

    /** 删除比价记录：物理删除以释放比价单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPriceCompare require(Long id) {
        SrmPriceCompare entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "比价单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPriceCompare entity, SrmPriceCompareSaveRequest request) {
        if (StringUtils.hasText(request.getCompareNo())) {
            entity.setCompareNo(request.getCompareNo());
        }
        if (StringUtils.hasText(request.getRfqNo())) {
            entity.setRfqNo(request.getRfqNo());
        }
        if (StringUtils.hasText(request.getCompareTitle())) {
            entity.setCompareTitle(request.getCompareTitle());
        }
        if (request.getSupplierCount() != null) {
            entity.setSupplierCount(request.getSupplierCount());
        }
        if (request.getLowestPrice() != null) {
            entity.setLowestPrice(request.getLowestPrice());
        }
        if (request.getHighestPrice() != null) {
            entity.setHighestPrice(request.getHighestPrice());
        }
        if (request.getAvgPrice() != null) {
            entity.setAvgPrice(request.getAvgPrice());
        }
        if (StringUtils.hasText(request.getRecommendSupplierCode())) {
            entity.setRecommendSupplierCode(request.getRecommendSupplierCode());
        }
        if (StringUtils.hasText(request.getRecommendSupplierName())) {
            entity.setRecommendSupplierName(request.getRecommendSupplierName());
        }
        if (StringUtils.hasText(request.getCompareRule())) {
            entity.setCompareRule(request.getCompareRule());
        }
        if (StringUtils.hasText(request.getCompareConclusion())) {
            entity.setCompareConclusion(request.getCompareConclusion());
        }
        if (StringUtils.hasText(request.getCompareBy())) {
            entity.setCompareBy(request.getCompareBy());
        }
        if (request.getCompareDate() != null) {
            entity.setCompareDate(request.getCompareDate());
        }
        if (StringUtils.hasText(request.getCompareStatus())) {
            entity.setCompareStatus(request.getCompareStatus());
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
